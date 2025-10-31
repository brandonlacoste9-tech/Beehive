@echo off
REM create-platforms.bat - Simple batch wrapper

echo Creating platform modules...

REM Create directory
if not exist lib\platforms mkdir lib\platforms

REM Run the PowerShell script
powershell.exe -ExecutionPolicy Bypass -File create-platforms-simple.ps1

echo.
echo Done! Platform modules created.
pause
