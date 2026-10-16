from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from app.schemas.dealer import DealerRegisterRequest, DealerResponse
from app.services.dealer_service import dealer_service
from app.core.security import require_admin

router = APIRouter(tags=["Dealers"])

@router.post("/dealer/register")
def register_dealer(data: DealerRegisterRequest):
    """
    Public registration endpoint for dealers.
    Account starts in 'pending' status awaiting Admin approval.
    """
    return dealer_service.register_dealer(data)

@router.get("/admin/dealers", response_model=List[DealerResponse])
def list_dealers(
    status: Optional[str] = Query(None, description="Filter by status: pending, approved, rejected"),
    admin: dict = Depends(require_admin)
):
    """
    List registered dealers and their verification status (Admin only).
    """
    return dealer_service.list_dealers(status_filter=status)

@router.post("/admin/dealers/{dealer_id}/approve")
def approve_dealer(dealer_id: str, admin: dict = Depends(require_admin)):
    """
    Admin action: Accept/Approve a dealer registration.
    """
    return dealer_service.update_status(dealer_id=dealer_id, new_status="approved")

@router.post("/admin/dealers/{dealer_id}/reject")
def reject_dealer(dealer_id: str, admin: dict = Depends(require_admin)):
    """
    Admin action: Reject a dealer registration.
    """
    return dealer_service.update_status(dealer_id=dealer_id, new_status="rejected")
