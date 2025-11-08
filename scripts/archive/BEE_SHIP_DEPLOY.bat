@echo off
REM BEE_SHIP_DEPLOY.bat - Complete Bee-ship deployment script
echo.
echo ===================================================
echo   BEE-SHIP AUTONOMOUS DEPLOYMENT
echo   Deploying the swarm to production...
echo ===================================================
echo.

REM Step 1: Create directories
echo [1/5] Creating directories...
if not exist lib\platforms mkdir lib\platforms
if not exist netlify\functions mkdir netlify\functions
if not exist scripts mkdir scripts
echo     ✓ Directories created

REM Step 2: Install dependencies  
echo.
echo [2/5] Installing dependencies...
call npm install --save @supabase/supabase-js googleapis coinbase-commerce-node
call npm install --save-dev @netlify/functions
echo     ✓ Dependencies installed

REM Step 3: Run platform creation script
echo.
echo [3/5] Creating platform modules...
powershell.exe -ExecutionPolicy Bypass -File create-platforms-simple.ps1
echo     ✓ Platform modules created

REM Step 4: Git operations
echo.
echo [4/5] Committing to git...
git add lib\platforms\*.ts
git add netlify\functions\bee-ship.ts
git add scripts\ship-swarm.ps1
git add create-platforms-simple.ps1
git add .env.bee-ship
git commit -m "feat(bee): add bee-ship extension for autonomous publishing"
echo     ✓ Changes committed

REM Step 5: Push to remote
echo.
echo [5/5] Pushing to GitHub...
git push origin main
echo     ✓ Pushed to GitHub

echo.
echo ===================================================
echo   🚀 BEE-SHIP DEPLOYED!
echo   Netlify will auto-deploy in ~2 minutes
echo ===================================================
echo.
echo Next steps:
echo  1. Add environment variables in Netlify dashboard
echo  2. Test with: scripts\ship-swarm.ps1
echo  3. Monitor at: https://app.netlify.com
echo.
pause
