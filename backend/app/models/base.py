from datetime import datetime
from sqlalchemy import Column, Integer, DateTime
from app.core.database import Base


class TimestampMixin:
    """생성/수정 시간을 자동으로 추가하는 Mixin"""
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)


class BaseModel(Base, TimestampMixin):
    """모든 모델의 베이스 클래스"""
    __abstract__ = True
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)