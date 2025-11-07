from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """
    애플리케이션 설정 클래스
    .env 파일에서 환경변수를 자동으로 읽어옵니다
    """

    # 애플리케이션 기본 정보
    APP_NAME: str = "SmartStock AI"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True
    API_PREFIX: str = "/api/v1"

    # 데이터베이스 설정
    DB_HOST: str = "database-1.cx22k0uy6498.ap-northeast-2.rds.amazonaws.com"
    DB_PORT: int = 3306
    DB_USER: str = "admin"
    DB_PASSWORD: str = "dbsdk4757"
    DB_NAME: str = "smartstock"

    # 보안 설정
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # ✅ OpenAI API 설정 추가
    OPENAI_API_KEY: Optional[str] = None

    # 데이터베이스 URL 자동 생성
    @property
    def DATABASE_URL(self) -> str:
        return (
            f"mysql+pymysql://{self.DB_USER}:{self.DB_PASSWORD}"
            f"@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"
        )

    # 프로젝트 다른 부분이 이 이름을 쓸 수도 있어서 호환용으로 제공
    @property
    def SQLALCHEMY_DATABASE_URI(self) -> str:
        return self.DATABASE_URL

    class Config:
        env_file = ".env"
        case_sensitive = True
        # ✅ 정의되지 않은 필드 허용 (미래 확장성)
        extra = "ignore"


# 전역 설정 객체
settings = Settings()