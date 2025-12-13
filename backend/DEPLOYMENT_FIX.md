# Backend Deployment Fix

## Problem
```
TypeError: FastAPI.__call__() missing 1 required positional argument: 'send'
```

This error occurs when Gunicorn uses a sync worker instead of an ASGI worker with FastAPI.

## Solution Applied

### 1. Updated Dependencies
Added `uvicorn-worker>=0.2.0` to [requirements.txt](requirements.txt) to ensure proper ASGI worker support.

### 2. Created Startup Scripts
- **Linux/Mac**: [start.sh](start.sh)
- **Windows**: [start.ps1](start.ps1)

Both scripts automatically detect and use the best available ASGI server:
1. Try Gunicorn with Uvicorn worker (production-grade)
2. Fall back to Uvicorn directly (works everywhere)

### 3. Updated Render Configuration
[render.yaml](render.yaml) now uses `./start.sh` which handles worker compatibility.

## Manual Deployment Options

### Option 1: Uvicorn Only (Recommended for most deployments)
```bash
uvicorn main:app --host 0.0.0.0 --port $PORT --workers 2
```

### Option 2: Gunicorn + Uvicorn Worker (Production with load balancing)
```bash
gunicorn main:app \
  --workers 2 \
  --worker-class uvicorn.workers.UvicornWorker \
  --bind 0.0.0.0:$PORT \
  --timeout 120
```

### Option 3: Use Startup Script (Automatic detection)
```bash
chmod +x start.sh
./start.sh
```

## Environment Variables
- `PORT` - Server port (default: 8001)
- `WORKERS` - Number of workers (default: 2)

## Verification
Test the fix locally:
```bash
cd backend
pip install -r requirements.txt
python main.py  # Development
./start.sh      # Production-like
```

## Redeploy on Render
1. Push changes to your repository
2. Render will automatically redeploy using the new startup script
3. Check logs for: `✅ Using Gunicorn with Uvicorn worker` or `⚠️ Uvicorn worker not available, using Uvicorn directly`

Both messages indicate successful startup - the important thing is the server runs with an ASGI worker.
