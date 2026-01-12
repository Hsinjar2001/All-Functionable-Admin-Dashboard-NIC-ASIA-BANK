# app/main.py
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from sqlalchemy.exc import SQLAlchemyError
from app.config import settings
from app.database import engine, Base
import logging
import time
import sys

# ✅ Import routers
sys.stdout.write("\n" + "="*70 + "\n")
sys.stdout.write("📦 IMPORTING ROUTERS IN main.py\n")
sys.stdout.write("="*70 + "\n")
sys.stdout.flush()

from app.routers import auth, users

sys.stdout.write("✅ Auth router imported\n")
sys.stdout.write("✅ Users router imported\n")
sys.stdout.write("="*70 + "\n\n")
sys.stdout.flush()

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
    description="NIC Bank API with User Management",
    docs_url="/docs",
    redoc_url="/redoc"
)

# ✅ CORS FIRST - BEFORE ANY OTHER MIDDLEWARE!
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]  # ✅ Add this!
)

# ✅ REQUEST LOGGER MIDDLEWARE - AFTER CORS!
@app.middleware("http")
async def log_all_requests(request: Request, call_next):
    start_time = time.time()
    
    sys.stdout.write(f"\n{'='*80}\n")
    sys.stdout.write(f"📨 INCOMING REQUEST\n")
    sys.stdout.write(f"{'='*80}\n")
    sys.stdout.write(f"🔹 Method: {request.method}\n")
    sys.stdout.write(f"🔹 URL: {request.url}\n")
    sys.stdout.write(f"🔹 Path: {request.url.path}\n")
    sys.stdout.write(f"🔹 Query: {request.url.query}\n")
    
    # Get auth header
    auth_header = request.headers.get("authorization", "None")
    sys.stdout.write(f"🔹 Auth: {auth_header[:50] if auth_header != 'None' else 'None'}...\n")
    sys.stdout.write(f"{'='*80}\n")
    sys.stdout.flush()
    
    try:
        # Process request
        response = await call_next(request)
        
        duration = time.time() - start_time
        sys.stdout.write(f"\n{'='*80}\n")
        sys.stdout.write(f"📤 RESPONSE\n")
        sys.stdout.write(f"{'='*80}\n")
        sys.stdout.write(f"🔹 Status: {response.status_code}\n")
        sys.stdout.write(f"🔹 Duration: {duration:.3f}s\n")
        sys.stdout.write(f"{'='*80}\n\n")
        sys.stdout.flush()
        
        return response
    except Exception as e:
        sys.stdout.write(f"\n{'='*80}\n")
        sys.stdout.write(f"❌ MIDDLEWARE ERROR\n")
        sys.stdout.write(f"{'='*80}\n")
        sys.stdout.write(f"❌ Error: {str(e)}\n")
        sys.stdout.write(f"{'='*80}\n\n")
        sys.stdout.flush()
        raise

# Exception handlers
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = []
    for error in exc.errors():
        errors.append({
            "field": " -> ".join(str(x) for x in error["loc"]),
            "message": error["msg"],
            "type": error["type"]
        })
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"success": False, "message": "Validation error", "errors": errors}
    )

@app.exception_handler(SQLAlchemyError)
async def sqlalchemy_exception_handler(request: Request, exc: SQLAlchemyError):
    logger.error(f"Database error: {exc}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"success": False, "message": "Database error occurred"}
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unexpected error: {exc}", exc_info=True)
    sys.stdout.write(f"\n❌❌❌ EXCEPTION CAUGHT ❌❌❌\n")
    sys.stdout.write(f"Error: {str(exc)}\n")
    sys.stdout.write(f"Type: {type(exc)}\n")
    sys.stdout.flush()
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"success": False, "message": f"An unexpected error occurred: {str(exc)}"}
    )

# ✅ Include routers
sys.stdout.write("\n" + "="*70 + "\n")
sys.stdout.write("🔌 REGISTERING ROUTERS\n")
sys.stdout.write("="*70 + "\n")
sys.stdout.flush()

app.include_router(users.router, prefix="/api")
sys.stdout.write("✅ Users router registered at /api/users\n")
sys.stdout.flush()

app.include_router(auth.router, prefix="/api")
sys.stdout.write("✅ Auth router registered at /api/auth\n")
sys.stdout.write("="*70 + "\n\n")
sys.stdout.flush()

# Root endpoint
@app.get("/", tags=["Root"])
async def root():
    return {
        "message": f"Welcome to {settings.APP_NAME}",
        "version": settings.API_VERSION,
        "docs": "/docs",
        "redoc": "/redoc"
    }

# Health check
@app.get("/api/health", tags=["Health"])
async def health_check():
    return {
        "success": True,
        "message": "Server is running",
        "app": settings.APP_NAME,
        "status": "healthy"
    }

# Startup event
@app.on_event("startup")
async def startup_event():
    logger.info(f"🚀 Starting {settings.APP_NAME} v{settings.API_VERSION}")
    logger.info(f"📝 API Documentation: http://localhost:8000/docs")
    logger.info(f"🔍 ReDoc Documentation: http://localhost:8000/redoc")
    logger.info(f"👥 User Management endpoints enabled")
    
    # Print all registered routes
    sys.stdout.write("\n" + "="*70 + "\n")
    sys.stdout.write("📚 ALL REGISTERED ROUTES\n")
    sys.stdout.write("="*70 + "\n")
    sys.stdout.flush()
    
    for route in app.routes:
        if hasattr(route, 'methods') and hasattr(route, 'path'):
            methods = ','.join(route.methods) if route.methods else ''
            sys.stdout.write(f"{methods:<8} {route.path}\n")
            sys.stdout.flush()
    
    sys.stdout.write("="*70 + "\n\n")
    sys.stdout.flush()

# Shutdown event
@app.on_event("shutdown")
async def shutdown_event():
    logger.info(f"🛑 Shutting down {settings.APP_NAME}")