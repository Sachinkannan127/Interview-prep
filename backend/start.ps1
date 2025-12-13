# Production Startup Script for Windows
# Handles ASGI server deployment

$PORT = if ($env:PORT) { $env:PORT } else { "8001" }
$WORKERS = if ($env:WORKERS) { $env:WORKERS } else { "2" }

Write-Host "🚀 Starting Interview Prep API on port $PORT with $WORKERS workers" -ForegroundColor Green

# Try to use Gunicorn with Uvicorn worker first
try {
    python -c "from uvicorn.workers import UvicornWorker" 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Using Gunicorn with Uvicorn worker" -ForegroundColor Green
        gunicorn main:app `
            --workers $WORKERS `
            --worker-class uvicorn.workers.UvicornWorker `
            --bind "0.0.0.0:$PORT" `
            --timeout 120 `
            --access-logfile - `
            --error-logfile - `
            --log-level info
    } else {
        throw "Uvicorn worker not available"
    }
} catch {
    Write-Host "⚠️  Uvicorn worker not available, using Uvicorn directly" -ForegroundColor Yellow
    uvicorn main:app `
        --host 0.0.0.0 `
        --port $PORT `
        --workers $WORKERS `
        --timeout-keep-alive 120 `
        --log-level info
}
