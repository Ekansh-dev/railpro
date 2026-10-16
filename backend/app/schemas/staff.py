from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ManagerInviteRequest(BaseModel):
    name: str
    email: str

class StaffResponse(BaseModel):
    id: str
    name: str
    email: str
    role: str
    created_at: Optional[str] = None

class ManagerInviteResponse(BaseModel):
    message: str
    manager: StaffResponse
    temporary_password: str
