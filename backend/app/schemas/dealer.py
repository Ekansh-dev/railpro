from pydantic import BaseModel
from typing import Optional

class DealerRegisterRequest(BaseModel):
    name: str
    shop_name: str
    email: str
    password: str
    phone: str
    city: str
    address: str

class DealerResponse(BaseModel):
    id: str
    name: str
    shop_name: str
    email: str
    phone: str
    city: str
    address: str
    status: str
    created_at: Optional[str] = None

class DealerStatusUpdate(BaseModel):
    status: str  # 'approved' or 'rejected'
