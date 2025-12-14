@echo off
echo ========================================
echo FIXING VERCEL DEPLOYMENT
echo ========================================
echo.
echo I've opened the Vercel settings page for you.
echo.
echo EXACT STEPS TO FIX:
echo.
echo 1. Look at the browser window that just opened
echo 2. Scroll down to find "Root Directory"
echo 3. You'll see it says: frontend
echo 4. CLICK the "Edit" button next to it
echo 5. DELETE "frontend" from the field
echo 6. Leave it EMPTY
echo 7. Click "Save"
echo.
echo After saving, press any key here to deploy...
pause

echo.
echo ========================================
echo DEPLOYING TO VERCEL
echo ========================================
cd /d "%~dp0frontend"
call vercel --prod

echo.
echo ========================================
echo DEPLOYMENT COMPLETE!
echo ========================================
pause
