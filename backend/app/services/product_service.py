import uuid
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
from fastapi import UploadFile, HTTPException, status

from app.config import settings
from app.database import supabase
from app.services.category_service import category_service

class ProductService:
    @staticmethod
    async def upload_product(
        dealer_id: str,
        name: str,
        category: str,
        price: float,
        description: str = "",
        image: Optional[UploadFile] = None
    ) -> Dict[str, Any]:
        """
        Dealer uploads a product.
        Automatically registers any custom category with is_inbuilt=False.
        Product is set to status='pending' awaiting Manager review.
        """
        clean_name = name.strip()
        clean_cat = category.strip()

        if not clean_name:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Product name is required.")
        if price < 0:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Price cannot be negative.")

        # Ensure category is registered in categories table
        category_service.get_or_create_custom_category(clean_cat)

        # Upload image if provided
        image_url = None
        if image and image.filename:
            try:
                file_bytes = await image.read()
                file_ext = image.filename.split(".")[-1].lower()
                file_name = f"{uuid.uuid4()}.{file_ext}"
                content_type = image.content_type or f"image/{file_ext}"

                try:
                    supabase.storage.from_("product-images").upload(
                        file_name,
                        file_bytes,
                        {"content-type": content_type}
                    )
                except Exception as upload_err:
                    # If bucket does not exist, auto-create it as public and retry
                    if "not found" in str(upload_err).lower() or "bucket" in str(upload_err).lower():
                        supabase.storage.create_bucket("product-images", options={"public": True})
                        supabase.storage.from_("product-images").upload(
                            file_name,
                            file_bytes,
                            {"content-type": content_type}
                        )
                    else:
                        raise upload_err

                image_url = f"{settings.SUPABASE_URL}/storage/v1/object/public/product-images/{file_name}"
            except Exception as e:
                print(f"[STORAGE ERROR] Failed uploading image: {e}")

        now_iso = datetime.now(timezone.utc).isoformat()
        insert_data = {
            "dealer_id": dealer_id,
            "name": clean_name,
            "category": clean_cat,
            "price": price,
            "description": description.strip() if description else "",
            "image_url": image_url,
            "status": "pending",  # Manager must approve
            "created_at": now_iso,
            "updated_at": now_iso,
        }

        res = supabase.table("products").insert(insert_data).execute()
        if not res.data:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to save product.")

        return res.data[0]

    @staticmethod
    def get_dealer_products(dealer_id: str) -> List[Dict[str, Any]]:
        """Fetch all products owned by the authenticated dealer."""
        result = supabase.table("products").select("*").eq("dealer_id", dealer_id).order("created_at", desc=True).execute()
        return result.data

    @staticmethod
    def update_product(
        product_id: str,
        dealer_id: str,
        name: str,
        category: str,
        price: float,
        description: str = ""
    ) -> Dict[str, Any]:
        """Update product details by owning dealer."""
        clean_name = name.strip()
        clean_cat = category.strip()
        category_service.get_or_create_custom_category(clean_cat)

        update_data = {
            "name": clean_name,
            "category": clean_cat,
            "price": price,
            "description": description.strip() if description else "",
            "updated_at": datetime.now(timezone.utc).isoformat(),
        }

        res = supabase.table("products").update(update_data).eq("id", product_id).eq("dealer_id", dealer_id).execute()
        if not res.data:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found or not owned by dealer.")
        return res.data[0]

    @staticmethod
    def delete_dealer_product(product_id: str, dealer_id: str) -> Dict[str, str]:
        """Delete product by owning dealer."""
        res = supabase.table("products").delete().eq("id", product_id).eq("dealer_id", dealer_id).execute()
        return {"message": "Product deleted successfully."}

    @staticmethod
    def get_pending_products() -> List[Dict[str, Any]]:
        """Fetch all pending products waiting for Manager review."""
        result = supabase.table("products").select("*, dealers(name, shop_name, phone, city, email)").eq("status", "pending").order("created_at", desc=True).execute()
        return result.data

    @staticmethod
    def review_product(product_id: str, action: str, rejection_reason: Optional[str] = None) -> Dict[str, str]:
        """
        Manager review action: Approve or Reject product.
        """
        clean_action = action.strip().lower()
        if clean_action not in ["approve", "reject"]:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Action must be 'approve' or 'reject'.")

        new_status = "approved" if clean_action == "approve" else "rejected"
        update_data = {
            "status": new_status,
            "rejection_reason": rejection_reason if clean_action == "reject" else None,
            "updated_at": datetime.now(timezone.utc).isoformat(),
        }

        res = supabase.table("products").update(update_data).eq("id", product_id).execute()
        if not res.data:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found.")

        return {"message": f"Product has been {new_status}."}

    @staticmethod
    def search_all_products(search: str = "", category: str = "", include_pending: bool = False) -> List[Dict[str, Any]]:
        """
        Search products for contractor view.
        By default only returns 'approved' products unless include_pending is True.
        """
        query = supabase.table("products").select("*, dealers(name, shop_name, phone, address, city, email)")
        if not include_pending:
            query = query.eq("status", "approved")
        if search:
            query = query.ilike("name", f"%{search}%")
        if category:
            query = query.eq("category", category)

        query = query.order("updated_at", desc=True)
        result = query.execute()
        return result.data

    @staticmethod
    def admin_delete_product(product_id: str) -> Dict[str, str]:
        """Admin force deletion of product."""
        supabase.table("products").delete().eq("id", product_id).execute()
        return {"message": "Product removed by administrator."}

product_service = ProductService()
