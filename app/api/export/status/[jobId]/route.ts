export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";

import { getJobStatus } from "@/worker/export-worker";

export async function GET(_: Request, { params }: { params: { jobId: string } }) {
  const job = getJobStatus(params.jobId);

  if (!job) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  return NextResponse.json(job);
}
