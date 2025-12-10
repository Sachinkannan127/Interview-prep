from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

from app.api import interviews, questions

load_dotenv()

app = FastAPI(
    title="Interview Prep Simulator API",
    description="AI-powered interview practice platform",
    version="1.0.0"
)

# CORS configuration - Allow all localhost ports for development
origins = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:5174,http://localhost:5175,http://localhost:5176,http://localhost:5177").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(interviews.router)
app.include_router(questions.router)

@app.get("/")
async def root():
    return {
        "message": "Interview Prep Simulator API",
        "version": "1.0.0",
        "status": "running"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8001))
    # Disable reload for stable operation
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False)
