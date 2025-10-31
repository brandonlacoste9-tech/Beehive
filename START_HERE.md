# 🎯 START HERE - Bee-Ship Deployment Index

## 👋 Welcome!

You have everything needed for autonomous bee-ship publishing. This document helps you navigate all the files.

---

## ⚡ FASTEST START (Choose One)

### 🚀 **Option A: Fully Automated** (Recommended)
```cmd
QUICKSTART.bat
```
**Time: 5 minutes** | Handles everything automatically

### 🔧 **Option B: Step-by-Step**
Read: `SHIP_IT_NOW.md`  
**Time: 10 minutes** | Full control over each step

### 📚 **Option C: Deep Dive**
Read: `README_BEESHIP.md`  
**Time: 30 minutes** | Understand every detail

---

## 📖 Documentation Guide

### For Impatient Developers (You!)
```
START → SHIP_IT_NOW.md → Run QUICKSTART.bat → DONE
```

### For Thorough Setup
```
1. READ: DEPLOYMENT_READY.md (overview)
2. READ: BEE_SHIP_README.md (quick start)
3. RUN: deploy-bee-ship.bat (setup)
4. READ: BEE_SHIP_DEPLOYMENT.md (configure)
5. RUN: npm install (dependencies)
6. RUN: npx netlify dev (test)
7. RUN: git push (deploy)
```

### For Technical Deep Dive
```
1. README_BEESHIP.md (architecture & API)
2. netlify/functions/bee-ship.ts (code)
3. lib/platforms/*.ts (integrations)
4. BEE_SHIP_DEPLOYMENT.md (ops)
```

---

## 📋 All Documentation Files

| File | Purpose | Read Time |
|------|---------|-----------|
| **START_HERE.md** | This file - navigation guide | 2 min |
| **SHIP_IT_NOW.md** | Complete deployment guide | 5 min |
| **DEPLOYMENT_READY.md** | Quick overview & checklist | 5 min |
| **BEE_SHIP_README.md** | Quick start with examples | 10 min |
| **README_BEESHIP.md** | Technical documentation | 20 min |
| **BEE_SHIP_DEPLOYMENT.md** | Detailed deployment guide | 15 min |
| **BEE_SHIP_FILES_SUMMARY.md** | What was created | 3 min |
| **COMMIT_MESSAGE.md** | Git commit template | 1 min |

---

## 🛠️ Setup Scripts

| Script | Purpose | When to Use |
|--------|---------|-------------|
| **QUICKSTART.bat** | Full automated setup | First time setup |
| **deploy-bee-ship.bat** | Platform modules setup | Required before first run |
| **create-platforms.bat** | Directory creator | Auto-run by deploy script |

---

## 📦 Code Files

### Platform Integration Modules
Location after setup: `lib/platforms/`

| File | Platform | Status |
|------|----------|--------|
| `instagram.ts` | Instagram (Facebook) | ✅ Complete |
| `youtube.ts` | YouTube (Google) | ✅ Complete |
| `tiktok.ts` | TikTok | ⚠️ Stub (implement per access) |

Temporary location (before setup): `*-temp.ts` files in root

### Serverless Function
| File | Purpose |
|------|---------|
| `netlify/functions/bee-ship.ts` | Main handler - orchestrates generation & publishing |

### Bulk Shipping Scripts
| File | Platform | Purpose |
|------|----------|---------|
| `scripts/ship-swarm.ps1` | Windows | Bulk publish multiple creatives |
| `scripts/ship-swarm.sh` | Linux/Mac | Bulk publish multiple creatives |

---

## ⚙️ Configuration Files

| File | Purpose | Commit? |
|------|---------|---------|
| `.env.bee-ship` | Environment template | ✅ Yes (template only) |
| `.env.local` | Your actual secrets | ❌ No (in .gitignore) |
| `package.json` | Dependencies (updated) | ✅ Yes |

---

## 🎯 What You Need to Do

### ✅ Step 1: Setup Platform Modules
```cmd
deploy-bee-ship.bat
```

### ✅ Step 2: Install Dependencies
```cmd
npm install
```

### ✅ Step 3: Configure Secrets

Add to **Netlify Dashboard → Site Settings → Environment**:

**Minimum (Instagram only):**
- `BEE_API_URL`
- `BEE_API_KEY`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `INSTAGRAM_ACCOUNT_ID`
- `FB_ACCESS_TOKEN`

**See `.env.bee-ship` for full list**

### ✅ Step 4: Create Supabase Bucket
1. Supabase Dashboard → Storage
2. Create bucket: `assets`
3. Set to public

### ✅ Step 5: Test
```cmd
npx netlify dev
```

### ✅ Step 6: Deploy
```cmd
git add .
git commit -F COMMIT_MESSAGE.md
git push origin main
```

---

## 🧪 Testing Commands

### Local Test
```cmd
REM Terminal 1
npx netlify dev

REM Terminal 2
curl -X POST http://localhost:8888/.netlify/functions/bee-ship ^
  -H "Content-Type: application/json" ^
  -d "{\"seed\":\"test\",\"platforms\":[\"instagram\"]}"
```

### Production Test
```bash
curl -X POST https://yoursite.netlify.app/.netlify/functions/bee-ship \
  -H "Content-Type: application/json" \
  -d '{"seed":"campaign","platforms":["instagram"]}'
```

### Bulk Ship
```cmd
REM Windows
.\scripts\ship-swarm.ps1 -ApiUrl "https://yoursite.netlify.app/.netlify/functions/bee-ship"

REM Linux/Mac
./scripts/ship-swarm.sh https://yoursite.netlify.app/.netlify/functions/bee-ship
```

---

## 🎓 Platform Setup Guides

### Instagram
**Location:** `BEE_SHIP_README.md` → Platform Setup → Instagram  
**What you need:** Facebook App, Page Access Token  
**Scopes:** `instagram_basic`, `instagram_content_publish`

### YouTube
**Location:** `BEE_SHIP_README.md` → Platform Setup → YouTube  
**What you need:** OAuth2 Client, Refresh Token  
**Scopes:** `youtube.upload`

### TikTok
**Location:** `BEE_SHIP_README.md` → Platform Setup → TikTok  
**What you need:** Developer App, Content API Access  
**Status:** Requires platform approval + custom implementation

---

## 🐛 Common Issues

| Error | Fix |
|-------|-----|
| "platforms directory not found" | Run `deploy-bee-ship.bat` |
| "Cannot find module 'googleapis'" | Run `npm install` |
| "Missing required env variables" | Add to Netlify environment |
| "Instagram 403 Forbidden" | Check token/scopes |
| "Supabase upload failed" | Create `assets` bucket |
| "YouTube quota exceeded" | Wait 24h or request increase |

**Full troubleshooting:** See `SHIP_IT_NOW.md` → Troubleshooting

---

## 📊 How It Works

```
User/Scheduler
     ↓
bee-ship function
     ↓
Bee Agent API ← Generates creative
     ↓
Renderer (optional) ← Renders video
     ↓
Supabase Storage ← Stores assets
     ↓
Platform APIs ← Publishes (Instagram/YouTube/TikTok)
```

**Detailed architecture:** See `README_BEESHIP.md` → Architecture

---

## 🎯 Quick Decision Tree

**"I want to ship NOW"**  
→ Run `QUICKSTART.bat`

**"I want to understand first"**  
→ Read `SHIP_IT_NOW.md`

**"I need technical details"**  
→ Read `README_BEESHIP.md`

**"I'm configuring platforms"**  
→ Read `BEE_SHIP_DEPLOYMENT.md`

**"Something broke"**  
→ Check `SHIP_IT_NOW.md` → Troubleshooting

**"What files were created?"**  
→ Read `BEE_SHIP_FILES_SUMMARY.md`

**"How do I commit this?"**  
→ Use `COMMIT_MESSAGE.md`

---

## 🚀 Ready to Launch?

### Absolute Fastest Path:
```cmd
REM 1. Setup everything
QUICKSTART.bat

REM 2. Add env vars to Netlify Dashboard

REM 3. Create Supabase 'assets' bucket

REM 4. Deploy
git add .
git commit -F COMMIT_MESSAGE.md
git push origin main
```

### Need Help?

1. Check this file's "Common Issues" section
2. Read the specific doc for your question
3. Review code comments in function files
4. Check Netlify function logs

---

## 📚 Additional Resources

- Instagram API: https://developers.facebook.com/docs/instagram-api
- YouTube API: https://developers.google.com/youtube/v3
- TikTok Developers: https://developers.tiktok.com
- Supabase Storage: https://supabase.com/docs/guides/storage
- Netlify Functions: https://docs.netlify.com/functions/overview

---

## ✅ Final Checklist

- [ ] Read this file (you're doing it!)
- [ ] Choose your path (automated / step-by-step / deep-dive)
- [ ] Run setup script
- [ ] Configure environment
- [ ] Create Supabase bucket
- [ ] Test locally
- [ ] Deploy
- [ ] Test production
- [ ] Monitor logs

---

## 🎉 You're All Set!

**Next action:**  
→ Run `QUICKSTART.bat` or read `SHIP_IT_NOW.md`

**Questions?**  
→ Check the relevant documentation file above

**Ready to ship?**  
→ Let's go! 🚀

---

**🐝 Happy autonomous publishing!**
