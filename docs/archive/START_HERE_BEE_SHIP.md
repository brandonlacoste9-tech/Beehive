# 🚀 BEE-SHIP: YOUR DEPLOYMENT INSTRUCTIONS

## ⚡ INSTANT DEPLOY - 3 STEPS

You're 3 commands away from autonomous social publishing!

---

## Step 1: Create Platform Files

Double-click this file in Windows Explorer:
```
SHIP_IT_NOW_COMPLETE.bat
```

**OR** run from command prompt:
```batch
SHIP_IT_NOW_COMPLETE.bat
```

This creates all 3 platform integration files:
- ✅ `lib/platforms/instagram.ts`
- ✅ `lib/platforms/youtube.ts`
- ✅ `lib/platforms/tiktok.ts`

---

## Step 2: Run Pre-Flight Check

```powershell
powershell -File deploy-bee-ship-final.ps1
```

This will check:
- ✅ All files exist
- ✅ Dependencies status
- ✅ Git status
- ✅ Deployment readiness

---

## Step 3: Deploy to Netlify

```bash
git add lib/platforms/*.ts netlify/functions/bee-ship.ts scripts/ship-swarm.* BEE_SHIP_*.md
git commit -m "feat(bee): autonomous social publishing system 🐝"
git push origin main
```

**Your Netlify auto-deploy is already active** - it will deploy automatically!

---

## ⚙️ BEFORE DEPLOYING: Set Environment Variables

Go to: **Netlify Dashboard → Site Settings → Environment Variables**

### Minimum (Instagram only):
```
BEE_API_URL=https://www.adgenxai.pro/api
BEE_API_KEY=<your-key>
SUPABASE_URL=<your-url>
SUPABASE_SERVICE_ROLE_KEY=<your-key>
INSTAGRAM_ACCOUNT_ID=<your-id>
FB_ACCESS_TOKEN=<your-token>
```

### Optional (YouTube & TikTok):
```
YOUTUBE_CLIENT_ID=<id>
YOUTUBE_CLIENT_SECRET=<secret>
YOUTUBE_REFRESH_TOKEN=<token>
TIKTOK_CLIENT_KEY=<key>
TIKTOK_CLIENT_SECRET=<secret>
```

---

## 📦 WHAT YOU'RE DEPLOYING

### Main System
- **bee-ship function** - Generates creatives + publishes to platforms
- **Instagram integration** - Posts images to Instagram Business account
- **YouTube integration** - Uploads videos (with OAuth2)
- **TikTok integration** - Stub ready for implementation

### Tools
- **ship-swarm scripts** - Bulk deployment (PowerShell + Bash)
- **Complete documentation** - 4 detailed markdown guides

---

## 🧪 AFTER DEPLOYMENT: Test It

### Wait 2-3 minutes for Netlify build

### Then test:

```bash
curl -X POST https://adgenxai.netlify.app/.netlify/functions/bee-ship \
  -H "Content-Type: application/json" \
  -d '{"seed":"test-ad","platforms":["instagram"]}'
```

### Or use swarm mode:

```powershell
.\scripts\ship-swarm.ps1
```

---

## 📊 Monitor

- **Netlify logs**: Netlify → Functions → bee-ship → Logs
- **Supabase storage**: Supabase Dashboard → Storage → assets
- **Instagram**: Your Instagram Business account feed

---

## 🐝 How It Works

```
User runs ship-swarm
     ↓
bee-ship function called
     ↓
Bee Agent generates creative
     ↓
Asset uploaded to Supabase
     ↓
Published to Instagram/YouTube/TikTok
     ↓
Results returned with URLs
```

---

## 📚 Documentation Files

- **BEE_SHIP_README_COMPLETE.md** - System overview
- **BEE_SHIP_DEPLOYMENT_COMPLETE.md** - Detailed deployment guide
- **BEE_SHIP_FILES_COMPLETE.md** - Complete code listings
- **BEE_SHIP_COMPLETE_PACKAGE.md** - Original file reference

---

## 🎯 READY? RUN THESE NOW:

```batch
REM 1. Create files
SHIP_IT_NOW_COMPLETE.bat

REM 2. Check status
powershell -File deploy-bee-ship-final.ps1

REM 3. Deploy
git add .
git commit -m "feat(bee): autonomous social publishing 🐝"
git push origin main
```

---

## 🎉 That's It!

Your autonomous Bee swarm will be live in ~3 minutes after you push!

**The future of autonomous marketing starts now.** 🐝✨

---

*Questions? Check the other BEE_SHIP_*.md files for detailed guides and troubleshooting.*
