from sqlalchemy import Column, String, Boolean
from .base import BaseModel


class Tenant(BaseModel):
    """고객사/회사 정보"""
    __tablename__ = "tenants"
    
    name = Column(String(100), nullable=False, comment="회사명")
    code = Column(String(50), unique=True, nullable=False, index=True, comment="회사 코드")
    is_active = Column(Boolean, default=True, nullable=False, comment="활성화 여부")
    
    def __repr__(self):
        return f"<Tenant(id={self.id}, name='{self.name}', code='{self.code}')>"