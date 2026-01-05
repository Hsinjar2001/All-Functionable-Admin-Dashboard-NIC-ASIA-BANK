from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from sqlalchemy.exc import SQLAlchemyError
from app.config import settings
from app.database import engine, Base
from app.routers import auth  # ✅ CHANGED THIS LINE
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Create database tables
try:
    Base.metadata.create_all(bind=engine)
    logger.info("✅ Database tables created successfully")
except Exception as e:
    logger.error(f"❌ Error creating database tables: {e}")

# Initialize FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.API_VERSION,
    debug=settings.DEBUG,
    description="NIC Bank Authentication API with JWT",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Custom exception handlers

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Handle validation errors"""
    errors = []
    for error in exc.errors():
        errors.append({
            "field": " -> ".join(str(x) for x in error["loc"]),
            "message": error["msg"],
            "type": error["type"]
        })
    
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "success": False,
            "message": "Validation error",
            "errors": errors
        }
    )

@app.exception_handler(SQLAlchemyError)
async def sqlalchemy_exception_handler(request: Request, exc: SQLAlchemyError):
    """Handle database errors"""
    logger.error(f"Database error: {exc}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "message": "Database error occurred",
            "detail": str(exc) if settings.DEBUG else "Internal server error"
        }
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """Handle all other exceptions"""
    logger.error(f"Unexpected error: {exc}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "message": "An unexpected error occurred",
            "detail": str(exc) if settings.DEBUG else "Internal server error"
        }
    )

# Include routers
app.include_router(auth.router, prefix="/api")

# Root endpoint
@app.get(
    "/",
    tags=["Root"],
    summary="Root endpoint"
)
async def root():
    """Root endpoint with API information"""
    return {
        "message": f"Welcome to {settings.APP_NAME}",
        "version": settings.API_VERSION,
        "docs": "/docs",
        "redoc": "/redoc",
        "health": "/api/health"
    }

# Health check endpoint
@app.get(
    "/api/health",
    tags=["Health"],
    summary="Health check"
)
async def health_check():
    """Check if the API is running"""
    return {
        "success": True,
        "message": "Server is running",
        "app": settings.APP_NAME,
        "version": settings.API_VERSION,
        "status": "healthy"
    }

# Startup event
@app.on_event("startup")
async def startup_event():
    """Run on application startup"""
    logger.info(f"🚀 Starting {settings.APP_NAME} v{settings.API_VERSION}")
    logger.info(f"📝 API Documentation: http://localhost:8000/docs")
    logger.info(f"🔍 ReDoc Documentation: http://localhost:8000/redoc")

# Shutdown event
@app.on_event("shutdown")
async def shutdown_event():
    """Run on application shutdown"""
    logger.info(f"🛑 Shutting down {settings.APP_NAME}")