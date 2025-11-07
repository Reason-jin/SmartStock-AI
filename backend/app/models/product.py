from sqlalchemy import Column, String, Integer, Float, ForeignKey
from sqlalchemy.orm import relationship
from .base import BaseModel


class Product(BaseModel):
    """제품/SKU 정보"""
    __tablename__ = "products"
    
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False, index=True, comment="소속 회사")
    sku = Column(String(100), nullable=False, index=True, comment="제품 코드")
    name = Column(String(255), nullable=False, comment="제품명")
    category = Column(String(100), comment="카테고리")
    brand = Column(String(100), comment="브랜드")
    unit_price = Column(Float, comment="단가")
    lead_time = Column(Integer, default=7, comment="리드타임(일)")
    
    # Relationship
    tenant = relationship("Tenant", backref="products")
    
    def __repr__(self):
        return f"<Product(id={self.id}, sku='{self.sku}', name='{self.name}')>"