from pydantic import BaseModel
from typing import Optional, Dict, Any

class ProductReviewRequest(BaseModel):
    action: str  # "approve" or "reject"
    rejection_reason: Optional[str] = None

class ProductResponse(BaseModel):
    id: str
    dealer_id: str
    name: str
    category: str
    price: float
    description: Optional[str] = None
    image_url: Optional[str] = None
    status: str
    rejection_reason: Optional[str] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None
    dealers: Optional[Dict[str, Any]] = None
