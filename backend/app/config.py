import os
from pydantic import BaseModel

class Settings(BaseModel):
    PROJECT_NAME: str = "Institutional HFT Quantitative Platform"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    
    # Secret Key for JWT & Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "quant_secret_jwt_key_2026_hft_secure_898110c4")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    # Database URIs
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./data/quant_platform.db")
    
    # Celery & Redis
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    CELERY_BROKER_URL: str = os.getenv("CELERY_BROKER_URL", "redis://localhost:6379/0")
    CELERY_RESULT_BACKEND: str = os.getenv("CELERY_RESULT_BACKEND", "redis://localhost:6379/0")
    
    # Data Storage Paths
    DATA_DIR: str = os.getenv("DATA_DIR", "data")
    PARQUET_OUTPUT_DIR: str = os.getenv("PARQUET_OUTPUT_DIR", "data")
    
    # Trading Friction Settings
    DEFAULT_TAKER_FEE: float = 0.002
    DEFAULT_ROUND_TRIP_FRICTION: float = 0.004

settings = Settings()
