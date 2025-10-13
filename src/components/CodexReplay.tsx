"use client";

import { useEffect, useRef, useState } from "react";

import { motion } from "framer-motion";

import { liftProps } from "@/lib/motion";

type JobStatus = {
  jobId: string;
  status: "queued" | "running" | "complete" | "failed";
  progress?: number;
  outputPath?: string;
  error?: string;
};

export default function CodexReplay() {
  const [job, setJob] = useState<JobStatus | null>(null);
  const [busy, setBusy] = useState(false);
  const pollRef = useRef<number | null>(null);

  async function startExport() {
    setBusy(true);
    try {
      const res = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          composition: { width: 1280, height: 720, fps: 30, durationInFrames: 150 },
          tracks: [],
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "export_failed");
      }
      setJob({ jobId: data.jobId, status: data.status });
    } catch (error) {
      console.error(error);
    } finally {
      setBusy(false);
    }
  }

  async function pollStatus(id: string) {
    try {
      const res = await fetch(`/api/export/status/${id}`, { cache: "no-store" });
      const data = await res.json();
      if (res.ok) {
        setJob(data);
        if (data.status === "complete" || data.status === "failed") {
          if (pollRef.current) {
            window.clearInterval(pollRef.current);
            pollRef.current = null;
          }
        }
      }
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    if (!job?.jobId) return;

    if (pollRef.current) {
      window.clearInterval(pollRef.current);
    }

    void pollStatus(job.jobId);
    pollRef.current = window.setInterval(() => pollStatus(job.jobId), 1500);

    return () => {
      if (pollRef.current) {
        window.clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [job?.jobId]);

  return (
    <div className="p-8 bg-hive-bg text-white space-y-4">
      <h1 className="text-2xl font-bold">Codex Replay — Render History</h1>

      <motion.button
        {...liftProps}
        type="button"
        onClick={startExport}
        disabled={busy}
        className="bg-aurora-gold text-black font-semibold px-4 py-2 rounded disabled:opacity-60"
      >
        {busy ? "Queuing…" : "Start Export"}
      </motion.button>

      {job ? (
        <motion.div {...liftProps} className="bg-hive-panel p-4 rounded-lg space-y-2">
          <p className="font-bold text-aurora-gold">Job {job.jobId}</p>
          <p>Status: {job.status}</p>
          {typeof job.progress === "number" ? (
            <div className="h-2 w-full bg-black/40 rounded overflow-hidden">
              <div
                className="h-full bg-aurora-plasma transition-all duration-500"
                style={{ width: `${Math.min(100, job.progress)}%` }}
              />
            </div>
          ) : null}
          {job.outputPath ? (
            <div className="space-y-1">
              <a
                href={`file://${job.outputPath}`}
                className="text-aurora-plasma underline"
                download
              >
                Open local file
              </a>
              <p className="text-xs text-aurora-violet">
                Local paths are not downloadable in hosted environments.
              </p>
            </div>
          ) : null}
          {job.error ? <p className="text-aurora-violet">Error: {job.error}</p> : null}
        </motion.div>
      ) : (
        <p className="text-aurora-violet">
          No renders yet. Click <span className="font-semibold">Start Export</span> to queue one.
        </p>
      )}
    </div>
  );
}
