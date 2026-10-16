from typing import List
from fastapi import APIRouter, Depends
from app.schemas.staff import ManagerInviteRequest, ManagerInviteResponse, StaffResponse
from app.services.staff_service import staff_service
from app.core.security import require_admin

router = APIRouter(prefix="/admin/managers", tags=["Staff & Managers"])

@router.get("", response_model=List[StaffResponse])
def list_managers(admin: dict = Depends(require_admin)):
    """
    List all managers (Admin only).
    """
    return staff_service.list_managers()

@router.post("/invite", response_model=ManagerInviteResponse)
def invite_manager(data: ManagerInviteRequest, admin: dict = Depends(require_admin)):
    """
    Invite a manager: auto-creates account in DB and generates a secure password (Admin only).
    """
    return staff_service.invite_manager(name=data.name, email=data.email)

@router.delete("/{manager_id}")
def delete_manager(manager_id: str, admin: dict = Depends(require_admin)):
    """
    Remove a manager account (Admin only).
    """
    current_admin_id = admin.get("staff_id", "")
    return staff_service.delete_manager(manager_id=manager_id, current_admin_id=current_admin_id)
