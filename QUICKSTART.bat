@echo off
REM === BEE-SHIP QUICKSTART ===
REM This script does everything in one go!

echo.
echo ========================================
echo   BEE-SHIP DEPLOYMENT QUICKSTART
echo ========================================
echo.

REM Step 1: Setup platform modules
echo [1/5] Setting up platform modules...
call deploy-bee-ship.bat
if errorlevel 1 (
    echo ERROR: Platform setup failed!
    pause
    exit /b 1
)
echo.

REM Step 2: Install dependencies
echo [2/5] Installing dependencies...
call npm install
if errorlevel 1 (
    echo ERROR: npm install failed!
    pause
    exit /b 1
)
echo.

REM Step 3: Show environment setup
echo [3/5] Environment configuration needed:
echo.
echo Please add these variables to Netlify Dashboard:
echo    Site Settings -^> Environment
echo.
type .env.bee-ship
echo.
echo Press any key when environment variables are added...
pause >nul
echo.

REM Step 4: Supabase bucket reminder
echo [4/5] Supabase Storage setup:
echo.
echo 1. Go to Supabase Dashboard -^> Storage
echo 2. Click "Create bucket"
echo 3. Name: assets
echo 4. Set to Public
echo 5. Click Create
echo.
echo Press any key when Supabase bucket is created...
pause >nul
echo.

REM Step 5: Test locally
echo [5/5] Testing locally...
echo.
echo Starting Netlify Dev server...
echo Open another terminal and run:
echo.
echo   curl -X POST http://localhost:8888/.netlify/functions/bee-ship ^
echo     -H "Content-Type: application/json" ^
echo     -d "{\"seed\":\"test\",\"platforms\":[\"instagram\"]}"
echo.
echo Press Ctrl+C to stop the server when done testing
echo.
call npx netlify dev

REM Done
echo.
echo ========================================
echo   SETUP COMPLETE!
echo ========================================
echo.
echo Next steps:
echo 1. Verify local test worked
echo 2. Commit: git add .
echo 3. Commit: git commit -F COMMIT_MESSAGE.md
echo 4. Deploy: git push origin main
echo.
echo See DEPLOYMENT_READY.md for full instructions
echo.
pause
