from typing import List, Optional
from fastapi import APIRouter, Depends, UploadFile, File, Form, Query
from app.schemas.product import ProductResponse, ProductReviewRequest
from app.services.product_service import product_service
from app.core.security import require_dealer, require_manager_or_admin, require_admin

router = APIRouter(tags=["Products"])

# ─── DEALER PRODUCT ENDPOINTS ──────────────────────────────────────

@router.post("/products")
async def upload_product(
    name: str = Form(...),
    category: str = Form(...),
    price: float = Form(...),
    description: str = Form(""),
    image: UploadFile = File(None),
    dealer: dict = Depends(require_dealer),
):
    """
    Dealer endpoint to upload a product.
    Product status defaults to 'pending' awaiting Manager review.
    """
    dealer_id = dealer["dealer_id"]
    return await product_service.upload_product(
        dealer_id=dealer_id,
        name=name,
        category=category,
        price=price,
        description=description,
        image=image,
    )

@router.get("/products/mine", response_model=List[ProductResponse])
def get_my_products(dealer: dict = Depends(require_dealer)):
    """
    Fetch all products uploaded by the authenticated dealer.
    """
    dealer_id = dealer["dealer_id"]
    return product_service.get_dealer_products(dealer_id)

@router.put("/products/{product_id}")
def update_product(
    product_id: str,
    name: str = Form(...),
    category: str = Form(...),
    price: float = Form(...),
    description: str = Form(""),
    dealer: dict = Depends(require_dealer),
):
    """
    Update product details.
    """
    dealer_id = dealer["dealer_id"]
    return product_service.update_product(
        product_id=product_id,
        dealer_id=dealer_id,
        name=name,
        category=category,
        price=price,
        description=description,
    )

@router.delete("/products/{product_id}")
def delete_product(product_id: str, dealer: dict = Depends(require_dealer)):
    """
    Dealer deletes their own product.
    """
    dealer_id = dealer["dealer_id"]
    return product_service.delete_dealer_product(product_id=product_id, dealer_id=dealer_id)

# ─── MANAGER & ADMIN REVIEW ENDPOINTS ──────────────────────────────

@router.get("/manager/products/pending")
def list_pending_products(staff: dict = Depends(require_manager_or_admin)):
    """
    Manager action: View products queued for review.
    """
    return product_service.get_pending_products()

@router.post("/manager/products/{product_id}/review")
def review_product(
    product_id: str,
    review_data: ProductReviewRequest,
    staff: dict = Depends(require_manager_or_admin),
):
    """
    Manager action: Approve or Reject a product.
    """
    return product_service.review_product(
        product_id=product_id,
        action=review_data.action,
        rejection_reason=review_data.rejection_reason,
    )

# ─── CONTRACTOR & ADMIN SEARCH ENDPOINTS ───────────────────────────

@router.get("/admin/products")
def search_products(
    search: str = Query("", description="Search by name"),
    category: str = Query("", description="Filter by category"),
    include_pending: bool = Query(False, description="Include pending items"),
    staff: dict = Depends(require_manager_or_admin),
):
    """
    Search approved dealer products for railway contractor orders.
    """
    return product_service.search_all_products(
        search=search,
        category=category,
        include_pending=include_pending,
    )

@router.delete("/admin/products/{product_id}")
def admin_delete_product(product_id: str, admin: dict = Depends(require_admin)):
    """
    Admin moderation: Remove any product listing.
    """
    return product_service.admin_delete_product(product_id=product_id)
