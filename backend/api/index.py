"""
Vercel serverless function handler for FastAPI application.
This file serves as the entry point for Vercel's Python runtime.
"""

import sys
import os
import traceback

# Set default environment for serverless
os.environ.setdefault('ENVIRONMENT', 'production')

# Add the parent directory to the path to import main
parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, parent_dir)

print(f"Python path: {sys.path}")
print(f"Current directory: {os.getcwd()}")
print(f"Parent directory: {parent_dir}")

try:
    print("Attempting to import main...")
    from main import app
    print("Successfully imported main app")
    
    from mangum import Mangum
    print("Successfully imported Mangum")
    
    # Create a handler for Vercel serverless functions
    handler = Mangum(app, lifespan="off")
    print("Successfully created Mangum handler")
    
except Exception as e:
    # If import fails, create a minimal error handler
    print(f"ERROR: Failed to initialize: {str(e)}")
    traceback.print_exc()
    
    # Create a fallback handler
    from fastapi import FastAPI
    from fastapi.responses import JSONResponse
    from mangum import Mangum
    
    fallback_app = FastAPI()
    
    @fallback_app.get("/{path:path}")
    async def error_handler(path: str = ""):
        return JSONResponse(
            status_code=500,
            content={
                "error": "Application failed to initialize",
                "message": str(e),
                "traceback": traceback.format_exc(),
                "hint": "Check environment variables and dependencies in Vercel",
                "sys_path": sys.path,
                "cwd": os.getcwd()
            }
        )
    
    handler = Mangum(fallback_app, lifespan="off")
