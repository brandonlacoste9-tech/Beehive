@echo off
echo Creating all production directories and files...

mkdir "public" 2>nul
mkdir "app\thanks" 2>nul
mkdir "app\blog" 2>nul
mkdir "app\blog\[slug]" 2>nul
mkdir "content\posts" 2>nul
mkdir "app\api\crypto-feed" 2>nul
mkdir "data" 2>nul

echo ✅ Directories created!
echo.
echo Now installing dependencies...
call npm install stripe coinbase-commerce-node nodemailer @stripe/stripe-js @stripe/react-stripe-js gray-matter marked next-sitemap @types/nodemailer
echo.
echo ✅ Dependencies installed!
echo.
echo NEXT STEPS:
echo 1. Copy remaining files manually from FINAL_STEPS.md into the new directories
echo 2. Add environment variables to Netlify
echo 3. Run: npm run dev
echo.
pause
