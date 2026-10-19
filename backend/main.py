from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

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

# ─── Global Error Handlers (Ensures CORS headers on all errors) ────────────────
def get_cors_origin(request: Request) -> str:
    origin = request.headers.get("origin")
    if origin and (origin in settings.ALLOWED_ORIGINS or "*" in settings.ALLOWED_ORIGINS):
        return origin
    return "https://railpro-wine.vercel.app"

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    origin = get_cors_origin(request)
    return JSONResponse(
        status_code=500,
        content={"detail": str(exc)},
        headers={
            "Access-Control-Allow-Origin": origin,
            "Access-Control-Allow-Credentials": "true",
        },
    )

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    origin = get_cors_origin(request)
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
        headers={
            "Access-Control-Allow-Origin": origin,
            "Access-Control-Allow-Credentials": "true",
        },
    )

# ─── Register API Routers ───────────────────────────────────────────────────────
app.include_router(auth.router)
app.include_router(staff.router)
app.include_router(dealers.router)
app.include_router(categories.router)
app.include_router(products.router)

@app.get("/", tags=["Health"])
def root():
    from urllib.parse import urlparse
    parsed = urlparse(settings.SUPABASE_URL)
    return {
        "message": "RailSupply API is running!",
        "version": settings.VERSION,
        "supabase_host": parsed.netloc or "NOT_CONFIGURED",
        "docs_url": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)