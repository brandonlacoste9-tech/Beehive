// netlify/functions/bee-ship.ts
// Bee swarm publishing engine - generates, renders & ships to platforms
import type { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const BEE_API_URL = process.env.BEE_API_URL!;
const BEE_API_KEY = process.env.BEE_API_KEY!;
const RENDER_SERVICE_URL = process.env.RENDER_SERVICE_URL || null;

type CreativeResp = {
  headline?: string;
  caption?: string;
  imageUrl?: string;
  renderInstruction?: any;
  assets?: { filename: string; base64?: string; remoteUrl?: string }[];
};

async function askBeeAgent(seed: string, platforms: string[]): Promise<CreativeResp> {
  const resp = await fetch(`${BEE_API_URL}/agents/creative/run`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${BEE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ seed, platforms }),
  });
  if (!resp.ok) {
    throw new Error(`Bee agent generation failed: ${await resp.text()}`);
  }
  return resp.json();
}

async function renderViaService(instruction: any): Promise<{ buffer: Buffer; contentType: string; filename: string }> {
  if (!RENDER_SERVICE_URL) throw new Error("No RENDER_SERVICE_URL configured");
  const r = await fetch(`${RENDER_SERVICE_URL}/render`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ instruction }),
  });
  if (!r.ok) throw new Error("Render service failed: " + await r.text());
  const payload = await r.json();
  const buf = Buffer.from(payload.base64, "base64");
  return { buffer: buf, contentType: payload.content_type, filename: payload.filename };
}

async function uploadToSupabase(buffer: Buffer, path: string, contentType = "video/mp4") {
  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  
  const res = await supabase.storage.from("assets").upload(path, buffer, {
    contentType,
    upsert: true,
  });
  if (res.error) throw res.error;
  const pub = supabase.storage.from("assets").getPublicUrl(path);
  return pub.data.publicUrl;
}

async function publishToInstagram(instagramId: string, fbAccessToken: string, imageUrl: string, caption: string) {
  const createRes = await fetch(`https://graph.facebook.com/v17.0/${instagramId}/media`, {
    method: "POST",
    body: new URLSearchParams({
      image_url: imageUrl,
      caption,
      access_token: fbAccessToken
    })
  }).then(r => r.json());

  if (!createRes.id) throw new Error("Instagram media creation failed: " + JSON.stringify(createRes));

  const publishRes = await fetch(`https://graph.facebook.com/v17.0/${instagramId}/media_publish`, {
    method: "POST",
    body: new URLSearchParams({ creation_id: createRes.id, access_token: fbAccessToken })
  }).then(r => r.json());

  return { createRes, publishRes };
}

async function publishToTikTok() {
  throw new Error("TikTok publishing not implemented yet; fill with your TikTok publish flow");
}

async function publishToYouTube() {
  throw new Error("YouTube publishing not implemented in this stub; use googleapis client");
}

export const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  try {
    const body = event.body ? JSON.parse(event.body) : {};
    const seed = body.seed || "default campaign";
    const platforms: string[] = body.platforms || ["instagram"];
    const schedule = body.schedule || null;

    // 1) Generation
    const creative = await askBeeAgent(seed, platforms);

    // 2) Render or use existing asset
    let assetUrl = creative.imageUrl || null;
    if (!assetUrl && creative.renderInstruction && RENDER_SERVICE_URL) {
      const rendered = await renderViaService(creative.renderInstruction);
      const uploadPath = `bee/${Date.now()}-${rendered.filename}`;
      assetUrl = await uploadToSupabase(rendered.buffer, uploadPath, rendered.contentType);
    } else if (!assetUrl && creative.assets && creative.assets.length > 0) {
      const a = creative.assets[0];
      if (a.base64) {
        const buf = Buffer.from(a.base64, "base64");
        const uploadPath = `bee/${Date.now()}-${a.filename || "asset"}`;
        assetUrl = await uploadToSupabase(buf, uploadPath, "image/png");
      } else if (a.remoteUrl) {
        assetUrl = a.remoteUrl;
      }
    }

    if (!assetUrl) throw new Error("No asset available to publish");

    // 3) Publish per-platform
    const results: Record<string, any> = {};
    for (const p of platforms) {
      if (p === "instagram") {
        const IG_ID = process.env.INSTAGRAM_ACCOUNT_ID!;
        const FB_TOKEN = process.env.FB_ACCESS_TOKEN!;
        results.instagram = await publishToInstagram(IG_ID, FB_TOKEN, assetUrl, creative.caption || creative.headline || "");
      } else if (p === "tiktok") {
        results.tiktok = await publishToTikTok();
      } else if (p === "youtube") {
        results.youtube = await publishToYouTube();
      } else {
        results[p] = { error: "platform not supported" };
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
      body: JSON.stringify({ error: err?.message || String(err) }),
    };
  }
};
