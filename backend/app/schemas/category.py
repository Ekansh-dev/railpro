from pydantic import BaseModel
from typing import Optional

class CategoryCreateRequest(BaseModel):
    name: str

class CategoryResponse(BaseModel):
    id: str
    name: str
    is_inbuilt: bool
    created_at: Optional[str] = None
