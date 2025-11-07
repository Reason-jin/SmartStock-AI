from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware

import app.models  # 모든 모델 매퍼를 미리 로드(중요)

from sqlalchemy.orm import Session
from sqlalchemy import text
from app.core.database import get_db
from app.routers import upload, analytics, prediction, chatbot_api
from pathlib import Path
from fastapi.staticfiles import StaticFiles


app = FastAPI(
    title="SmartStock AI",
    description="AI 기반 재고관리 SaaS 플랫폼",
    version="1.0.0"
)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ========== 라우터 등록 ==========
app.include_router(upload.router, prefix="/api/v1", tags=["upload"])
app.include_router(analytics.router, prefix="/api/v1/analytics", tags=["analytics"])
app.include_router(prediction.router, prefix="/api/v1/prediction", tags=["prediction"])
app.include_router(chatbot_api.router, prefix="/api/v1/chatbot", tags=["chatbot"])

# ================================

@app.get("/health")
async def health_check(db: Session = Depends(get_db)):
    """서버 및 DB 연결 상태 확인"""
    try:
        db.execute(text("SELECT 1"))
        db_status = "connected ✅"
    except Exception as e:
        db_status = f"error: {str(e)}"
    
    return {
        "status": "healthy",
        "message": "SmartStock AI is running!",
        "version": "1.0.0",
        "database": db_status
    }

@app.get("/")
async def root():
    return {
        "message": "Welcome to SmartStock AI API",
        "docs": "/docs",
        "redoc": "/redoc"
    }

# ===== [2] 업로드 폴더 설정 =====
UPLOAD_DIR = Path(__file__).resolve().parent.parent / "uploads"


# ===== [3] 업로드 폴더를 정적 폴더로 서빙 =====
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# ===== [4] 업로드 폴더 내 파일 목록 반환 API =====
@app.get("/api/files")
async def list_upload_files():
    files = []
    for f in UPLOAD_DIR.iterdir():
        # 숨김 파일(이름이 '.'으로 시작하는 파일)은 제외
        if f.is_file() and not f.name.startswith('.'):
            files.append({
                "filename": f.name,
                "size_kb": round(f.stat().st_size / 1024, 2),
                "url": f"/uploads/{f.name}"
            })
    return {"files": files}

