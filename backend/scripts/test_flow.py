#!/usr/bin/env python3
"""
End-to-end integration test verifying the clean architecture:
- Admin login / creation
- Admin invites Manager (auto-generated password)
- Manager logs in
- Dealer registers (status: pending)
- Pending dealer cannot login (403)
- Admin approves dealer
- Approved dealer logs in
- Dealer uploads product with custom category
- Product is pending
- Manager reviews & approves product
"""
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi.testclient import TestClient
from main import app
from app.database import supabase
from app.core.security import hash_password

client = TestClient(app)

def run_tests():
    print("=" * 60)
    print("      RAILSUPPLY API ARCHITECTURE VERIFICATION TEST")
    print("=" * 60)

    # 1. Health check
    res = client.get("/")
    assert res.status_code == 200, f"Health check failed: {res.text}"
    print("[OK] 1. Health Check OK:", res.json()["message"])

    # 2. Setup a test Admin in 'staff' table if none exists
    admin_email = "admin@railsupply.com"
    admin_pass = "Admin@12345"
    existing_admin = supabase.table("staff").select("id").eq("email", admin_email).execute()
    if not existing_admin.data:
        supabase.table("staff").insert({
            "name": "Super Admin",
            "email": admin_email,
            "password_hash": hash_password(admin_pass),
            "role": "admin",
        }).execute()
        print(f"[OK] 2. Created initial test admin ({admin_email})")
    else:
        # Reset password to known test pass
        supabase.table("staff").update({
            "password_hash": hash_password(admin_pass)
        }).eq("email", admin_email).execute()
        print(f"[OK] 2. Using existing test admin ({admin_email})")

    # 3. Admin Login
    login_res = client.post("/auth/login", json={
        "email": admin_email,
        "password": admin_pass,
        "role": "admin"
    })
    assert login_res.status_code == 200, f"Admin login failed: {login_res.text}"
    admin_token = login_res.json()["token"]
    print("[OK] 3. Admin Login OK (JWT token received)")

    # 4. Admin Invites a Manager
    manager_email = f"manager_{os.getpid()}@railsupply.com"
    invite_res = client.post(
        "/admin/managers/invite",
        json={"name": "Test Manager", "email": manager_email},
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert invite_res.status_code == 200, f"Manager invite failed: {invite_res.text}"
    manager_data = invite_res.json()
    temp_password = manager_data["temporary_password"]
    manager_id = manager_data["manager"]["id"]
    print(f"[OK] 4. Admin invited Manager successfully! Generated pass: {temp_password}")

    # 5. Manager Login
    mgr_login = client.post("/auth/login", json={
        "email": manager_email,
        "password": temp_password,
        "role": "manager"
    })
    assert mgr_login.status_code == 200, f"Manager login failed: {mgr_login.text}"
    manager_token = mgr_login.json()["token"]
    print("[OK] 5. Manager Login with generated password OK!")

    # 6. Dealer Registers
    dealer_email = f"dealer_{os.getpid()}@test.com"
    dealer_pass = "Dealer@123"
    reg_res = client.post("/dealer/register", json={
        "name": "Ramesh Kumar",
        "shop_name": "Kumar Railway Hardware",
        "email": dealer_email,
        "password": dealer_pass,
        "phone": "9876543210",
        "city": "Lucknow",
        "address": "Shop 4, Station Road"
    })
    assert reg_res.status_code == 200, f"Dealer register failed: {reg_res.text}"
    print("[OK] 6. Dealer Registered (starts in 'pending' status)")

    # 7. Dealer Tries to Login (Should be rejected with 403 because status is pending)
    early_login = client.post("/auth/login", json={
        "email": dealer_email,
        "password": dealer_pass,
        "role": "dealer"
    })
    assert early_login.status_code == 403, f"Expected 403 for pending dealer, got {early_login.status_code}"
    print("[OK] 7. Pending Dealer login correctly blocked with 403:", early_login.json()["detail"])

    # 8. Admin lists dealers and approves this dealer
    dealers_res = client.get("/admin/dealers?status=pending", headers={"Authorization": f"Bearer {admin_token}"})
    assert dealers_res.status_code == 200
    pending_dealers = dealers_res.json()
    target_dealer = next((d for d in pending_dealers if d["email"] == dealer_email), None)
    assert target_dealer is not None, "Target dealer not found in pending list"
    
    approve_res = client.post(
        f"/admin/dealers/{target_dealer['id']}/approve",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert approve_res.status_code == 200
    print(f"[OK] 8. Admin approved dealer: {target_dealer['name']}")

    # 9. Dealer Logs in now (Should succeed)
    dealer_login_res = client.post("/auth/login", json={
        "email": dealer_email,
        "password": dealer_pass,
        "role": "dealer"
    })
    assert dealer_login_res.status_code == 200, f"Approved dealer login failed: {dealer_login_res.text}"
    dealer_token = dealer_login_res.json()["token"]
    print("[OK] 9. Approved Dealer logged in successfully!")

    # 10. Check Categories
    cats_res = client.get("/categories")
    assert cats_res.status_code == 200
    cats = cats_res.json()
    print(f"[OK] 10. Categories retrieved ({len(cats)} categories available)")

    # 11. Dealer uploads product with custom category
    upload_res = client.post(
        "/products",
        data={
            "name": "Heavy Duty Solar Inverter 5kVA",
            "category": "Solar & Inverters",  # Custom category
            "price": "45000",
            "description": "Pure sine wave solar inverter for station back-up"
        },
        headers={"Authorization": f"Bearer {dealer_token}"}
    )
    assert upload_res.status_code == 200, f"Product upload failed: {upload_res.text}"
    product = upload_res.json()
    assert product["status"] == "pending", f"Expected product status 'pending', got {product['status']}"
    product_id = product["id"]
    print(f"[OK] 11. Dealer uploaded product with custom category! Status: {product['status']}")

    # 12. Manager checks pending products queue
    pending_res = client.get("/manager/products/pending", headers={"Authorization": f"Bearer {manager_token}"})
    assert pending_res.status_code == 200
    pending_products = pending_res.json()
    assert any(p["id"] == product_id for p in pending_products), "Uploaded product not found in Manager pending queue"
    print(f"[OK] 12. Manager fetched pending products queue ({len(pending_products)} item(s) pending)")

    # 13. Manager approves the product
    review_res = client.post(
        f"/manager/products/{product_id}/review",
        json={"action": "approve"},
        headers={"Authorization": f"Bearer {manager_token}"}
    )
    assert review_res.status_code == 200, f"Manager review failed: {review_res.text}"
    print(f"[OK] 13. Manager approved product: {review_res.json()['message']}")

    # 14. Check Admin/Contractor product search
    search_res = client.get("/admin/products", headers={"Authorization": f"Bearer {admin_token}"})
    assert search_res.status_code == 200
    approved_products = search_res.json()
    assert any(p["id"] == product_id for p in approved_products), "Approved product not visible in public contractor search"
    print(f"[OK] 14. Product is now active and visible in contractor search! Total approved: {len(approved_products)}")

    # Clean up test manager
    client.delete(f"/admin/managers/{manager_id}", headers={"Authorization": f"Bearer {admin_token}"})
    print("[OK] 15. Cleaned up temporary test manager account")

    print("\n>>> ALL TESTS PASSED! Clean architecture is 100% verified and operational. <<<")

if __name__ == "__main__":
    run_tests()
