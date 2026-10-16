from fastapi import APIRouter, Depends
from app.schemas.auth import LoginRequest, TokenResponse
from app.services.auth_service import auth_service
from app.core.security import get_current_user

router = APIRouter(tags=["Authentication"])

@router.post("/auth/login", response_model=TokenResponse)
def login(data: LoginRequest):
    """
    Unified login endpoint for Dealers, Admins, and Managers.
    """
    return auth_service.login(data)

@router.get("/auth/me")
def get_profile(current_user: dict = Depends(get_current_user)):
    """
    Get profile details for the authenticated session.
    """
    return {"user": current_user}

# Backward compatibility routes
@router.post("/dealer/login", response_model=TokenResponse)
def dealer_login(data: LoginRequest):
    data.role = "dealer"
    return auth_service.login(data)

@router.post("/admin/login", response_model=TokenResponse)
def admin_login(data: LoginRequest):
    data.role = "admin"
    return auth_service.login(data)
