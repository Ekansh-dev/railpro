from fastapi import HTTPException, status
from app.database import supabase
from app.core.security import verify_password, create_access_token
from app.schemas.auth import LoginRequest, TokenResponse

class AuthService:
    @staticmethod
    def login(login_data: LoginRequest) -> TokenResponse:
        email = login_data.email.strip().lower()
        password = login_data.password
        role = login_data.role.strip().lower()

        if role not in ["dealer", "admin", "manager"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid role. Must be 'dealer', 'admin', or 'manager'."
            )

        if role in ["admin", "manager"]:
            # Check staff table
            result = supabase.table("staff").select("*").ilike("email", email).execute()
            if not result.data:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail=f"No {role} found with this email address."
                )
            
            staff_member = result.data[0]
            if staff_member.get("role") != role:
                # If a super admin logs in as manager or vice-versa, clarify role mismatch
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Account is registered with role '{staff_member.get('role')}', not '{role}'."
                )

            if not verify_password(password, staff_member["password_hash"]):
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid email or password."
                )

            token_payload = {
                "staff_id": staff_member["id"],
                "email": staff_member["email"],
                "name": staff_member["name"],
                "role": staff_member["role"],
            }
            token = create_access_token(token_payload)

            return TokenResponse(
                token=token,
                role=staff_member["role"],
                user={
                    "id": staff_member["id"],
                    "name": staff_member["name"],
                    "email": staff_member["email"],
                    "role": staff_member["role"],
                }
            )

        else:
            # Dealer login
            result = supabase.table("dealers").select("*").ilike("email", email).execute()
            if not result.data:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="No dealer found with this email address."
                )

            dealer = result.data[0]
            if not verify_password(password, dealer["password_hash"]):
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid email or password."
                )

            # Check dealer approval status
            dealer_status = dealer.get("status", "pending")
            if dealer_status == "pending":
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Your dealer registration is currently pending admin review. You can log in once approved."
                )
            elif dealer_status == "rejected":
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Your dealer registration request was rejected by the administrator."
                )

            token_payload = {
                "dealer_id": dealer["id"],
                "email": dealer["email"],
                "name": dealer["name"],
                "shop_name": dealer["shop_name"],
                "role": "dealer",
            }
            token = create_access_token(token_payload)

            return TokenResponse(
                token=token,
                role="dealer",
                user={
                    "id": dealer["id"],
                    "name": dealer["name"],
                    "shop_name": dealer["shop_name"],
                    "email": dealer["email"],
                    "phone": dealer.get("phone"),
                    "city": dealer.get("city"),
                    "address": dealer.get("address"),
                }
            )

auth_service = AuthService()
