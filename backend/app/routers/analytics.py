from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from datetime import date, timedelta
from app.core.database import get_db
from app.models.sales import Sales
from app.models.product import Product

router = APIRouter()

@router.get("/summary")
async def get_analytics_summary(tenant_id: int = 1, months: int = 6, db: Session = Depends(get_db)):
    # 최근 months개월 기준
    end = date.today().replace(day=1)
    start = (end - timedelta(days=months*31)).replace(day=1)

    q = (
        db.query(
            extract('year', Sales.sale_date).label('y'),
            extract('month', Sales.sale_date).label('m'),
            func.sum(Sales.quantity).label('qty')
        )
        .filter(Sales.tenant_id == tenant_id, Sales.sale_date >= start, Sales.sale_date < end)
        .group_by('y','m')
        .order_by('y','m')
    ).all()

    # 월 라벨 & 실제수요
    month_rows = []
    for y, m, qty in q:
        month_rows.append({
            "month": f"{int(m)}월",
            "실제수요": float(qty or 0.0)
        })

    # 간이 예측/재고(임시 규칙)
    for r in month_rows:
        actual = r["실제수요"]
        r["AI예측"] = round(actual * 0.97, 2)  # 간이
        r["재고"] = max(round(actual * 0.6), 0) # 간이

    # KPI 임시 산출
    total_actual = sum(r["실제수요"] for r in month_rows) or 1
    total_forecast = sum(r["AI예측"] for r in month_rows) or 1
    wape = abs(total_actual - total_forecast) / total_actual * 100
    kpi = {
        "accuracy": max(0.0, 100 - wape),
        "wape": round(wape, 2),
        "stock_alerts": 0,
        "total_value": 0
    }

    return {"chart_data": month_rows, "kpi": kpi}

@router.get("/products")
async def get_top_products(tenant_id: int = 1, months: int = 3, top_n: int = 10, db: Session = Depends(get_db)):
    end = date.today().replace(day=1)
    start = (end - timedelta(days=months*31)).replace(day=1)

    q = (
        db.query(
            Product.name.label("name"),
            func.sum(Sales.quantity).label("qty")
        )
        .join(Product, Product.id == Sales.product_id)
        .filter(Sales.tenant_id == tenant_id, Sales.sale_date >= start, Sales.sale_date < end)
        .group_by(Product.name)
        .order_by(func.sum(Sales.quantity).desc())
        .limit(top_n)
    ).all()

    rows = []
    for name, qty in q:
        forecast = round(float(qty or 0.0) * 0.95, 2)   # 간이
        stock = max(int(forecast * 0.6), 0)            # 간이
        status = "부족" if stock < forecast*0.8 else ("심각" if stock < forecast*0.5 else "적정")
        rows.append({"name": name, "forecast": forecast, "stock": stock, "status": status})
    return rows
