import json
import pandas as pd  # 추가!!!
from pathlib import Path
from typing import Dict, Any
from datetime import datetime, date
from sqlalchemy.orm import Session
from fastapi import UploadFile

from app.models.upload_job import UploadJob
from app.utils.file_handler import FileHandler


class UploadService:
    """파일 업로드 서비스"""
    
    def __init__(self, db: Session):
        self.db = db
        self.file_handler = FileHandler(upload_dir="uploads")
    
    async def save_uploaded_file(self, file: UploadFile, upload_path: Path) -> int:
        """업로드된 파일을 저장"""
        with open(upload_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        return len(content)
    
    async def process_upload(
        self, 
        file: UploadFile, 
        tenant_id: int,
        user_id: int = None
    ) -> UploadJob:
        """파일 업로드 처리"""
        
        from app.models.product import Product
        from app.models.sales import Sales

        # 1. 고유 파일명 생성
        stored_filename = self.file_handler.generate_unique_filename(file.filename)
        upload_path = self.file_handler.upload_dir / stored_filename
        
        # 2. DB에 업로드 작업 생성 (pending 상태)
        upload_job = UploadJob(
            tenant_id=tenant_id,
            user_id=user_id,
            original_filename=file.filename,
            stored_filename=stored_filename,
            file_type=Path(file.filename).suffix.lower().replace('.', ''),
            status="pending"
        )
        self.db.add(upload_job)
        self.db.commit()
        self.db.refresh(upload_job)
        
        try:
            # 3. 파일 저장
            upload_job.status = "processing"
            self.db.commit()
            
            file_size = await self.save_uploaded_file(file, upload_path)
            upload_job.file_size = file_size
            
            # 4. 파일 읽기 및 프로파일링
            encoding = self.file_handler.detect_encoding(upload_path)
            upload_job.encoding = encoding
            
            df = self.file_handler.read_file(upload_path, encoding)
            profile = self.file_handler.profile_data(df)
            
            required = {"sale_date", "sku", "quantity"}
            if required.issubset(set(map(str.lower, df.columns))):
                df.columns = [c.lower() for c in df.columns]
                sku_to_id = {}
                for sku in df["sku"].unique():
                    p = self.db.query(Product).filter_by(tenant_id=tenant_id, sku=sku).first()
                    if not p:
                        p = Product(tenant_id=tenant_id, sku=sku, name=sku)
                        self.db.add(p)
                        self.db.flush()
                    sku_to_id[sku] = p.id

                sales_rows = []
                for _, row in df.iterrows():
                    # Timestamp를 Python date 객체로 변환 (핵심 수정!)
                    sale_date_value = row["sale_date"]
                    if isinstance(sale_date_value, pd.Timestamp):
                        sale_date_value = sale_date_value.date()
                    elif isinstance(sale_date_value, str):
                        sale_date_value = pd.to_datetime(sale_date_value).date()
                    elif not isinstance(sale_date_value, date):
                        sale_date_value = pd.to_datetime(sale_date_value).date()
                    
                    # revenue 안전하게 처리
                    revenue_value = row.get("revenue")
                    if revenue_value is None or pd.isna(revenue_value):
                        revenue_value = 0.0
                    else:
                        revenue_value = float(revenue_value)
                    
                    sales_rows.append(Sales(
                        tenant_id=tenant_id,
                        product_id=sku_to_id[row["sku"]],
                        sale_date=sale_date_value,  # Python date 객체
                        quantity=float(row["quantity"]),
                        revenue=revenue_value
                    ))
                
                self.db.bulk_save_objects(sales_rows)
                self.db.commit()

            # 5. 프로파일 정보 저장
            upload_job.total_rows = profile["total_rows"]
            upload_job.total_columns = profile["total_columns"]
            upload_job.null_count = profile["null_count"]
            upload_job.duplicate_count = profile["duplicate_count"]
            
            # profile 데이터에 Timestamp가 있을 수 있으므로 변환
            profile_json = self._serialize_profile(profile)
            upload_job.profile_data = json.dumps(profile_json, ensure_ascii=False)
            upload_job.status = "completed"
            
            self.db.commit()
            self.db.refresh(upload_job)
            
            return upload_job
            
        except Exception as e:
            # 에러 발생 시 상태 업데이트
            upload_job.status = "failed"
            upload_job.error_message = str(e)
            self.db.commit()
            
            # 디버깅을 위한 로그
            import traceback
            print(f"Upload error: {traceback.format_exc()}")
            
            raise e
    
    def _serialize_profile(self, profile: Dict[str, Any]) -> Dict[str, Any]:
        """
        프로파일 데이터를 JSON 직렬화 가능하도록 변환
        """
        def convert_value(value):
            if isinstance(value, (pd.Timestamp, datetime)):
                return value.isoformat()
            elif isinstance(value, date):
                return value.isoformat()
            elif isinstance(value, (pd.Series, pd.DataFrame)):
                return value.to_dict()
            elif isinstance(value, dict):
                return {k: convert_value(v) for k, v in value.items()}
            elif isinstance(value, list):
                return [convert_value(item) for item in value]
            elif pd.isna(value):
                return None
            else:
                return value
        
        return convert_value(profile)
    
    def get_upload_job(self, upload_job_id: int, tenant_id: int) -> UploadJob:
        """업로드 작업 조회"""
        return self.db.query(UploadJob).filter(
            UploadJob.id == upload_job_id,
            UploadJob.tenant_id == tenant_id
        ).first()
    
    def get_upload_profile(self, upload_job_id: int, tenant_id: int) -> Dict[str, Any]:
        """업로드 프로파일 조회"""
        upload_job = self.get_upload_job(upload_job_id, tenant_id)
        if not upload_job:
            return None
        
        profile = json.loads(upload_job.profile_data) if upload_job.profile_data else {}
        
        return {
            "upload_job": upload_job,
            "profile": profile
        }