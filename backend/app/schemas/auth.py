from pydantic import BaseModel, EmailStr
from typing import Optional, Dict, Any

class LoginRequest(BaseModel):
    email: str
    password: str
    role: str = "dealer"  # "dealer", "admin", or "manager"

class TokenResponse(BaseModel):
    token: str
    role: str
    user: Dict[str, Any]
