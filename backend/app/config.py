import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    PROJECT_NAME: str = "RailSupply API"
    VERSION: str = "2.0.3"
    
    # Supabase credentials loaded from .env (local) or cloud environment (Render)
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "https://your-project-id.supabase.co").strip().strip("'\"")
    SUPABASE_KEY: str = os.getenv("SUPABASE_KEY", "your-supabase-anon-key-placeholder").strip().strip("'\"")
    SUPABASE_SECRET_KEY: str = os.getenv("SUPABASE_SECRET_KEY", "your-supabase-service-role-key-placeholder").strip().strip("'\"")
    
    SECRET_KEY: str = os.getenv("SECRET_KEY", "default-fallback-secret-key-change-me").strip().strip("'\"")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_DAYS: int = 7
    
    ALLOWED_ORIGINS: list = [
        "https://railpro-wine.vercel.app",
        "https://railpro-liart.vercel.app",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*",  # Allow any during development
    ]

settings = Settings()
