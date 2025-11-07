from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from .config import settings

# 데이터베이스 엔진 생성
engine = create_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG,  # SQL 쿼리 로깅 (개발 모드에서만)
    pool_pre_ping=True,   # 연결 상태 자동 확인
    pool_recycle=3600,    # 1시간마다 연결 재생성
)

# 세션 팩토리
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# ORM 베이스 클래스
Base = declarative_base()


# 의존성 주입용 DB 세션 생성기
def get_db():
    """
    FastAPI 의존성 주입에서 사용할 DB 세션 생성기
    요청마다 새로운 세션을 생성하고, 요청 종료 시 자동으로 닫습니다
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()