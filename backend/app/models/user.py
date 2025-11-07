from sqlalchemy import Column, String, Boolean, Integer, ForeignKey
from sqlalchemy.orm import relationship
from .base import BaseModel


class User(BaseModel):
    """사용자 정보"""
    __tablename__ = "users"
    
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False, index=True, comment="소속 회사")
    email = Column(String(255), unique=True, nullable=False, index=True, comment="이메일")
    username = Column(String(100), nullable=False, comment="사용자명")
    hashed_password = Column(String(255), nullable=False, comment="암호화된 비밀번호")
    role = Column(String(50), default="user", nullable=False, comment="권한 (admin/planner/buyer/manager/user)")
    is_active = Column(Boolean, default=True, nullable=False, comment="활성화 여부")
    
    # Relationship
    tenant = relationship("Tenant", backref="users")
    
    def __repr__(self):
        return f"<User(id={self.id}, email='{self.email}', role='{self.role}')>"