from typing import List, Dict, Any
from fastapi import HTTPException, status
from app.database import supabase
from app.core.security import hash_password
from app.core.utils import generate_secure_password
from app.schemas.staff import StaffResponse, ManagerInviteResponse

class StaffService:
    @staticmethod
    def list_managers() -> List[Dict[str, Any]]:
        """List all managers."""
        result = supabase.table("staff").select("id, name, email, role, created_at").eq("role", "manager").order("created_at", desc=True).execute()
        return result.data

    @staticmethod
    def invite_manager(name: str, email: str) -> ManagerInviteResponse:
        """
        Auto-create manager account in DB, generate secure temporary password.
        """
        clean_email = email.strip().lower()
        clean_name = name.strip()

        # Check for existing email in staff table
        existing = supabase.table("staff").select("id").ilike("email", clean_email).execute()
        if existing.data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"A staff member with email '{clean_email}' already exists."
            )

        # Generate temporary password
        temp_password = generate_secure_password(10)
        pwd_hash = hash_password(temp_password)

        # Insert new manager
        insert_res = supabase.table("staff").insert({
            "name": clean_name,
            "email": clean_email,
            "password_hash": pwd_hash,
            "role": "manager",
        }).execute()

        if not insert_res.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create manager account."
            )

        created_manager = insert_res.data[0]

        # NOTE: If an SMTP or email service (e.g. Resend) is configured, trigger the email dispatch here.
        # We return the temporary password so the Admin can view/copy it immediately in the UI.
        return ManagerInviteResponse(
            message=f"Manager '{clean_name}' invited successfully! Temporary credentials generated.",
            manager=StaffResponse(
                id=created_manager["id"],
                name=created_manager["name"],
                email=created_manager["email"],
                role=created_manager["role"],
                created_at=created_manager.get("created_at"),
            ),
            temporary_password=temp_password,
        )

    @staticmethod
    def delete_manager(manager_id: str, current_admin_id: str) -> Dict[str, str]:
        """Remove a manager account."""
        if manager_id == current_admin_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You cannot remove your own admin account."
            )

        # Verify target is indeed a manager
        check = supabase.table("staff").select("role").eq("id", manager_id).execute()
        if not check.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Manager not found."
            )
        
        if check.data[0].get("role") != "manager":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot delete an admin account through manager removal."
            )

        supabase.table("staff").delete().eq("id", manager_id).execute()
        return {"message": "Manager removed successfully."}

staff_service = StaffService()
