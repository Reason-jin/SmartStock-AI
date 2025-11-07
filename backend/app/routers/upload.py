from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.models.upload_job import UploadJob
from app.core.database import get_db
from app.services.upload_service import UploadService
from app.schemas.upload import UploadJobResponse, UploadProfileResponse
from pathlib import Path
import os


router = APIRouter(prefix="/upload")

# 상수
MAX_FILE_SIZE = 100 * 1024 * 1024  # 100MB
ALLOWED_EXTENSIONS = {'.csv', '.xlsx', '.xls'}


@router.post("/", response_model=UploadJobResponse, status_code=status.HTTP_201_CREATED)
async def upload_file(
    file: UploadFile = File(...),
    tenant_id: int = 1,
    db: Session = Depends(get_db)
):
    """파일 업로드 API"""
    
    # 파일명 검증
    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="파일명이 없습니다"
        )
    
    # 확장자 검증
    file_ext = f".{file.filename.split('.')[-1].lower()}"
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"지원하지 않는 파일 형식입니다. 허용: {', '.join(ALLOWED_EXTENSIONS)}"
        )
    
    # 파일 크기 검증
    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="파일 크기는 100MB를 초과할 수 없습니다"
        )
    await file.seek(0)
    
    # 파일 처리
    service = UploadService(db)
    try:
        upload_job = await service.process_upload(file, tenant_id)
        return upload_job  # Pydantic 스키마를 직접 반환
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"파일 업로드 중 오류 발생: {str(e)}"
        )


@router.get("/{upload_job_id}", response_model=UploadProfileResponse)
def get_upload_profile(
    upload_job_id: int,
    tenant_id: int = 1,
    db: Session = Depends(get_db)
):
    """업로드된 파일의 프로파일 조회"""
    service = UploadService(db)
    result = service.get_upload_profile(upload_job_id, tenant_id)
    
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="업로드 작업을 찾을 수 없습니다"
        )
    
    return result  # Pydantic 스키마를 직접 반환


@router.get("/", response_model=List[UploadJobResponse])
def list_uploads(
    tenant_id: int = 1,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """업로드 이력 목록 조회"""
    from app.models.upload_job import UploadJob
    
    limit = min(limit, 100)
    
    uploads = db.query(UploadJob).filter(
        UploadJob.tenant_id == tenant_id
    ).order_by(
        UploadJob.created_at.desc()
    ).offset(skip).limit(limit).all()
    
    # List comprehension으로 Pydantic 스키마 변환
    return [UploadJobResponse.model_validate(upload) for upload in uploads]


UPLOAD_DIR = Path(__file__).resolve().parent.parent.parent / "uploads"
@router.delete("/{stored_filename}", status_code=status.HTTP_204_NO_CONTENT)
def delete_upload(
    stored_filename: str,
    tenant_id: int = 1,
    db: Session = Depends(get_db)
):
    """stored_filename 기준으로 업로드 작업 및 실제 파일 삭제"""

    # DB에서 해당 항목 조회
    upload = db.query(UploadJob).filter(
        UploadJob.stored_filename == stored_filename,
        UploadJob.tenant_id == tenant_id
    ).first()

    if not upload:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"stored_name '{stored_filename}'에 해당하는 업로드 작업을 찾을 수 없습니다."
        )

    # 실제 파일 경로
    file_path = UPLOAD_DIR / stored_filename

    try:
        # 1️⃣ 실제 파일 삭제
        if file_path.exists() and file_path.is_file():
            os.remove(file_path)

        # 2️⃣ DB 레코드 삭제
        db.delete(upload)
        db.commit()

    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"삭제 중 오류 발생: {str(e)}"
        )

    return None


