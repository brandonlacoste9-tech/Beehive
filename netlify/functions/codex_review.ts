// Preload Codex Grand Launch scrolls so BeeHive telemetry is available inside Netlify.
import { OpenAI } from "openai";

import { registerCodexScrolls } from '../../src/context/ace-pack';

const registry = registerCodexScrolls();
const overlaySnapshot = registry.orchestrator.overlays();

if (typeof globalThis !== 'undefined') {
  (globalThis as Record<string, unknown>).__codexGrandLaunchOverlays = overlaySnapshot;
  (globalThis as Record<string, unknown>).__codexGrandLaunchOverlayUpdatedAt = new Date().toISOString();
}


function overlayHeaders(): Record<string, string> {
  if (typeof globalThis === 'undefined') {
    return {};
  }
  const globalRef = globalThis as Record<string, unknown>;
  const overlays = globalRef.__codexGrandLaunchOverlays;
  if (!Array.isArray(overlays) || overlays.length === 0) {
    return {};
  }
  const latest = overlays[overlays.length - 1];
  try {
    const headerValue = JSON.stringify(latest);
    const headers: Record<string, string> = {
      'x-codex-overlay': headerValue,
    };
    const updatedAt = globalRef.__codexGrandLaunchOverlayUpdatedAt;
    if (typeof updatedAt === 'string') {
      headers['x-codex-overlay-updated-at'] = updatedAt;
    }
    return headers;
  } catch {
    return {};
  }
}

export const config = {
  // Optional: set a friendly route if desired, e.g.:
  // path: "/codex/review",
};

type Payload = {
  repo: string;
  pr: number | string;
  base: string;
  head: string;
  title?: string;
  body?: string;
  diff: string;
  maxOutputTokens?: number;
};

function ok(text: string, headers: Record<string, string> = {}) {
  const overlay = overlayHeaders();
  return new Response(text, {
    status: 200,
    headers: { 'content-type': 'text/plain; charset=utf-8', ...overlay, ...headers },
  });
}

function bad(status: number, text: string) {
  return new Response(text, {
    status,
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}

export default async (req: Request) => {
  if (req.method !== "POST") {
    return bad(405, "Use POST with JSON payload.");
  }

  let payload: Payload;
  try {
    payload = (await req.json()) as Payload;
  } catch {
    return bad(400, "Invalid JSON body.");
  }

  const { repo, pr, base, head, title = "", body = "", diff } = payload || {};
  const maxOutputTokens = Math.max(
    200,
    Math.min(4000, Number(payload?.maxOutputTokens ?? 600))
  );

  if (!repo || !pr || !base || !head || !diff) {
    return bad(
      400,
      "Missing required fields: repo, pr, base, head, diff (title/body optional)."
    );
  }

  const prompt = [
    "You are a precise PR reviewer. Review ONLY the diff below.",
    `Repository: ${repo} | PR: #${pr}`,
    `Base: ${base} | Head: ${head}`,
    title ? `Title: ${title}` : "",
    body ? `Body:\n${body}` : "",
    "Diff (may be truncated):",
    "```diff",
    diff,
    "```",
    "Return succinct, actionable findings with code quotes where relevant.",
  ]
    .filter(Boolean)
    .join("\n\n");

  try {
    const cacheKey = new Request(
      `https://codex.local/review?repo=${encodeURIComponent(
        repo
      )}&pr=${pr}&base=${base}&head=${head}`,
      { method: "POST" }
    );

    const cache =
      "caches" in globalThis ? await caches.open("codex-reviews") : null;
    if (cache) {
      const hit = await cache.match(cacheKey);
      if (hit) {
        const text = await hit.text();
        return ok(text, { "x-codex-cache": "hit" });
      }
    }

    const openai = new OpenAI();
    const resp = await openai.responses.create({
      model: "gpt-5-pro",
      input: prompt,
      max_output_tokens: maxOutputTokens,
    });

    const text =
      (resp as any)?.output?.[0]?.content?.[0]?.text ??
      (resp as any)?.output_text ??
      JSON.stringify(resp, null, 2);

    const response = ok(text, { "x-codex-cache": "miss" });

    if (cache) await cache.put(cacheKey, response.clone());

    return response;
  } catch (err: any) {
    const msg = [
      "⚠️ Codex review via Netlify AI Gateway failed.",
      `Reason: ${(err && err.message) || err}`,
      "",
      "Troubleshooting:",
      "- Confirm Netlify AI Gateway is enabled for this site.",
      "- Check plan credits/limits and recent usage.",
      "- Re-run the workflow (results are cached when successful).",
    ].join("\n");
    return bad(502, msg);
  }
};

