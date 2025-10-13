import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";
import { verifySignatureAppRouter } from "@upstash/qstash/nextjs";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { getJob, updateJob, isTerminal, putJob } from "@/src/lib/jobs";
import { uploadAndSign } from "@/src/lib/storage";

const handler = async (req: NextRequest) => {
  try {
    const body = await req.json();
    const jobId = String(body?.jobId ?? "");
    if (!jobId) {
      return NextResponse.json({ ok: false, error: "missing_jobId" }, { status: 400 });
    }

    const existing = await getJob(jobId);
    if (existing && isTerminal(existing.status)) {
      return NextResponse.json({ ok: true, jobId, dedup: true }, { status: 200 });
    }

    const payloadInput = (body?.payload ?? {}) as Record<string, any>;
    const baseInput = existing?.input ?? payloadInput;

    if (!existing) {
      await putJob({
        id: jobId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        status: "queued",
        input: payloadInput,
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

    const stats = await fs.stat(outputPath).catch(() => null);
    const sizeBytes = stats?.size;

    await updateJob(jobId, {
      status: "completed",
      outputPath,
      downloadUrl,
      input: {
        ...baseInput,
        ...(sizeBytes ? { sizeBytes } : {}),
      },
    });

    try {
      await fs.unlink(outputPath);
    } catch {}

    try {
      const { logAuditEvent } = await import("@/src/lib/telemetry");
      logAuditEvent?.("export.job.completed", {
        jobId,
        downloadUrl: Boolean(downloadUrl),
        sizeBytes,
      });
    } catch {}

    return NextResponse.json({ ok: true, jobId, outputPath, downloadUrl, sizeBytes }, { status: 200 });
  } catch {
    return NextResponse.json({ ok: false, error: "webhook_error" }, { status: 500 });
  }
};

export const POST =
  process.env.QSTASH_CURRENT_SIGNING_KEY && process.env.QSTASH_NEXT_SIGNING_KEY
    ? verifySignatureAppRouter(handler as unknown as (req: Request) => Promise<Response>, {
        currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY!,
        nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY,
      })
    : (handler as unknown as (req: Request) => Promise<Response>);
