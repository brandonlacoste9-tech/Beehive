import crypto from "node:crypto";

export type JobStatus = "queued" | "running" | "completed" | "failed";
export interface ExportJob {
  id: string;
  createdAt: number;
  updatedAt: number;
  status: JobStatus;
  input: Record<string, any>;
  outputPath?: string;
  downloadUrl?: string | null;
  error?: string;
}

const mem = new Map<string, ExportJob>();
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE;

let sb: any = null;
async function supabase() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE) return null;
  if (sb) return sb;
  const { createClient } = await import("@supabase/supabase-js");
  sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE, { auth: { persistSession: false }});
  return sb;
}

export function newJobId() {
  return crypto.randomUUID();
}

export async function putJob(j: ExportJob) {
  mem.set(j.id, j);
  const s = await supabase();
  if (s) {
    await s.from("export_jobs").upsert({
      id: j.id,
      status: j.status,
      input: j.input,
      output_path: j.outputPath ?? null,
      download_url: j.downloadUrl ?? null,
      error: j.error ?? null,
      created_at: new Date(j.createdAt).toISOString(),
      updated_at: new Date(j.updatedAt).toISOString(),
    });
  }
}

export async function updateJob(id: string, patch: Partial<ExportJob>) {
  const cur = mem.get(id);
  if (!cur) return;
  const nxt: ExportJob = { ...cur, ...patch, updatedAt: Date.now() };
  mem.set(id, nxt);
  const s = await supabase();
  if (s) {
    await s.from("export_jobs").upsert({
      id: nxt.id,
      status: nxt.status,
      input: nxt.input,
      output_path: nxt.outputPath ?? null,
      download_url: nxt.downloadUrl ?? null,
      error: nxt.error ?? null,
      created_at: new Date(nxt.createdAt).toISOString(),
      updated_at: new Date(nxt.updatedAt).toISOString(),
    });
  }
}

export async function getJob(id: string) {
  const local = mem.get(id);
  if (local) return local;
  const s = await supabase();
  if (!s) return undefined;
  const { data } = await s.from("export_jobs").select("*").eq("id", id).maybeSingle();
  if (!data) return undefined;
  const job: ExportJob = {
    id: data.id,
    createdAt: Date.parse(data.created_at),
    updatedAt: Date.parse(data.updated_at),
    status: data.status,
    input: data.input ?? {},
    outputPath: data.output_path ?? undefined,
    downloadUrl: data.download_url ?? null,
    error: data.error ?? undefined,
  };
  mem.set(job.id, job);
  return job;
}

export function isTerminal(status: JobStatus) {
  return status === "completed" || status === "failed";
}
