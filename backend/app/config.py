import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    PROJECT_NAME: str = "RailSupply API"
    VERSION: str = "2.0.4"
    
    # Active Supabase fallback project credentials
    FALLBACK_SUPABASE_URL = "https://cnqhtskztbjqsohcsljc.supabase.co"
    FALLBACK_SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNucWh0c2t6dGJqcXNvaGNzbGpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIxMzQxNDAsImV4cCI6MjEwNzcxMDE0MH0.7n20Fp8DhvTMmvIJn3xRoXRkfYbyWtiRZ5j-jGsBZt8"
    FALLBACK_SUPABASE_SECRET = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNucWh0c2t6dGJqcXNvaGNzbGpjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MjEzNDE0MCwiZXhwIjoyMTA3NzEwMTQwfQ.xUOOtXBmQl5dfpY1yk9lkY3c6AttGu_wkDRpMNLphO0"

    _raw_url = os.getenv("SUPABASE_URL", "").strip().strip("'\"")
    if not _raw_url or "kdblxikycbdrhpscmbwe" in _raw_url or "your-project-id" in _raw_url:
        SUPABASE_URL: str = FALLBACK_SUPABASE_URL
        SUPABASE_KEY: str = FALLBACK_SUPABASE_KEY
        SUPABASE_SECRET_KEY: str = FALLBACK_SUPABASE_SECRET
    else:
        SUPABASE_URL: str = _raw_url
        SUPABASE_KEY: str = os.getenv("SUPABASE_KEY", FALLBACK_SUPABASE_KEY).strip().strip("'\"")
        SUPABASE_SECRET_KEY: str = os.getenv("SUPABASE_SECRET_KEY", FALLBACK_SUPABASE_SECRET).strip().strip("'\"")
    
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
