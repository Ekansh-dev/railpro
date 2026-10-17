<<<<<<< HEAD
from fastapi import FastAPI, HTTPException, Depends, UploadFile, File, Form, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from supabase import create_client, Client
from dotenv import load_dotenv
from datetime import datetime, timezone, timedelta
from jose import jwt, JWTError
import hashlib, os, uuid
=======
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
>>>>>>> 472beca800260d51474f5b2bf6ffddc7355f6c53

from app.config import settings
from app.routers import auth, staff, dealers, categories, products

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="RailSupply Contractor & Dealer Portal API"
)

# CORS Middleware Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

<<<<<<< HEAD
# ─── Global error handler: ensures CORS headers are on ALL responses ───────────
CORS_ORIGIN = "https://railpro-wine.vercel.app"

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"detail": str(exc)},
        headers={
            "Access-Control-Allow-Origin": CORS_ORIGIN,
            "Access-Control-Allow-Credentials": "true",
        },
    )

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
        headers={
            "Access-Control-Allow-Origin": CORS_ORIGIN,
            "Access-Control-Allow-Credentials": "true",
        },
    )

# ─── Password Hashing ─────────────────────────────────────────────
def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()
=======
# Register API Routers  -> Routes
app.include_router(auth.router)
app.include_router(staff.router)
app.include_router(dealers.router)
app.include_router(categories.router)
app.include_router(products.router)
>>>>>>> 472beca800260d51474f5b2bf6ffddc7355f6c53

@app.get("/", tags=["Health"])
def root():
    return {
        "message": "RailSupply API is running!",
        "version": settings.VERSION,
        "docs_url": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)