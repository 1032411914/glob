from typing import List
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # 应用配置
    APP_NAME: str = "博客系统"
    APP_VERSION: str = "1.0.0"
    
    # 数据库配置
    DATABASE_URL: str = "mysql+pymysql://root:FSJfsj971208@localhost:3306/MySQL96"
    
    # CORS配置
    CORS_ORIGINS: List[str] = ["*"]
    
    # 安全配置
    SECRET_KEY: str = "your-secret-key"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    class Config:
        env_file = ".env"


settings = Settings()