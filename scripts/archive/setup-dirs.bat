@echo off
REM Complete setup for AdGenXAI enhancements
echo Setting up AdGenXAI enhancements...

REM Create directories
echo Creating directories...
if not exist "app\api\checkout" mkdir "app\api\checkout"
if not exist "app\api\stripe-webhook" mkdir "app\api\stripe-webhook"
if not exist "app\api\usage" mkdir "app\api\usage"
if not exist "app\api\crypto-feed" mkdir "app\api\crypto-feed"
if not exist "app\api\crypto" mkdir "app\api\crypto"
if not exist "app\api\crypto-webhook" mkdir "app\api\crypto-webhook"
if not exist "app\thanks" mkdir "app\thanks"
if not exist "data" mkdir "data"
if not exist "public" mkdir "public"
if not exist "content\posts" mkdir "content\posts"
if not exist "scripts" mkdir "scripts"

echo Directories created successfully!
echo.
echo Now run setup-enhancements.ps1 in PowerShell to install dependencies
echo Then manually create the API route files as documented
pause
