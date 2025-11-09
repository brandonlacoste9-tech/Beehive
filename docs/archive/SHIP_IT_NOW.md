# 🚀 SHIP IT NOW - Complete Deployment Guide

## 🎯 What You Have

Your Beehive repo is **100% ready** for bee-ship autonomous publishing across Instagram, YouTube, and TikTok.

## ⚡ FASTEST PATH (5 Minutes)

### Option 1: Fully Automated
```cmd
QUICKSTART.bat
```

This single command:
1. ✅ Sets up platform modules
2. ✅ Installs all dependencies  
3. ✅ Prompts for environment setup
4. ✅ Reminds about Supabase bucket
5. ✅ Tests locally

### Option 2: Manual Steps
```cmd
REM 1. Setup
deploy-bee-ship.bat

REM 2. Install  
npm install

REM 3. Configure (see below)

REM 4. Test
npx netlify dev

REM 5. Deploy
git add .
git commit -F COMMIT_MESSAGE.md
git push origin main
```

## 📋 Configuration Checklist

### ✅ Netlify Environment Variables

**Netlify Dashboard → Site Settings → Environment → Add variable**

Minimum required (Instagram only):
```
BEE_API_URL=https://www.adgenxai.pro/api
BEE_API_KEY=your_bee_key
SUPABASE_URL=https://yourproject.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_key
INSTAGRAM_ACCOUNT_ID=your_ig_id
FB_ACCESS_TOKEN=your_fb_token
```

Full setup (all platforms):
```
# Copy entire .env.bee-ship template
# Replace placeholders with real values
```

### ✅ Supabase Storage

1. Dashboard → Storage → Create bucket
2. Name: `assets`
3. Public: Yes (or configure signed URLs)
4. Save

### ✅ Platform Credentials

**Instagram**  
→ See `BEE_SHIP_README.md` → "Platform Setup → Instagram"

**YouTube**  
→ See `BEE_SHIP_README.md` → "Platform Setup → YouTube"

**TikTok**  
→ See `BEE_SHIP_README.md` → "Platform Setup → TikTok"

## 🧪 Testing

### Local Test
```cmd
REM Terminal 1
npx netlify dev

REM Terminal 2  
curl -X POST http://localhost:8888/.netlify/functions/bee-ship ^
  -H "Content-Type: application/json" ^
  -d "{\"seed\":\"test\",\"platforms\":[\"instagram\"]}"
```

Expected response:
```json
{
  "ok": true,
  "creative": {...},
  "assetUrl": "https://...supabase.co/storage/v1/object/public/assets/...",
  "results": {
    "instagram": {
      "containerId": "...",
      "publishedId": "..."
    }
  }
}
```

### Production Test
```bash
curl -X POST https://yoursite.netlify.app/.netlify/functions/bee-ship \
  -H "Content-Type: application/json" \
  -d '{"seed":"summer-sale","platforms":["instagram","youtube"]}'
```

## 📊 What Gets Created

### Directory Structure
```
Beehive/
├── lib/platforms/          ← Platform integration modules
│   ├── instagram.ts
│   ├── youtube.ts
│   └── tiktok.ts
├── netlify/functions/
│   └── bee-ship.ts         ← Main serverless handler
├── scripts/
│   ├── ship-swarm.sh       ← Bulk ship (Linux/Mac)
│   └── ship-swarm.ps1      ← Bulk ship (Windows)
├── Documentation files (7 total)
├── Setup scripts (3 files)
└── package.json (updated with new deps)
```

### Files Created

| File | Purpose |
|------|---------|
| `QUICKSTART.bat` | One-command deployment |
| `deploy-bee-ship.bat` | Platform module setup |
| `create-platforms.bat` | Directory creator |
| `DEPLOYMENT_READY.md` | Final summary |
| `BEE_SHIP_FILES_SUMMARY.md` | Files overview |
| `COMMIT_MESSAGE.md` | Git commit template |
| `SHIP_IT_NOW.md` | This file |
| `README_BEESHIP.md` | Technical docs |
| `BEE_SHIP_README.md` | Quick start |
| `BEE_SHIP_DEPLOYMENT.md` | Deployment checklist |
| `.env.bee-ship` | Environment template |
| `instagram-temp.ts` | Instagram module (temp) |
| `youtube-temp.ts` | YouTube module (temp) |
| `tiktok-temp.ts` | TikTok module (temp) |

## 🚢 Deploy to Production

### Step 1: Commit
```cmd
git add .
git commit -F COMMIT_MESSAGE.md
```

Or manually:
```cmd
git add .
git commit -m "feat(bee): bee-ship autonomous publishing extension"
```

### Step 2: Push
```cmd
git push origin main
```

Netlify will automatically:
1. Detect changes
2. Build the site
3. Deploy the new function
4. Make it live

### Step 3: Verify
```cmd
REM Check function is live
curl https://yoursite.netlify.app/.netlify/functions/bee-ship

REM Should return: {"error":"..."}  (needs POST request)
```

## 🔄 Usage Examples

### Single Creative
```bash
curl -X POST https://yoursite.netlify.app/.netlify/functions/bee-ship \
  -H "Content-Type: application/json" \
  -d '{"seed":"product-launch","platforms":["instagram"]}'
```

### Multiple Platforms
```bash
curl -X POST https://yoursite.netlify.app/.netlify/functions/bee-ship \
  -H "Content-Type: application/json" \
  -d '{"seed":"brand-awareness","platforms":["instagram","youtube","tiktok"]}'
```

### Bulk Ship (Windows)
```cmd
.\scripts\ship-swarm.ps1 -ApiUrl "https://yoursite.netlify.app/.netlify/functions/bee-ship"
```

### Bulk Ship (Linux/Mac)
```bash
./scripts/ship-swarm.sh https://yoursite.netlify.app/.netlify/functions/bee-ship
```

### Scheduled (GitHub Actions)

Create `.github/workflows/bee-ship-daily.yml`:

```yaml
name: Daily Bee Ship
on:
  schedule:
    - cron: '0 14 * * *'  # 2 PM UTC
  workflow_dispatch:

jobs:
  ship:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: ./scripts/ship-swarm.sh ${{ secrets.BEE_SHIP_URL }}
```

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| `platforms not found` | Run `deploy-bee-ship.bat` |
| `Cannot find module` | Run `npm install` |
| `Missing env variables` | Add to Netlify Dashboard |
| `Instagram 403` | Check token expiry/scopes |
| `Supabase error` | Create `assets` bucket |
| `YouTube quota` | Wait 24h or request increase |
| `Function timeout` | Increase timeout in netlify.toml |

## 📚 Documentation Map

**Start here:**
1. `SHIP_IT_NOW.md` ← You are here
2. `DEPLOYMENT_READY.md` - Quick overview
3. `BEE_SHIP_README.md` - Quick start

**Detailed guides:**
4. `README_BEESHIP.md` - Technical documentation
5. `BEE_SHIP_DEPLOYMENT.md` - Full deployment checklist

**Reference:**
6. `BEE_SHIP_FILES_SUMMARY.md` - What was created
7. `COMMIT_MESSAGE.md` - Git commit template
8. `.env.bee-ship` - Environment template

## ⚡ Quick Commands

```cmd
REM Full automated setup
QUICKSTART.bat

REM Manual setup
deploy-bee-ship.bat
npm install
npx netlify dev

REM Commit & deploy
git add .
git commit -F COMMIT_MESSAGE.md
git push

REM View logs
netlify logs --function bee-ship

REM Bulk ship
.\scripts\ship-swarm.ps1 -ApiUrl "https://yoursite.netlify.app/.netlify/functions/bee-ship"
```

## ✅ Final Checklist

Before going live:
- [ ] Platform modules set up (`deploy-bee-ship.bat`)
- [ ] Dependencies installed (`npm install`)
- [ ] Environment variables added to Netlify
- [ ] Supabase `assets` bucket created
- [ ] Platform credentials configured
- [ ] Local test successful
- [ ] Committed and pushed
- [ ] Production test successful
- [ ] Monitoring set up (optional)

## 🎉 You're Ready!

Everything is prepared. Just run:

```cmd
QUICKSTART.bat
```

Then add your environment variables, and you're **LIVE**!

---

## 🚀 SHIP IT!

Questions? Check the documentation files or review function code comments.

**🐝 Let the autonomous swarm publish!** 🚢
