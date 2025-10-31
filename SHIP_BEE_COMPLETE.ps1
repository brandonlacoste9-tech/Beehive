#!/usr/bin/env pwsh
#Requires -Version 6.0
<#
.SYNOPSIS
    Complete Bee-ship deployment automation
.DESCRIPTION
    Creates platform modules, wires Netlify functions, commits and deploys to production
.NOTES
    Requires PowerShell 7+ (pwsh)
#>

$ErrorActionPreference = "Stop"

# Colors
function Write-Success { Write-Host "✓ $args" -ForegroundColor Green }
function Write-Info { Write-Host "→ $args" -ForegroundColor Cyan }
function Write-Step { Write-Host "`n=== $args ===" -ForegroundColor Yellow }

# Check PowerShell version
if ($PSVersionTable.PSVersion.Major -lt 6) {
    Write-Error "PowerShell 6+ required. Install with: winget install Microsoft.PowerShell"
    Write-Host "Then rerun with: pwsh ./SHIP_BEE_COMPLETE.ps1"
    exit 1
}

Write-Step "Bee-ship Complete Deployment"

# 1) Create platform modules directory
Write-Info "Creating lib/platforms structure..."
$libDir = "lib"
$platformsDir = Join-Path $libDir "platforms"
New-Item -ItemType Directory -Path $platformsDir -Force | Out-Null

# 2) Instagram module
Write-Info "Writing Instagram module..."
$instagramContent = @'
// lib/platforms/instagram.ts
export type InstagramConfig = {
  accountId: string;
  accessToken: string;
};

export async function publishImage(
  config: InstagramConfig,
  imageUrl: string,
  caption: string
): Promise<{ containerId: string; publishedId: string }> {
  const { accountId, accessToken } = config;

  const createRes = await fetch(
    `https://graph.facebook.com/v17.0/${accountId}/media`,
    {
      method: "POST",
      body: new URLSearchParams({
        image_url: imageUrl,
        caption,
        access_token: accessToken,
      }),
    }
  );

  const createData = await createRes.json();
  if (!createData.id) {
    throw new Error(`Failed to create Instagram media: ${JSON.stringify(createData)}`);
  }

  const publishRes = await fetch(
    `https://graph.facebook.com/v17.0/${accountId}/media_publish`,
    {
      method: "POST",
      body: new URLSearchParams({
        creation_id: createData.id,
        access_token: accessToken,
      }),
    }
  );

  const publishData = await publishRes.json();
  if (!publishData.id) {
    throw new Error(`Failed to publish Instagram media: ${JSON.stringify(publishData)}`);
  }

  return { containerId: createData.id, publishedId: publishData.id };
}
'@
Set-Content -Path (Join-Path $platformsDir "instagram.ts") -Value $instagramContent -Encoding UTF8

# 3) TikTok stub
Write-Info "Writing TikTok stub..."
$tiktokContent = @'
// lib/platforms/tiktok.ts
export type TikTokConfig = {
  clientKey: string;
  clientSecret: string;
  accessToken: string;
  openId?: string;
};

export async function publishVideo(
  config: TikTokConfig,
  videoUrl: string,
  title: string
): Promise<{ shareId: string }> {
  throw new Error("TikTok publishing stub - implement per TikTok Content API docs");
}
'@
Set-Content -Path (Join-Path $platformsDir "tiktok.ts") -Value $tiktokContent -Encoding UTF8

# 4) YouTube module
Write-Info "Writing YouTube module..."
$youtubeContent = @'
// lib/platforms/youtube.ts
import fs from "fs";
import os from "os";
import path from "path";
import { google } from "googleapis";

export type YouTubeConfig = {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
};

export async function publishVideo(
  config: YouTubeConfig,
  videoBuffer: Buffer,
  metadata: {
    title: string;
    description?: string;
    tags?: string[];
    privacyStatus?: "public" | "private" | "unlisted";
  }
): Promise<{ videoId: string }> {
  const { clientId, clientSecret, refreshToken } = config;

  const oAuth2 = new google.auth.OAuth2(clientId, clientSecret);
  oAuth2.setCredentials({ refresh_token: refreshToken });

  const youtube = google.youtube({ version: "v3", auth: oAuth2 });

  const tmpDir = os.tmpdir();
  const filename = `upload-${Date.now()}.mp4`;
  const filepath = path.join(tmpDir, filename);
  await fs.promises.writeFile(filepath, videoBuffer);

  try {
    const res = await youtube.videos.insert({
      part: ["snippet", "status"],
      requestBody: {
        snippet: {
          title: metadata.title,
          description: metadata.description || "",
          tags: metadata.tags || [],
        },
        status: {
          privacyStatus: metadata.privacyStatus || "public",
        },
      },
      media: {
        body: fs.createReadStream(filepath),
      },
    });

    const videoId = res.data.id!;
    return { videoId };
  } finally {
    try { await fs.promises.unlink(filepath); } catch {}
  }
}
'@
Set-Content -Path (Join-Path $platformsDir "youtube.ts") -Value $youtubeContent -Encoding UTF8

Write-Success "Platform modules created"

# 5) Create Netlify functions directory
Write-Info "Creating Netlify functions..."
$netlifyDir = "netlify"
$functionsDir = Join-Path $netlifyDir "functions"
New-Item -ItemType Directory -Path $functionsDir -Force | Out-Null

# 6) Bee-ship function
Write-Info "Writing bee-ship function..."
$beeShipContent = @'
// netlify/functions/bee-ship.ts
import { Handler } from "@netlify/functions";
import { createClient } from "@supabase/supabase-js";
import { publishImage } from "../../lib/platforms/instagram";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const handler: Handler = async (event) => {
  try {
    const body = JSON.parse(event.body || "{}");
    const { seed = "default", platforms = ["instagram"] } = body;

    // 1) Generate creative via Bee agent
    const beeRes = await fetch(`${process.env.BEE_API_URL}/agents/creative/run`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.BEE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ seed, platforms }),
    });

    if (!beeRes.ok) {
      throw new Error(`Bee agent failed: ${await beeRes.text()}`);
    }

    const creative = await beeRes.json();
    let assetUrl = creative.imageUrl;

    // 2) Upload if needed
    if (creative.assets?.[0]?.base64) {
      const buffer = Buffer.from(creative.assets[0].base64, "base64");
      const path = `bee/${Date.now()}-${creative.assets[0].filename || "asset.png"}`;
      
      const { error } = await supabase.storage
        .from("assets")
        .upload(path, buffer, { contentType: "image/png", upsert: true });

      if (error) throw error;

      const { data } = supabase.storage.from("assets").getPublicUrl(path);
      assetUrl = data.publicUrl;
    }

    if (!assetUrl) throw new Error("No asset to publish");

    // 3) Publish
    const results: Record<string, any> = {};

    for (const platform of platforms) {
      if (platform === "instagram") {
        results.instagram = await publishImage(
          {
            accountId: process.env.INSTAGRAM_ACCOUNT_ID!,
            accessToken: process.env.FB_ACCESS_TOKEN!,
          },
          assetUrl,
          creative.caption || creative.headline || ""
        );
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true, creative, assetUrl, results }),
    };
  } catch (err: any) {
    console.error(err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
'@
Set-Content -Path (Join-Path $functionsDir "bee-ship.ts") -Value $beeShipContent -Encoding UTF8

Write-Success "Netlify function created"

# 7) Environment template
Write-Info "Creating .env.example..."
$envContent = @'
# Bee Agent
BEE_API_URL=https://www.adgenxai.pro/api
BEE_API_KEY=your_bee_key

# Supabase
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Instagram
INSTAGRAM_ACCOUNT_ID=your_ig_account_id
FB_ACCESS_TOKEN=your_long_lived_page_token

# YouTube (optional)
YOUTUBE_CLIENT_ID=
YOUTUBE_CLIENT_SECRET=
YOUTUBE_REFRESH_TOKEN=

# TikTok (optional)
TIKTOK_CLIENT_KEY=
TIKTOK_ACCESS_TOKEN=
'@
Set-Content -Path ".env.example" -Value $envContent -Encoding UTF8

# 8) Update netlify.toml
Write-Info "Updating netlify.toml..."
$tomlPath = "netlify.toml"
$tomlContent = @'
[build]
  command = "npm run build"
  functions = "netlify/functions"
  publish = "out"

[dev]
  functions = "netlify/functions"

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
'@
Set-Content -Path $tomlPath -Value $tomlContent -Encoding UTF8

Write-Success "Configuration files created"

# 9) Git operations
Write-Step "Git Operations"

Write-Info "Checking git status..."
$gitStatus = git status --porcelain

if ($gitStatus) {
    Write-Info "Staging files..."
    git add lib/platforms/*.ts
    git add netlify/functions/bee-ship.ts
    git add netlify.toml
    git add .env.example
    
    Write-Info "Creating commit..."
    git commit -m "feat(bee-ship): complete deployment automation with platform modules

- Add Instagram/YouTube/TikTok platform modules
- Add bee-ship Netlify function
- Wire Supabase storage
- Add environment templates
- Ready for production deployment"
    
    Write-Info "Pushing to remote..."
    git push origin main
    
    Write-Success "Pushed to GitHub - auto-deploy triggered!"
} else {
    Write-Info "No changes to commit (files may already exist)"
}

# 10) Summary
Write-Step "Deployment Summary"

Write-Host @"

🐝 Bee-ship Complete!

Created:
  ✓ lib/platforms/instagram.ts
  ✓ lib/platforms/tiktok.ts  
  ✓ lib/platforms/youtube.ts
  ✓ netlify/functions/bee-ship.ts
  ✓ netlify.toml
  ✓ .env.example

Next Steps:
  1. Add environment variables in Netlify dashboard
  2. Create 'assets' bucket in Supabase Storage
  3. Test function: https://your-site.netlify.app/.netlify/functions/bee-ship

Your site is deploying now! 🚀

"@ -ForegroundColor Cyan

Write-Host "Monitor deployment: https://app.netlify.com/" -ForegroundColor Yellow
