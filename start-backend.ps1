# Start Backend Server
Write-Host "Starting Interview AI Backend Server..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

Set-Location S:\pro\Interview-prep\backend

# Activate virtual environment if it exists
if (Test-Path "..\\.venv\Scripts\Activate.ps1") {
    & ..\\.venv\Scripts\Activate.ps1
}

Write-Host "`nBackend will be available at: http://localhost:8001" -ForegroundColor Green
Write-Host "Press Ctrl+C to stop the server`n" -ForegroundColor Yellow

# Start the server
python main.py
