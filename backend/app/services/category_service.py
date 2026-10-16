from typing import List, Dict, Any
from fastapi import HTTPException, status
from app.database import supabase
from app.schemas.category import CategoryResponse

class CategoryService:
    @staticmethod
    def list_categories() -> List[Dict[str, Any]]:
        """List all categories, with inbuilt categories prioritized."""
        result = supabase.table("categories").select("*").order("is_inbuilt", desc=True).order("name").execute()
        return result.data

    @staticmethod
    def get_or_create_custom_category(name: str) -> Dict[str, Any]:
        """Check if category exists; if not, create as custom category (is_inbuilt = False)."""
        clean_name = name.strip()
        if not clean_name:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Category name cannot be empty."
            )

        existing = supabase.table("categories").select("*").ilike("name", clean_name).execute()
        if existing.data:
            return existing.data[0]

        res = supabase.table("categories").insert({
            "name": clean_name,
            "is_inbuilt": False
        }).execute()

        if not res.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to register custom category."
            )

        return res.data[0]

category_service = CategoryService()
