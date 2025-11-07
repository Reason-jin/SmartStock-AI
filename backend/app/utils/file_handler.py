import os
import hashlib
import pandas as pd
from pathlib import Path
from datetime import datetime
from typing import Dict, Any, Optional


class FileHandler:
    """파일 업로드 및 처리 유틸리티"""
    
    def __init__(self, upload_dir: str = "uploads"):
        self.upload_dir = Path(upload_dir)
        self.upload_dir.mkdir(exist_ok=True)
    
    def generate_unique_filename(self, original_filename: str) -> str:
        """고유한 파일명 생성"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        name, ext = os.path.splitext(original_filename)
        return f"{timestamp}_{name}{ext}"
    
    def calculate_checksum(self, file_path: Path) -> str:
        """파일 체크섬 계산 (MD5)"""
        md5 = hashlib.md5()
        with open(file_path, 'rb') as f:
            for chunk in iter(lambda: f.read(4096), b""):
                md5.update(chunk)
        return md5.hexdigest()
    
    def detect_encoding(self, file_path: Path) -> str:
        """파일 인코딩 감지"""
        encodings = ['utf-8', 'cp949', 'euc-kr', 'latin1']
        
        for encoding in encodings:
            try:
                with open(file_path, 'r', encoding=encoding) as f:
                    f.read(1024)  # 일부만 읽어서 테스트
                return encoding
            except UnicodeDecodeError:
                continue
        
        return 'utf-8'  # 기본값
    
    def read_file(self, file_path: Path, encoding: Optional[str] = None) -> pd.DataFrame:
        """파일 읽기 (CSV/Excel)"""
        file_ext = file_path.suffix.lower()
        
        if file_ext == '.csv':
            if encoding is None:
                encoding = self.detect_encoding(file_path)
            return pd.read_csv(file_path, encoding=encoding)
        
        elif file_ext in ['.xlsx', '.xls']:
            return pd.read_excel(file_path)
        
        else:
            raise ValueError(f"Unsupported file type: {file_ext}")
    
    def profile_data(self, df: pd.DataFrame) -> Dict[str, Any]:
        """데이터 프로파일링"""
        profile = {
            "shape": df.shape,
            "total_rows": len(df),
            "total_columns": len(df.columns),
            "columns": df.columns.tolist(),
            "dtypes": df.dtypes.astype(str).to_dict(),
            "null_count": int(df.isnull().sum().sum()),
            "null_by_column": df.isnull().sum().to_dict(),
            "duplicate_count": int(df.duplicated().sum()),
            "memory_usage": int(df.memory_usage(deep=True).sum()),
            "head": df.head(5).to_dict(orient='records'),
            "statistics": {}
        }
        
        # 숫자 컬럼 통계
        numeric_cols = df.select_dtypes(include=['number']).columns
        if len(numeric_cols) > 0:
            profile["statistics"]["numeric"] = df[numeric_cols].describe().to_dict()
        
        return profile