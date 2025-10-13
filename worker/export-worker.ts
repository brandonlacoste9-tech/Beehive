import { spawn, spawnSync } from "child_process";
import fs from "fs";
import os from "os";
import path from "path";

export interface ExportJob {
  id: string;
  composition: string;
  tracks: string[];
}

export interface JobStatus {
  jobId: string;
  status: "queued" | "running" | "complete" | "failed";
  progress?: number;
  outputPath?: string;
  error?: string;
}

const JOBS = new Map<string, JobStatus>();

// Ensure ffmpeg exists in local/dev env
try {
  const ff = spawnSync("ffmpeg", ["-version"], { encoding: "utf8" });
  if (ff.status !== 0) {
    throw new Error();
  }
} catch {
  throw new Error("[export-worker] ffmpeg not found. Install ffmpeg or use a runner that includes it.");
}

export async function runExportJob(job: ExportJob): Promise<JobStatus> {
  JOBS.set(job.id, { jobId: job.id, status: "queued", progress: 0 });

  const jobPath = path.join(os.tmpdir(), "beeswarm-exports");
  fs.mkdirSync(jobPath, { recursive: true });
  const outputPath = path.join(jobPath, `${job.id}.mp4`);

  const cmd = "ffmpeg";
  const args = [
    "-f",
    "lavfi",
    "-i",
    "color=c=black:s=1280x720:d=5",
    "-vf",
    "drawtext=text='BeeSwarm Render':fontcolor=white:fontsize=48:x=(w-text_w)/2:y=(h-text_h)/2",
    outputPath,
  ];

  JOBS.set(job.id, { jobId: job.id, status: "running", progress: 5 });

  return new Promise((resolve) => {
    const ff = spawn(cmd, args);

    ff.stderr.on("data", () => {
      const prev = JOBS.get(job.id);
      if (!prev) return;
      const next = Math.min(95, (prev.progress ?? 0) + 5);
      JOBS.set(job.id, { ...prev, progress: next });
    });

    ff.on("close", (code) => {
      const prev = JOBS.get(job.id);
      const status =
        code === 0
          ? { jobId: job.id, status: "complete", outputPath, progress: 100 }
          : {
              jobId: job.id,
              status: "failed",
              error: "ffmpeg_failed",
              progress: prev?.progress ?? 0,
            };
      JOBS.set(job.id, status);
      resolve(status);
    });
  });
}

export function getJobStatus(jobId: string): JobStatus | undefined {
  return JOBS.get(jobId);
}
