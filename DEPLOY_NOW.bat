@echo off
REM Quick launcher for complete bee-ship deployment

echo.
echo ========================================================
echo    LAUNCHING BEE-SHIP COMPLETE DEPLOYMENT
echo ========================================================
echo.

REM Check if PowerShell Core is available
where pwsh >nul 2>&1
if %errorlevel% equ 0 (
    echo Using PowerShell Core...
    pwsh -ExecutionPolicy Bypass -File deploy-bee-ship-complete.ps1
) else (
    echo PowerShell Core not found. Using Windows PowerShell...
    powershell -ExecutionPolicy Bypass -File deploy-bee-ship-complete.ps1
)

echo.
echo Done! Check the output above for next steps.
echo.
pause
