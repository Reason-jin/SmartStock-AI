from sqlalchemy import Column, String, Integer, Float, Date, ForeignKey
from sqlalchemy.orm import relationship
from .base import BaseModel


class Sales(BaseModel):
    """판매 데이터"""
    __tablename__ = "sales"
    
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False, index=True, comment="소속 회사")
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False, index=True, comment="제품")
    sale_date = Column(Date, nullable=False, index=True, comment="판매일")
    quantity = Column(Float, nullable=False, comment="판매량")
    revenue = Column(Float, comment="매출액")
    
    # Relationship
    tenant = relationship("Tenant", backref="sales")
    product = relationship("Product", backref="sales")
    
    def __repr__(self):
        return f"<Sales(id={self.id}, date={self.sale_date}, quantity={self.quantity})>"