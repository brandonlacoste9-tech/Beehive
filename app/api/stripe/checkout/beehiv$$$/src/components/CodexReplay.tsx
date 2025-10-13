"use client";
import React, { useEffect, useState } from "react";

type Status = "queued" | "running" | "completed" | "failed" | null;

export default function CodexReplay({ jobId }: { jobId: string }) {
  const [status, setStatus] = useState<Status>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [sizeBytes, setSizeBytes] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    const tick = async () => {
      try {
        const r = await fetch(`/api/export/status/${jobId}`, { cache: "no-store" });
        const j = await r.json();
        if (!alive) return;
        if (!j.ok && j.error) {
          setError(j.error);
          return;
        }
        setStatus(j.status ?? null);
        setDownloadUrl(j.downloadUrl ?? null);
        setSizeBytes(typeof j.sizeBytes === "number" ? j.sizeBytes : null);
      } catch (e: any) {
        if (!alive) return;
        setError(e?.message || "fetch_error");
      }
    };
    const id = window.setInterval(tick, 800);
    void tick();
    return () => {
      alive = false;
      window.clearInterval(id);
    };
  }, [jobId]);

  const badge = (s: Status) => {
    const color =
      s === "completed" ? "#16a34a" :
      s === "running" ? "#f59e0b" :
      s === "queued" ? "#64748b" :
      s === "failed" ? "#dc2626" :
      "#94a3b8";
    return (
      <span
        style={{
          background: color,
          color: "white",
          borderRadius: 6,
          padding: "2px 8px",
          fontSize: 12,
        }}
      >
        {s ?? "unknown"}
      </span>
    );
  };

  return (
    <div style={{ padding: 12, border: "1px solid #e5e7eb", borderRadius: 12, maxWidth: 640 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <strong>Export Job</strong>
        {badge(status)}
      </div>
      <div
        style={{
          fontFamily:
            "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
          fontSize: 13,
          wordBreak: "break-all",
        }}
      >
        <div>
          <span style={{ color: "#64748b" }}>jobId:</span> {jobId}
        </div>
        <div>
          <span style={{ color: "#64748b" }}>sizeBytes:</span> {sizeBytes ?? "—"}
        </div>
        <div>
          <span style={{ color: "#64748b" }}>downloadUrl:</span>{" "}
          {downloadUrl ? (
            <a href={downloadUrl} target="_blank" rel="noreferrer">
              open
            </a>
          ) : (
            "—"
          )}
        </div>
        {error ? <div style={{ color: "#dc2626" }}>error: {error}</div> : null}
      </div>
    </div>
  );
}
