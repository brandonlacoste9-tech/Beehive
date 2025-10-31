@echo off
REM Setup script for crypto intel features

mkdir "app\api\crypto-intel\history" 2>nul
mkdir "app\api\checkout" 2>nul
mkdir "app\api\stripe-webhook" 2>nul
mkdir "app\api\crypto" 2>nul
mkdir "app\api\crypto-webhook" 2>nul
mkdir "app\api\usage" 2>nul
mkdir "app\thanks" 2>nul
mkdir "app\blog\[slug]" 2>nul
mkdir "content\posts" 2>nul
mkdir "scripts" 2>nul
mkdir "data" 2>nul

echo Directories created successfully!
echo.
echo Next steps:
echo 1. Run setup-crypto-files.ps1 to create all API files
echo 2. Install dependencies: npm i coinbase-commerce-node gray-matter marked
echo 3. Update .env with crypto/payment keys
echo.
pause
