@echo off
REM COPY_TO_ADGENXAI.bat
REM Copies specific Beehive files to AdGenXAI (cleaner than merge)

echo ========================================
echo COPYING BEEHIVE FILES TO ADGENXAI
echo ========================================
echo.

set SOURCE=C:\Users\north\OneDrive\Documents\GitHub\Beehive
set DEST=C:\Users\north\OneDrive\Documents\GitHub\AdGenXAI

REM Create directories in AdGenXAI
echo [1/3] Creating directories...
md "%DEST%\lib\platforms" 2>nul
md "%DEST%\netlify\functions" 2>nul
md "%DEST%\app\lib" 2>nul
md "%DEST%\app\api\checkout" 2>nul
md "%DEST%\app\api\stripe-webhook" 2>nul
md "%DEST%\app\api\crypto" 2>nul
md "%DEST%\app\api\crypto-webhook" 2>nul
md "%DEST%\app\api\usage" 2>nul
md "%DEST%\app\components" 2>nul
md "%DEST%\scripts" 2>nul
md "%DEST%\data" 2>nul

echo [2/3] Copying platform modules and functions...
REM Copy platform modules (will be created by scripts)
copy "%SOURCE%\SHIP_IT_NOW_COMPLETE.bat" "%DEST%\" 2>nul
copy "%SOURCE%\create-platforms-simple.ps1" "%DEST%\" 2>nul

REM Copy documentation
copy "%SOURCE%\BEE_SHIP_*.md" "%DEST%\" 2>nul
copy "%SOURCE%\START_HERE_BEE_SHIP.md" "%DEST%\" 2>nul

REM Copy deployment scripts
copy "%SOURCE%\SHIP_*.bat" "%DEST%\" 2>nul
copy "%SOURCE%\PUSH_*.bat" "%DEST%\" 2>nul
copy "%SOURCE%\deploy-*.ps1" "%DEST%\" 2>nul

echo [3/3] Files copied! Now navigate to AdGenXAI and commit...
echo.
echo ========================================
echo COPY COMPLETE!
echo ========================================
echo.
echo Next steps:
echo 1. cd C:\Users\north\OneDrive\Documents\GitHub\AdGenXAI
echo 2. Run: SHIP_IT_NOW_COMPLETE.bat (creates platform files)
echo 3. Run: git add -A
echo 4. Run: git commit -m "feat: add bee-ship platform from Beehive"
echo 5. Run: git push origin main
echo.
echo Your Netlify will auto-deploy! 🚀
echo.
pause
