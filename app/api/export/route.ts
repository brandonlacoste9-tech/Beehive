export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";

import { logAuditEvent } from "@/lib/telemetry";
import { runExportJob } from "@/worker/export-worker";

export async function POST(req: Request) {
  try {
    const { composition, tracks } = await req.json();

    if (!composition || !Array.isArray(tracks)) {
      return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
    }

    const jobId = Math.random().toString(36).substring(2, 10);
    const job = { id: jobId, composition, tracks };

    logAuditEvent("export.job.queued", { jobId });

    void runExportJob(job)
      .then(() => logAuditEvent("export.job.finished", { jobId }))
      .catch((error) => logAuditEvent("export.job.failed", { jobId, error: `${error}` }));

    return NextResponse.json({ jobId, status: "queued" });
  } catch {
    return NextResponse.json({ error: "export_failed" }, { status: 500 });
  }
}
