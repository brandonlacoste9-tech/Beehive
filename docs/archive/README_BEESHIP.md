# 🐝 Bee-Ship Extension

## Overview

The **Bee-Ship** extension enables autonomous creative generation and publishing across Instagram, TikTok, and YouTube using your Bee agents powered by the Sensory Cortex.

## Architecture

```
User/Scheduler → bee-ship function → Bee Agent API → Creative Generation
                                   ↓
                            Renderer (optional)
                                   ↓
                            Supabase Storage
                                   ↓
                     Platform APIs (IG/TikTok/YouTube)
```

## Files

- `netlify/functions/bee-ship.ts` - Main serverless handler
- `lib/platforms/instagram.ts` - Instagram Graph API integration
- `lib/platforms/youtube.ts` - YouTube Data API integration  
- `lib/platforms/tiktok.ts` - TikTok API stub (implement per your access)
- `scripts/ship-swarm.{sh,ps1}` - Bulk shipping scripts

## Setup

### 1. Supabase Storage

1. Create bucket named `assets` in Supabase Dashboard → Storage
2. Configure public access or signed URLs as needed
3. Add CORS headers if renderer makes requests

### 2. Platform Credentials

#### Instagram
1. Create Facebook App
2. Enable Instagram Basic Display + Content Publishing
3. Get long-lived Page Access Token
4. Set `INSTAGRAM_ACCOUNT_ID` and `FB_ACCESS_TOKEN`

Required scopes: `instagram_basic`, `instagram_content_publish`

#### YouTube
1. Create OAuth2 client in Google Cloud Console
2. Enable YouTube Data API v3
3. Obtain refresh token via OAuth consent
4. Set `YOUTUBE_CLIENT_ID`, `YOUTUBE_CLIENT_SECRET`, `YOUTUBE_REFRESH_TOKEN`

Required scope: `https://www.googleapis.com/auth/youtube.upload`

#### TikTok
1. Create TikTok For Developers app
2. Get client_key and client_secret
3. Apply for Content Publishing access
4. Implement upload flow in `lib/platforms/tiktok.ts`

### 3. Environment Variables

Add to Netlify (Site settings → Environment):

```bash
BEE_API_URL=https://www.adgenxai.pro/api
BEE_API_KEY=<your-bee-key>
SUPABASE_URL=https://<project>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
INSTAGRAM_ACCOUNT_ID=<ig-account-id>
FB_ACCESS_TOKEN=<long-lived-token>
YOUTUBE_CLIENT_ID=<youtube-client-id>
YOUTUBE_CLIENT_SECRET=<youtube-secret>
YOUTUBE_REFRESH_TOKEN=<youtube-refresh>
```

### 4. Deploy

```bash
git add netlify/functions/bee-ship.ts lib/platforms/*.ts
git commit -m "feat(bee): add bee-ship extension"
git push origin main
```

Netlify will auto-deploy the function.

## Usage

### Manual Test

```bash
curl -X POST https://your-site.netlify.app/.netlify/functions/bee-ship \
  -H "Content-Type: application/json" \
  -d '{"seed":"test-campaign","platforms":["instagram"]}'
```

### Bulk Shipping

```bash
# Linux/Mac
./scripts/ship-swarm.sh https://your-site.netlify.app/.netlify/functions/bee-ship

# Windows
.\scripts\ship-swarm.ps1 -ApiUrl "https://your-site.netlify.app/.netlify/functions/bee-ship"
```

### Scheduled (GitHub Actions)

Create `.github/workflows/bee-ship-daily.yml`:

```yaml
name: Daily Bee Ship
on:
  schedule:
    - cron: '0 14 * * *'  # 2 PM UTC daily
  workflow_dispatch:

jobs:
  ship:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Ship creatives
        run: |
          ./scripts/ship-swarm.sh ${{ secrets.BEE_SHIP_URL }}
```

## Testing Checklist

- [ ] Bee agent returns valid creative JSON
- [ ] Asset uploads to Supabase `assets` bucket
- [ ] Instagram publish creates and publishes media
- [ ] YouTube upload succeeds (test with unlisted privacy)
- [ ] Function logs show no errors
- [ ] Sensory Cortex records publish events

## Security Notes

- Store all tokens in Netlify environment (never commit)
- Use service role key only server-side
- Review platform rate limits and quotas
- Test with private/unlisted posts before going public

## Troubleshooting

**Instagram fails**: Check token expiration, scopes, and account connection to Page

**YouTube 403**: Verify refresh token and API quota

**Asset upload fails**: Confirm Supabase bucket exists and permissions are correct

**TikTok not working**: Implement platform-specific flow in `lib/platforms/tiktok.ts`

## Next Steps

- Add retry logic and idempotency keys
- Implement approval workflow (draft → review → publish)
- Wire feedback to Sensory Cortex for learning
- Add video rendering microservice
- Support more platforms (LinkedIn, Twitter/X, Pinterest)

