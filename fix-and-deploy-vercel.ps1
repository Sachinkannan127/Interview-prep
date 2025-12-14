# VERCEL DEPLOYMENT FIX SCRIPT
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "FIXING VERCEL DEPLOYMENT" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Open Vercel settings
Write-Host "Opening Vercel settings page..." -ForegroundColor Yellow
Start-Process "https://vercel.com/pro25xyzs-projects/interview-prep-ba88/settings"

Write-Host ""
Write-Host "EXACT STEPS TO FIX:" -ForegroundColor Green
Write-Host ""
Write-Host "1. Look at the browser window that just opened"
Write-Host "2. Scroll down to find 'Root Directory'"
Write-Host "3. You'll see it says: frontend"
Write-Host "4. CLICK the 'Edit' button next to it"
Write-Host "5. DELETE 'frontend' from the field"
Write-Host "6. Leave it EMPTY"
Write-Host "7. Click 'Save'"
Write-Host ""
Write-Host "After saving, press Enter here to deploy..." -ForegroundColor Yellow
Read-Host

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "DEPLOYING TO VERCEL" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

Set-Location "$PSScriptRoot\frontend"

# Remove old config
Remove-Item -Recurse -Force .vercel -ErrorAction SilentlyContinue

# Deploy
vercel --prod

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "DEPLOYMENT COMPLETE!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
