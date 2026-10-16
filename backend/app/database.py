from supabase import create_client, Client
from app.config import settings

def get_supabase_client() -> Client:
    if not settings.SUPABASE_URL:
        raise RuntimeError("SUPABASE_URL environment variable is not configured.")
    
    key = settings.SUPABASE_SECRET_KEY or settings.SUPABASE_KEY
    if not key:
        raise RuntimeError("SUPABASE_KEY or SUPABASE_SECRET_KEY is not configured.")
        
    return create_client(settings.SUPABASE_URL, key)

supabase: Client = get_supabase_client()
