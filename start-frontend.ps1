# Start Frontend Server
Write-Host "Starting Interview AI Frontend Server..." -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

Set-Location S:\pro\Interview-prep\frontend

Write-Host "`nFrontend will be available at: http://localhost:5173 or 5174" -ForegroundColor Green
Write-Host "Press Ctrl+C to stop the server`n" -ForegroundColor Yellow

# Start the server
npm run dev
