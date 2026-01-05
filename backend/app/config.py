# app/config.py
from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    """Application settings loaded from .env file"""
    
    # App
    APP_NAME: str = "NIC Bank API"
    DEBUG: bool = True
    API_VERSION: str = "v1"
    
    # Database
    DATABASE_URL: str
    
    # JWT
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # CORS
    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:5174"
    
    @property
    def cors_origins_list(self) -> List[str]:
        """Convert comma-separated CORS origins to list"""
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]
    
    class Config:
        env_file = ".env"
        case_sensitive = True

# Create settings instance
settings = Settings()

# 🔍 DEBUG: Print loaded settings
print("\n" + "="*60)
print("🔧 CONFIGURATION LOADED FROM .env")
print("="*60)
print(f"📱 APP_NAME: {settings.APP_NAME}")
print(f"📊 DATABASE_URL: {settings.DATABASE_URL[:45]}...")
print(f"🔑 SECRET_KEY: {settings.SECRET_KEY[:15]}... (length: {len(settings.SECRET_KEY)})")
print(f"🔐 ALGORITHM: {settings.ALGORITHM}")
print(f"⏱️  TOKEN EXPIRE: {settings.ACCESS_TOKEN_EXPIRE_MINUTES} minutes")
print(f"🌐 CORS: {settings.CORS_ORIGINS}")
print("="*60 + "\n")