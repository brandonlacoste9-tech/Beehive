@echo off
REM === Bee-Ship Deployment Script ===
REM Run this script to set up all bee-ship files

echo Creating lib\platforms directory...
if not exist lib\platforms mkdir lib\platforms

echo Moving platform modules into place...
if exist instagram-temp.ts move /Y instagram-temp.ts lib\platforms\instagram.ts
if exist tiktok-temp.ts move /Y tiktok-temp.ts lib\platforms\tiktok.ts
if exist youtube-temp.ts move /Y youtube-temp.ts lib\platforms\youtube.ts

echo.
echo ================================
echo Bee-Ship Setup Complete!
echo ================================
echo.
echo Next steps:
echo 1. Install dependencies: npm install googleapis coinbase-commerce-node gray-matter marked
echo 2. Add environment variables to Netlify
echo 3. Create 'assets' bucket in Supabase
echo 4. Set up platform credentials (Instagram, YouTube, TikTok)
echo 5. Test locally: npx netlify dev
echo 6. Deploy: git add . && git commit -m "feat(bee): bee-ship extension" && git push
echo.
echo See README_BEESHIP.md for detailed setup instructions
echo.
pause
