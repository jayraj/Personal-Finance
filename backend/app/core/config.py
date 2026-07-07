from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    APP_NAME: str = "Personal Finance API"
    DEBUG: bool = True

    DATABASE_URL: str = "postgresql+asyncpg://pfin:pfin@localhost:5432/pfin"
    REDIS_URL: str = "redis://localhost:6379/0"

    JWT_SECRET_KEY: str = "change-me-in-production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30

    S3_ENDPOINT: str = "http://localhost:9000"
    S3_ACCESS_KEY: str = "minioadmin"
    S3_SECRET_KEY: str = "minioadmin"
    S3_BUCKET: str = "pfin-uploads"
    S3_REGION: str = "us-east-1"
    S3_PUBLIC_URL: str = "http://localhost:9000"

    EMAIL_FROM: str = "noreply@pfin.app"
    EMAIL_PROVIDER: str = "resend"
    EMAIL_API_KEY: str = ""

    CORS_ORIGINS: list[str] = ["http://localhost:5173"]

    RATE_LIMIT_ATTEMPTS: int = 5
    RATE_LIMIT_WINDOW_MINUTES: int = 15

    model_config = {"env_file": ".env", "case_sensitive": True}


settings = Settings()
