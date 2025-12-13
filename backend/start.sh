#!/bin/bash
# Startup script for production deployment
# Handles both Gunicorn+Uvicorn worker and pure Uvicorn deployment

PORT=${PORT:-8001}
WORKERS=${WORKERS:-2}

echo "🚀 Starting Interview Prep API on port $PORT with $WORKERS workers"

# Check if uvicorn.workers.UvicornWorker is available
if python -c "from uvicorn.workers import UvicornWorker" 2>/dev/null; then
    echo "✅ Using Gunicorn with Uvicorn worker"
    exec gunicorn main:app \
        --workers $WORKERS \
        --worker-class uvicorn.workers.UvicornWorker \
        --bind 0.0.0.0:$PORT \
        --timeout 120 \
        --access-logfile - \
        --error-logfile - \
        --log-level info
else
    echo "⚠️  Uvicorn worker not available, using Uvicorn directly"
    exec uvicorn main:app \
        --host 0.0.0.0 \
        --port $PORT \
        --workers $WORKERS \
        --timeout-keep-alive 120 \
        --log-level info
fi
