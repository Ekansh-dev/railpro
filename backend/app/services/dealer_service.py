from typing import List, Dict, Any, Optional
from fastapi import HTTPException, status
from app.database import supabase
from app.core.security import hash_password
from app.schemas.dealer import DealerRegisterRequest

class DealerService:
    @staticmethod
    def register_dealer(data: DealerRegisterRequest) -> Dict[str, str]:
        email = data.email.strip().lower()

        # Check existing dealer
        existing = supabase.table("dealers").select("id").ilike("email", email).execute()
        if existing.data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A dealer with this email is already registered."
            )

        insert_data = {
            "name": data.name.strip(),
            "shop_name": data.shop_name.strip(),
            "email": email,
            "password_hash": hash_password(data.password),
            "phone": data.phone.strip(),
            "city": data.city.strip(),
            "address": data.address.strip(),
            "status": "pending",  # Requires Admin acceptance
        }

        res = supabase.table("dealers").insert(insert_data).execute()
        if not res.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to register dealer."
            )

        return {
            "message": "Registration submitted successfully! Your account is pending admin verification."
        }

    @staticmethod
    def list_dealers(status_filter: Optional[str] = None) -> List[Dict[str, Any]]:
        """List dealers, optionally filtered by status ('pending', 'approved', 'rejected')."""
        query = supabase.table("dealers").select("id, name, shop_name, email, phone, city, address, status, created_at")
        if status_filter:
            query = query.eq("status", status_filter.lower())
        query = query.order("created_at", desc=True)
        result = query.execute()
        return result.data

    @staticmethod
    def update_status(dealer_id: str, new_status: str) -> Dict[str, str]:
        """Admin action: Accept (approve) or Reject dealer."""
        if new_status not in ["approved", "rejected"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Status must be either 'approved' or 'rejected'."
            )

        # Check dealer exists
        check = supabase.table("dealers").select("id, name, email").eq("id", dealer_id).execute()
        if not check.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Dealer not found."
            )

        supabase.table("dealers").update({"status": new_status}).eq("id", dealer_id).execute()
        action_word = "accepted" if new_status == "approved" else "rejected"
        return {"message": f"Dealer '{check.data[0]['name']}' has been {action_word}."}

dealer_service = DealerService()
