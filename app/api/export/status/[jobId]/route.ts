import { NextRequest, NextResponse } from "next/server";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { getJob } from "@/src/lib/jobs";

export async function GET(_req: NextRequest, { params }: { params: { jobId: string } }) {
  const job = await getJob(params.jobId);
  if (!job) return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  return NextResponse.json({
    ok: true,
    jobId: job.id,
    status: job.status,
    outputPath: job.outputPath ?? null,
    downloadUrl: job.downloadUrl ?? null,
    error: job.error ?? null,
    sizeBytes: (job.input as Record<string, any> | undefined)?.sizeBytes ?? null,
    updatedAt: job.updatedAt,
  });
}

