# 🐝 Beehive Deployment Scripts

Complete automation for deploying the Bee-ship autonomous content generation and publishing system.

## Quick Start

### One-Command Deployment (Windows)

Double-click or run:

```batch
SHIP_IT_NOW.bat
```

This will:
1. Create all platform modules
2. Set up Netlify functions
3. Install dependencies
4. Build the project
5. Create a feature branch
6. Optionally push and create PR

### Manual Steps (Cross-Platform)

#### 1. Deploy Package

```powershell
pwsh ./deploy-complete.ps1
```

**Options:**
- `-SkipDeps` - Skip npm install
- `-SkipBuild` - Skip build check
- `-DryRun` - Show what would happen without executing
- `-Branch "custom-branch"` - Use custom branch name

#### 2. Push to GitHub

```powershell
pwsh ./push-and-deploy.ps1 -CreatePR
```

**Options:**
- `-CreatePR` - Auto-create Pull Request using gh CLI
- `-Force` - Skip branch verification prompt
- `-Branch "custom-branch"` - Use custom branch name

#### 3. Verify Deployment

Follow **DEPLOYMENT_VERIFICATION.md** checklist.

## What Gets Created

### Platform Modules
- `lib/platforms/instagram.ts` - Instagram Graph API integration
- `lib/platforms/youtube.ts` - YouTube Data API v3 integration
- `lib/platforms/tiktok.ts` - TikTok stub (implement as needed)

### Netlify Functions
- `netlify/functions/bee-ship.ts` - Main bee-ship orchestration function

### Scripts
- `deploy-complete.ps1` - Complete deployment automation
- `push-and-deploy.ps1` - Git push and PR creation
- `SHIP_IT_NOW.bat` - Windows one-click deployment

## Requirements

### Software
- **PowerShell 7+** (`pwsh`) - [Download](https://aka.ms/powershell)
  - Windows: `winget install Microsoft.PowerShell`
- **Node.js 18+** - [Download](https://nodejs.org)
- **Git** - [Download](https://git-scm.com)
- **GitHub CLI** (optional, for PR creation) - `winget install GitHub.cli`
- **Netlify CLI** (optional, for direct deploy) - `npm i -g netlify-cli`

### Environment Variables

Set these in **Netlify Dashboard → Site Settings → Environment**:

#### Core
- `BEE_API_URL` - Bee agent endpoint
- `BEE_API_KEY` - Bee API authentication

#### Storage
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

#### Platforms
- `INSTAGRAM_ACCOUNT_ID`
- `FB_ACCESS_TOKEN`
- `YOUTUBE_CLIENT_ID`, `YOUTUBE_CLIENT_SECRET`, `YOUTUBE_REFRESH_TOKEN`

#### Payments
- `STRIPE_SECRET_KEY`, `STRIPE_PRICE_MONTHLY`, `STRIPE_WEBHOOK_SECRET`
- `COINBASE_API_KEY`, `COINBASE_WEBHOOK_SECRET`

#### Email
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `FROM_EMAIL`

See `.env.example` for complete list.

## Deployment Flow

```
┌─────────────────────┐
│  deploy-complete.ps1│
│  • Creates modules  │
│  • Installs deps    │
│  • Builds project   │
│  • Commits changes  │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ push-and-deploy.ps1 │
│  • Pushes to GitHub │
│  • Creates PR       │
│  • Triggers Netlify │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   Netlify Build     │
│  • Auto-deploy on   │
│    merge to main    │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   Verification      │
│  • Test functions   │
│  • Check platforms  │
└─────────────────────┘
```

## Testing

### Local Testing

```powershell
# Start Netlify dev server
netlify dev

# Test bee-ship function
curl -X POST http://localhost:8888/.netlify/functions/bee-ship `
  -H "Content-Type: application/json" `
  -d '{"seed":"test","platforms":["instagram"]}'
```

### Production Testing

```bash
curl -X POST https://your-site.netlify.app/.netlify/functions/bee-ship \
  -H "Content-Type: application/json" \
  -d '{"seed":"launch","platforms":["instagram","youtube"]}'
```

**Expected response:**
```json
{
  "ok": true,
  "creative": {
    "headline": "...",
    "caption": "...",
    "imageUrl": "https://..."
  },
  "assetUrl": "https://...",
  "results": {
    "instagram": {
      "containerId": "...",
      "publishedId": "..."
    }
  }
}
```

## Troubleshooting

### "PowerShell version too old"
**Solution:** Install PowerShell 7+
```powershell
winget install Microsoft.PowerShell
```

### "Build failed"
**Solutions:**
- Check Node version: `node --version` (need 18+)
- Clear cache: `rm -rf .next node_modules && npm ci`
- Check TypeScript: `npm run typecheck`

### "Function returns 500"
**Solutions:**
- Check Netlify function logs
- Verify env vars in Netlify UI
- Test Bee API directly
- Check Supabase permissions

### "Instagram publish fails"
**Solutions:**
- Verify `INSTAGRAM_ACCOUNT_ID` is Business Account ID (not username)
- Check token scopes: `instagram_content_publish`, `instagram_basic`
- Test Graph API:
  ```bash
  curl "https://graph.facebook.com/v17.0/me?access_token=$FB_ACCESS_TOKEN"
  ```

## Documentation

- **DEPLOYMENT_VERIFICATION.md** - Complete deployment checklist
- **BEE_SHIP_DEPLOYMENT.md** - Architecture and technical details
- **.env.example** - Environment variable template
- **README_BEESHIP.md** - Bee-ship feature overview

## Files Created by Scripts

After running `deploy-complete.ps1`:

```
lib/
  platforms/
    instagram.ts       ✓ Instagram Graph API
    youtube.ts         ✓ YouTube Data API v3
    tiktok.ts          ✓ TikTok stub

netlify/
  functions/
    bee-ship.ts        ✓ Main orchestration

package.json           ✓ Updated with deps
package-lock.json      ✓ Locked versions
```

## Support

**Issues?**
- Review **DEPLOYMENT_VERIFICATION.md** troubleshooting
- Check Netlify function logs
- Test components individually

**Questions?**
- Open GitHub issue
- Check platform documentation

---

🐝 **Your complete deployment package is ready!**

Run `SHIP_IT_NOW.bat` to begin, or follow the manual steps above.
