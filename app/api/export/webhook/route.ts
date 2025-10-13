import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { getJob, updateJob, isTerminal, putJob } from "@/src/lib/jobs";
import { uploadAndSign } from "@/src/lib/storage";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const jobId = String(body?.jobId ?? "");
    if (!jobId) return NextResponse.json({ ok: false, error: "missing_jobId" }, { status: 400 });

    const existing = await getJob(jobId);
    if (existing && isTerminal(existing.status)) {
      return NextResponse.json({ ok: true, jobId, dedup: true }, { status: 200 });
    }

    if (!existing) {
      await putJob({
        id: jobId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        status: "queued",
        input: body?.payload ?? {},
      });
    }

    await updateJob(jobId, { status: "running" });

    const { default: runExport } = await import("@/worker/export-worker");
    const outputPath = await runExport(jobId, body?.payload ?? {});
    let downloadUrl: string | null = null;

    try {
      const fileName = path.basename(outputPath || "export.bin");
      const key = `${jobId}/${fileName}`;
      downloadUrl = await uploadAndSign(outputPath, key);
    } catch {
      downloadUrl = null;
    }

    await updateJob(jobId, { status: "completed", outputPath, downloadUrl });

    try {
      await fs.unlink(outputPath);
    } catch {}

    try {
      const { logAuditEvent } = await import("@/src/lib/telemetry");
      logAuditEvent?.("export.job.completed", { jobId, downloadUrl: Boolean(downloadUrl) });
    } catch {}

    return NextResponse.json({ ok: true, jobId, outputPath, downloadUrl }, { status: 200 });
  } catch {
    return NextResponse.json({ ok: false, error: "webhook_error" }, { status: 500 });
  }
}
