from sqlalchemy import Column, String, Integer, Boolean, Text, ForeignKey
from sqlalchemy.orm import relationship
from .base import BaseModel

# 🔧 추가: 매퍼 초기화 전에 클래스 로드
from app.models.tenant import Tenant  # noqa: F401
from app.models.user import User      # noqa: F401

class UploadJob(BaseModel):
    """파일 업로드 작업 이력"""
    __tablename__ = "upload_jobs"
    
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False, index=True, comment="소속 회사")
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True, comment="업로드한 사용자")
    
    # 파일 정보
    original_filename = Column(String(255), nullable=False, comment="원본 파일명")
    stored_filename = Column(String(255), nullable=False, comment="저장된 파일명")
    file_size = Column(Integer, comment="파일 크기(bytes)")
    file_type = Column(String(50), comment="파일 타입(csv/xlsx)")
    encoding = Column(String(20), comment="파일 인코딩(utf-8/cp949)")
    
    # 업로드 상태
    status = Column(String(50), default="pending", nullable=False, comment="상태(pending/processing/completed/failed)")
    error_message = Column(Text, comment="에러 메시지")
    
    # 데이터 프로파일
    total_rows = Column(Integer, comment="총 행 수")
    total_columns = Column(Integer, comment="총 컬럼 수")
    null_count = Column(Integer, comment="결측치 개수")
    duplicate_count = Column(Integer, comment="중복 행 개수")
    profile_data = Column(Text, comment="프로파일 데이터(JSON)")
    
    # Relationships
    tenant = relationship("Tenant", backref="upload_jobs")
    user = relationship("User", backref="upload_jobs")
    
    def __repr__(self):
        return f"<UploadJob(id={self.id}, filename='{self.original_filename}', status='{self.status}')>"