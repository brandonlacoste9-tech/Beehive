/**
 * Supabase storage helper: uploads a local file path to a bucket and returns a signed URL.
 * No-ops (returns null) if env is missing.
 */
import fs from "node:fs/promises";
import path from "node:path";

const URL = process.env.SUPABASE_URL;
const SRK = process.env.SUPABASE_SERVICE_ROLE;
const BUCKET = process.env.SUPABASE_BUCKET || "beeswarm-exports";
const SIGN_SECS = parseInt(process.env.SUPABASE_SIGNED_URL_SECS ?? "3600", 10);

let sb: any = null;
async function supabase() {
  if (!URL || !SRK) return null;
  if (sb) return sb;
  const { createClient } = await import("@supabase/supabase-js");
  sb = createClient(URL, SRK, { auth: { persistSession: false } });
  return sb;
}

export async function uploadAndSign(localPath: string, objectKey: string): Promise<string | null> {
  const s = await supabase();
  if (!s) return null;

  const buf = await fs.readFile(localPath);
  const contentType = guessContentType(localPath);

  await s.storage.createBucket(BUCKET).catch(() => undefined);

  const { error: upErr } = await s.storage.from(BUCKET).upload(objectKey, buf, {
    contentType,
    upsert: true,
  });
  if (upErr) throw upErr;

  const { data, error: signErr } = await s.storage.from(BUCKET).createSignedUrl(objectKey, SIGN_SECS);
  if (signErr) throw signErr;
  return data?.signedUrl ?? null;
}

function guessContentType(p: string) {
  const ext = path.extname(p).toLowerCase();
  if (ext === ".mp4") return "video/mp4";
  if (ext === ".mp3") return "audio/mpeg";
  if (ext === ".wav") return "audio/wav";
  if (ext === ".webm") return "video/webm";
  if (ext === ".mov") return "video/quicktime";
  if (ext === ".m4a") return "audio/mp4";
  return "application/octet-stream";
}

