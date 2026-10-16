from typing import List
from fastapi import APIRouter, Depends
from app.schemas.category import CategoryCreateRequest, CategoryResponse
from app.services.category_service import category_service
from app.core.security import get_current_user

router = APIRouter(prefix="/categories", tags=["Categories"])

@router.get("", response_model=List[CategoryResponse])
def get_categories():
    """
    Get all categories (inbuilt categories followed by custom categories).
    """
    return category_service.list_categories()

@router.post("", response_model=CategoryResponse)
def create_custom_category(data: CategoryCreateRequest, user: dict = Depends(get_current_user)):
    """
    Add a custom category (is_inbuilt = False).
    """
    return category_service.get_or_create_custom_category(data.name)
