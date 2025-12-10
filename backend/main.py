from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
import os
import logging
from datetime import datetime

from app.api import interviews, questions, chat

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Determine environment
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
IS_PRODUCTION = ENVIRONMENT == "production"

app = FastAPI(
    title="Interview Prep Simulator API",
    description="AI-powered interview practice platform",
    version="1.0.0",
    docs_url="/docs" if not IS_PRODUCTION else None,
    redoc_url="/redoc" if not IS_PRODUCTION else None,
)

# CORS configuration
CORS_ORIGINS = os.getenv(
    "CORS_ORIGINS", 
    "http://localhost:5173,http://localhost:5174,http://localhost:5175,http://localhost:5176,http://localhost:5177"
)
origins = [origin.strip() for origin in CORS_ORIGINS.split(",")]

logger.info(f"Environment: {ENVIRONMENT}")
logger.info(f"Allowed CORS origins: {origins}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add trusted host middleware for production
if IS_PRODUCTION:
    ALLOWED_HOSTS = os.getenv("ALLOWED_HOSTS", "*").split(",")
    if "*" not in ALLOWED_HOSTS:
        app.add_middleware(
            TrustedHostMiddleware,
            allowed_hosts=ALLOWED_HOSTS
        )

# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Global exception: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "detail": "Internal server error" if IS_PRODUCTION else str(exc),
            "timestamp": datetime.utcnow().isoformat()
        }
    )

# Include routers
app.include_router(interviews.router)
app.include_router(questions.router)
app.include_router(chat.router)

@app.get("/")
async def root():
    return {
        "message": "Interview Prep Simulator API",
        "version": "1.0.0",
        "status": "running",
        "environment": ENVIRONMENT,
        "timestamp": datetime.utcnow().isoformat()
    }

@app.get("/health")
async def health_check():
    """Health check endpoint for monitoring"""
    try:
        # Add basic health checks here
        return {
            "status": "healthy",
            "timestamp": datetime.utcnow().isoformat(),
            "environment": ENVIRONMENT
        }
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        return JSONResponse(
            status_code=503,
            content={
                "status": "unhealthy",
                "error": str(e) if not IS_PRODUCTION else "Service unavailable",
                "timestamp": datetime.utcnow().isoformat()
            }
        )

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8001))
    reload = os.getenv("RELOAD", "false").lower() == "true" and not IS_PRODUCTION
    
    logger.info(f"Starting server on port {port} with reload={reload}")
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=reload,
        log_level="info" if IS_PRODUCTION else "debug"
    )
