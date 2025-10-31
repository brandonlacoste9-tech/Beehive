# SHIP_COMPLETE_FINAL_WIN.ps1
# Windows PowerShell 5.1 compatible version
# Complete Beehive deployment

$ErrorActionPreference = "Stop"

Write-Host "`n🐝 Beehive Complete Deployment" -ForegroundColor Cyan
Write-Host "==============================`n" -ForegroundColor Cyan

# Create directories
$dirs = @(
    "lib\platforms",
    "app\lib",
    "data",
    "scripts"
)

Write-Host "Creating directories..." -ForegroundColor Yellow
foreach ($d in $dirs) {
    if (-not (Test-Path $d)) {
        New-Item -ItemType Directory -Path $d -Force | Out-Null
        Write-Host "  + $d" -ForegroundColor Gray
    }
}

Write-Host "`nCreating platform modules..." -ForegroundColor Yellow

# Instagram
$instagram = @'
export type InstagramConfig = { accountId: string; accessToken: string; };

export async function publishImage(
  config: InstagramConfig,
  imageUrl: string,
  caption: string
): Promise<{ containerId: string; publishedId: string }> {
  const { accountId, accessToken } = config;
  const createRes = await fetch(`https://graph.facebook.com/v17.0/${accountId}/media`, {
    method: "POST",
    body: new URLSearchParams({ image_url: imageUrl, caption, access_token: accessToken }),
  });
  const createData = await createRes.json();
  if (!createData.id) throw new Error(`Instagram create failed: ${JSON.stringify(createData)}`);

  const publishRes = await fetch(`https://graph.facebook.com/v17.0/${accountId}/media_publish`, {
    method: "POST",
    body: new URLSearchParams({ creation_id: createData.id, access_token: accessToken }),
  });
  const publishData = await publishRes.json();
  if (!publishData.id) throw new Error(`Instagram publish failed: ${JSON.stringify(publishData)}`);
  return { containerId: createData.id, publishedId: publishData.id };
}
'@
Set-Content -Path "lib\platforms\instagram.ts" -Value $instagram -Encoding UTF8

# TikTok
$tiktok = @'
export type TikTokConfig = { clientKey: string; clientSecret: string; accessToken: string; };
export async function publishVideo(config: TikTokConfig, videoUrl: string, title: string): Promise<{ shareId: string }> {
  throw new Error("TikTok publishing stub - implement per TikTok developer docs");
}
'@
Set-Content -Path "lib\platforms\tiktok.ts" -Value $tiktok -Encoding UTF8

# YouTube
$youtube = @'
import fs from "fs";
import os from "os";
import path from "path";
import { google } from "googleapis";

export type YouTubeConfig = { clientId: string; clientSecret: string; refreshToken: string; };

export async function publishVideo(
  config: YouTubeConfig,
  videoBuffer: Buffer,
  metadata: { title: string; description?: string; tags?: string[]; privacyStatus?: "public" | "private" | "unlisted"; }
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
        snippet: { title: metadata.title, description: metadata.description || "", tags: metadata.tags || [] },
        status: { privacyStatus: metadata.privacyStatus || "public" },
      },
      media: { body: fs.createReadStream(filepath) },
    });
    return { videoId: res.data.id! };
  } finally {
    try { await fs.promises.unlink(filepath); } catch {}
  }
}
'@
Set-Content -Path "lib\platforms\youtube.ts" -Value $youtube -Encoding UTF8

# Users helper
$users = @'
import fs from "node:fs/promises";
import path from "node:path";

type Customer = { email: string; status: "active" | "canceled"; provider: "stripe" | "coinbase"; sessionId?: string };
const FILE = path.join(process.cwd(), "data", "users.json");

export async function upsertCustomer(c: Customer) {
  await ensureFile();
  const raw = JSON.parse(await fs.readFile(FILE, "utf8")) as Customer[];
  const idx = raw.findIndex((x) => x.email === c.email);
  if (idx >= 0) raw[idx] = { ...raw[idx], ...c };
  else raw.push(c);
  await fs.writeFile(FILE, JSON.stringify(raw, null, 2), "utf8");
}

async function ensureFile() {
  try {
    await fs.mkdir(path.dirname(FILE), { recursive: true });
    await fs.access(FILE);
  } catch {
    await fs.writeFile(FILE, "[]", "utf8");
  }
}
'@
Set-Content -Path "app\lib\users.ts" -Value $users -Encoding UTF8

# Mailer
$mailer = @'
import nodemailer from "nodemailer";

const from = process.env.FROM_EMAIL || "AdGenXAI <no-reply@adgenxai.com>";

export async function sendWelcomeEmail({ to, plan }: { to: string; plan: string }) {
  const t = nodemailer.createTransport({
    host: process.env.SMTP_HOST!,
    port: Number(process.env.SMTP_PORT || 587),
    secure: false,
    auth: { user: process.env.SMTP_USER!, pass: process.env.SMTP_PASS! },
  });

  const html = `
    <div style="font-family:system-ui,sans-serif">
      <h2>Welcome to AdGenXAI ✨</h2>
      <p>Your <b>${plan}</b> subscription is active.</p>
      <p><a href="${process.env.NEXT_PUBLIC_SITE_URL}">Open AdGenXAI</a></p>
    </div>
  `;

  await t.sendMail({ to, from, subject: "Welcome to AdGenXAI", html });
}
'@
Set-Content -Path "app\lib\mailer.ts" -Value $mailer -Encoding UTF8

Set-Content -Path "data\users.json" -Value "[]" -Encoding UTF8

Write-Host "  ✓ All modules created" -ForegroundColor Green

# Env template
$env = @'
NEXT_PUBLIC_SITE_URL=http://localhost:3000
STRIPE_SECRET_KEY=sk_test_...
COINBASE_API_KEY=...
SUPABASE_URL=https://xxx.supabase.co
BEE_API_URL=https://www.adgenxai.pro/api
'@
Set-Content -Path ".env.example" -Value $env -Encoding UTF8

Write-Host "`n✓ Complete! Files created successfully.`n" -ForegroundColor Green
Write-Host "Next: Install dependencies and configure env vars`n" -ForegroundColor Yellow
