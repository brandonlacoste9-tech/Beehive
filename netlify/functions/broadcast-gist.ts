import type { Handler } from "@netlify/functions";
import { Buffer } from "node:buffer";
import { logMutation } from "./_logger";

const CAP = process.env.CODEX_CAPABILITY_KEY;
const GH_TOKEN = process.env.GITHUB_PAT;

function decodeBody(body: string | null, isBase64: boolean | undefined) {
  if (!body) return "{}";
  return isBase64 ? Buffer.from(body, "base64").toString("utf8") : body;
}

function safeJson(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

export const handler: Handler = async (event) => {
  const actor = event.headers?.["x-codex-actor"] ?? event.headers?.["X-Codex-Actor"] ?? "Unknown Steward";

  if (!CAP || !GH_TOKEN) {
    await logMutation({
      actor,
      ritual: "broadcast-gist",
      status: "failure",
      message: "Missing GitHub capability env",
      payload: {},
      response: {},
    });
    return { statusCode: 500, body: "Server misconfigured" };
  }

  if ((event.headers?.["x-codex-capability"] ?? event.headers?.["X-Codex-Capability"]) !== CAP) {
    await logMutation({
      actor,
      ritual: "broadcast-gist",
      status: "failure",
      message: "Unauthorized capability",
      payload: {},
      response: {},
    });
    return { statusCode: 401, body: "Unauthorized" };
  }

  const rawBody = decodeBody(event.body ?? null, event.isBase64Encoded);
  let payload: { filename?: string; content?: string; description?: string; public?: boolean };
  try {
    payload = JSON.parse(rawBody || "{}");
  } catch {
    return { statusCode: 400, body: "Invalid JSON" };
  }

  const { filename, content, description = "Codex scroll", public: isPublic = false } = payload;

  if (!filename || !content) {
    return { statusCode: 400, body: "Missing filename or content" };
  }

  const response = await fetch("https://api.github.com/gists", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${GH_TOKEN}`,
      "Content-Type": "application/json",
      Accept: "application/vnd.github+json",
    },
    body: JSON.stringify({
      description,
      public: isPublic,
      files: { [filename]: { content } },
    }),
  });

  const text = await response.text();
  const ok = response.status >= 200 && response.status < 300;
  let target = "";
  try {
    const json = JSON.parse(text);
    if (json && typeof json === "object") {
      target = json.html_url ?? "";
    }
  } catch {
    target = "";
  }

  await logMutation({
    actor,
    ritual: "broadcast-gist",
    target,
    status: ok ? "success" : "failure",
    message: ok ? "Gist published" : `Gist failed (${response.status})`,
    payload: { filename, description, public: isPublic },
    response: safeJson(text),
  });

  return { statusCode: response.status, body: text };
};
