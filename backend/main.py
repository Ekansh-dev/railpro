from fastapi import FastAPI, HTTPException, Depends, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from supabase import create_client, Client
from dotenv import load_dotenv
from datetime import datetime, timedelta
from jose import jwt, JWTError
import hashlib, os, uuid

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
SECRET_KEY = os.getenv("SECRET_KEY")
SUPABASE_SECRET_KEY = os.getenv("SUPABASE_SECRET_KEY")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SECRET_KEY or SUPABASE_KEY)
security = HTTPBearer()

app = FastAPI(title="RailSupply API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Password Hashing ─────────────────────────────────────────────
def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(password: str, hashed: str) -> bool:
    return hashlib.sha256(password.encode()).hexdigest() == hashed

# ─── JWT ──────────────────────────────────────────────────────────
def create_token(data: dict, role: str = "dealer"):
    payload = data.copy()
    payload["exp"] = datetime.utcnow() + timedelta(days=7)
    payload["role"] = role
    return jwt.encode(payload, SECRET_KEY, algorithm="HS256")

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=["HS256"])
        return payload
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

def admin_only(payload: dict = Depends(verify_token)):
    if payload.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access only")
    return payload

# ─── Models ───────────────────────────────────────────────────────
class DealerRegister(BaseModel):
    name: str
    shop_name: str
    email: str
    password: str
    phone: str
    address: str
    city: str

class AdminRegister(BaseModel):
    name: str
    email: str
    password: str

class LoginRequest(BaseModel):
    email: str
    password: str
    role: str  # "dealer" or "admin"

# ─── Routes ───────────────────────────────────────────────────────
@app.get("/")
def root():
    return {"message": "RailSupply API is running!"}

@app.post("/dealer/register")
def dealer_register(data: DealerRegister):
    existing = supabase.table("dealers").select("id").eq("email", data.email).execute()
    if existing.data:
        raise HTTPException(status_code=400, detail="Email already registered")
    supabase.table("dealers").insert({
        "name": data.name,
        "shop_name": data.shop_name,
        "email": data.email,
        "password_hash": hash_password(data.password),
        "phone": data.phone,
        "address": data.address,
        "city": data.city
    }).execute()
    return {"message": "Dealer registered successfully"}

@app.post("/admin/register")
def admin_register(data: AdminRegister):
    existing = supabase.table("admins").select("id").eq("email", data.email).execute()
    if existing.data:
        raise HTTPException(status_code=400, detail="Email already registered as admin")
    supabase.table("admins").insert({
        "name": data.name,
        "email": data.email,
        "password_hash": hash_password(data.password)
    }).execute()
    return {"message": "Admin registered successfully"}

@app.post("/auth/login")
def login(data: LoginRequest):
    """
    Unified login endpoint that handles both dealer and admin login.
    The 'role' field determines which table to check.
    """
    email = data.email
    password = data.password
    role = data.role
    
    print(f"[DEBUG] Login attempt: email={email}, role={role}")
    
    if role not in ["dealer", "admin"]:
        raise HTTPException(status_code=400, detail="Invalid role. Must be 'dealer' or 'admin'")
    
    if role == "dealer":
        result = supabase.table("dealers").select("*").eq("email", email).execute()
        print(f"[DEBUG] Dealer query result: {result.data}")
        if not result.data:
            raise HTTPException(status_code=401, detail="Invalid email or password")
        dealer = result.data[0]
        if not verify_password(password, dealer["password_hash"]):
            print(f"[DEBUG] Password mismatch for dealer")
            raise HTTPException(status_code=401, detail="Invalid email or password")
        token = create_token(
            {"dealer_id": dealer["id"], "email": dealer["email"], "name": dealer["name"]},
            role="dealer"
        )
        return {
            "token": token,
            "role": "dealer",
            "user": {
                "name": dealer["name"],
                "shop_name": dealer["shop_name"],
                "email": dealer["email"]
            }
        }
    else:  # admin
        result = supabase.table("admins").select("*").eq("email", email).execute()
        print(f"[DEBUG] Admin query result: {result.data}")
        if not result.data:
            print(f"[DEBUG] No admin found with email: {email}")
            raise HTTPException(status_code=401, detail="Invalid admin credentials")
        admin = result.data[0]
        print(f"[DEBUG] Admin found: {admin['email']}, stored_hash={admin['password_hash'][:16]}...")
        print(f"[DEBUG] Provided password hash: {hash_password(password)[:16]}...")
        if not verify_password(password, admin["password_hash"]):
            print(f"[DEBUG] Password mismatch for admin")
            raise HTTPException(status_code=401, detail="Invalid admin credentials")
        token = create_token(
            {"admin_id": admin["id"], "email": admin["email"], "name": admin["name"]},
            role="admin"
        )
        print(f"[DEBUG] Login successful for admin: {email}")
        return {
            "token": token,
            "role": "admin",
            "user": {
                "name": admin["name"],
                "email": admin["email"]
            }
        }

# Legacy login endpoints for backward compatibility
@app.post("/dealer/login")
def dealer_login(data: LoginRequest):
    result = supabase.table("dealers").select("*").eq("email", data.email).execute()
    if not result.data:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    dealer = result.data[0]
    if not verify_password(data.password, dealer["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_token({"dealer_id": dealer["id"], "email": dealer["email"]}, role="dealer")
    return {"token": token, "dealer": {"name": dealer["name"], "shop_name": dealer["shop_name"]}}

@app.post("/admin/login")
def admin_login(data: LoginRequest):
    result = supabase.table("admins").select("*").eq("email", data.email).execute()
    if not result.data:
        raise HTTPException(status_code=401, detail="Invalid admin credentials")
    admin = result.data[0]
    if not verify_password(data.password, admin["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid admin credentials")
    token = create_token({"admin_id": admin["id"], "email": admin["email"]}, role="admin")
    return {"token": token, "admin": {"name": admin["name"], "email": admin["email"]}}

@app.post("/products")
async def upload_product(
    name: str = Form(...),
    category: str = Form(...),
    description: str = Form(""),
    price: float = Form(...),
    image: UploadFile = File(None),
    payload: dict = Depends(verify_token)
):
    dealer_id = payload.get("dealer_id")
    if not dealer_id:
        raise HTTPException(status_code=403, detail="Dealers only")
    image_url = None
    if image:
        file_bytes = await image.read()
        file_ext = image.filename.split(".")[-1]
        file_name = f"{uuid.uuid4()}.{file_ext}"
        supabase.storage.from_("product-images").upload(file_name, file_bytes)
        image_url = f"{SUPABASE_URL}/storage/v1/object/public/product-images/{file_name}"
    supabase.table("products").insert({
        "dealer_id": dealer_id,
        "name": name,
        "category": category,
        "description": description,
        "price": price,
        "image_url": image_url,
        "updated_at": datetime.utcnow().isoformat()
    }).execute()
    return {"message": "Product uploaded successfully"}

@app.get("/products/mine")
def my_products(payload: dict = Depends(verify_token)):
    dealer_id = payload.get("dealer_id")
    result = supabase.table("products").select("*").eq("dealer_id", dealer_id).execute()
    return result.data

@app.put("/products/{product_id}")
def update_product(
    product_id: str,
    name: str = Form(...),
    category: str = Form(...),
    description: str = Form(""),
    price: float = Form(...),
    payload: dict = Depends(verify_token)
):
    dealer_id = payload.get("dealer_id")
    supabase.table("products").update({
        "name": name,
        "category": category,
        "description": description,
        "price": price,
        "updated_at": datetime.utcnow().isoformat()
    }).eq("id", product_id).eq("dealer_id", dealer_id).execute()
    return {"message": "Product updated"}

@app.delete("/products/{product_id}")
def delete_product(product_id: str, payload: dict = Depends(verify_token)):
    dealer_id = payload.get("dealer_id")
    supabase.table("products").delete().eq("id", product_id).eq("dealer_id", dealer_id).execute()
    return {"message": "Product deleted"}

@app.get("/admin/products")
def admin_get_products(search: str = "", category: str = "", payload: dict = Depends(admin_only)):
    query = supabase.table("products").select("*, dealers(name, shop_name, phone, address, city)")
    if search:
        query = query.ilike("name", f"%{search}%")
    if category:
        query = query.eq("category", category)
    result = query.execute()
    return result.data

@app.get("/categories")
def get_categories():
    result = supabase.table("categories").select("*").execute()
    return result.data

@app.delete("/admin/products/{product_id}")
def admin_delete_product(product_id: str, payload: dict = Depends(admin_only)):
    supabase.table("products").delete().eq("id", product_id).execute()
    return {"message": "Product deleted by admin"}