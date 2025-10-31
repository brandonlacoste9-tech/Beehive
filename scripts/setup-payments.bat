@echo off
REM Beehive Production Payment Stack Setup
echo Creating directory structure...

if not exist "app\api\checkout" mkdir "app\api\checkout"
if not exist "app\api\stripe-webhook" mkdir "app\api\stripe-webhook"
if not exist "app\api\crypto" mkdir "app\api\crypto"
if not exist "app\api\crypto-webhook" mkdir "app\api\crypto-webhook"
if not exist "app\api\usage" mkdir "app\api\usage"
if not exist "app\lib" mkdir "app\lib"
if not exist "data" mkdir "data"

echo [] > "data\users.json"

echo Installing dependencies...
call npm install stripe coinbase-commerce-node nodemailer next-sitemap
call npm install -D @types/nodemailer

echo.
echo ================================
echo Setup complete!
echo.
echo Next steps:
echo 1. Copy API route files from FINAL_STEPS.md
echo 2. Configure .env with Stripe/Coinbase keys
echo 3. Run: npm run dev
echo ================================
