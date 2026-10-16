from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

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

# Register API Routers  -> Routes
app.include_router(auth.router)
app.include_router(staff.router)
app.include_router(dealers.router)
app.include_router(categories.router)
app.include_router(products.router)

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