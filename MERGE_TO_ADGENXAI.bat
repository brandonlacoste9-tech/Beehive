@echo off
REM MERGE_TO_ADGENXAI.bat
REM Merges Beehive repo into AdGenXAI repo cleanly

echo ========================================
echo MERGING BEEHIVE INTO ADGENXAI
echo ========================================
echo.

REM Step 1: Navigate to AdGenXAI repo (adjust path if needed)
cd /d C:\Users\north\OneDrive\Documents\GitHub\AdGenXAI 2>nul
if errorlevel 1 (
    echo ERROR: AdGenXAI repo not found at C:\Users\north\OneDrive\Documents\GitHub\AdGenXAI
    echo Please adjust the path in this script.
    pause
    exit /b 1
)

echo [1/6] In AdGenXAI repo...
git status

echo.
echo [2/6] Adding Beehive as a remote...
git remote add beehive ..\Beehive 2>nul
git remote -v

echo.
echo [3/6] Fetching Beehive branches...
git fetch beehive

echo.
echo [4/6] Merging Beehive main into current branch (allow unrelated histories)...
git merge beehive/main --allow-unrelated-histories -m "feat: merge Beehive bee-ship platform modules and payment system"

echo.
echo [5/6] Resolving any conflicts (if any)...
git status

echo.
echo [6/6] Ready to push!
echo.
echo ========================================
echo MERGE COMPLETE!
echo ========================================
echo.
echo Next steps:
echo 1. Review the merge: git status
echo 2. If conflicts exist, resolve them manually
echo 3. Push to deploy: git push origin main
echo.
echo Your Netlify auto-deploy will pick this up immediately!
echo.
pause
