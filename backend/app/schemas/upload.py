from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime


class UploadJobResponse(BaseModel):
    """업로드 작업 응답"""
    id: int
    tenant_id: int
    original_filename: str
    stored_filename: str
    file_size: int
    file_type: str
    encoding: Optional[str]
    status: str
    total_rows: Optional[int]
    total_columns: Optional[int]
    null_count: Optional[int]
    duplicate_count: Optional[int]
    profile_data: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True


class UploadProfileResponse(BaseModel):
    """업로드 프로파일 응답"""
    upload_job: UploadJobResponse
    profile: Dict[str, Any]