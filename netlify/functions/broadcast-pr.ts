import type { Handler } from "@netlify/functions";
import { Buffer } from "node:buffer";
import { logMutation } from "./_logger";

const CAP = process.env.CODEX_CAPABILITY_KEY;
const GH_TOKEN = process.env.GITHUB_PAT;
const GH_REPO = process.env.GITHUB_REPO;

function decodeBody(eventBody: string | null, isBase64: boolean | undefined) {
  if (!eventBody) return "{}";
  return isBase64 ? Buffer.from(eventBody, "base64").toString("utf8") : eventBody;
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

  if (!CAP || !GH_TOKEN || !GH_REPO) {
    await logMutation({
      actor,
      ritual: "broadcast-pr",
      status: "failure",
      message: "Missing GitHub or capability env", 
      payload: {},
      response: {},
    });
    return { statusCode: 500, body: "Server misconfigured" };
  }

  if ((event.headers?.["x-codex-capability"] ?? event.headers?.["X-Codex-Capability"]) !== CAP) {
    await logMutation({
      actor,
      ritual: "broadcast-pr",
      status: "failure",
      message: "Unauthorized capability", 
      payload: {},
      response: {},
    });
    return { statusCode: 401, body: "Unauthorized" };
  }

  const rawBody = decodeBody(event.body ?? null, event.isBase64Encoded);
  let payload: { title?: string; body?: string; base?: string; head?: string };
  try {
    payload = JSON.parse(rawBody || "{}");
  } catch {
    return { statusCode: 400, body: "Invalid JSON" };
  }

  const { title, body, base = "main", head } = payload;
  if (!head) {
    return { statusCode: 400, body: "Missing 'head' branch" };
  }

  const response = await fetch(`https://api.github.com/repos/${GH_REPO}/pulls`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${GH_TOKEN}`,
      "Content-Type": "application/json",
      Accept: "application/vnd.github+json",
    },
    body: JSON.stringify({ title, body, base, head }),
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
    ritual: "broadcast-pr",
    target,
    status: ok ? "success" : "failure",
    message: ok ? "PR created" : `PR failed (${response.status})`,
    payload: { title, body, base, head },
    response: safeJson(text),
  });

  return { statusCode: response.status, body: text };
};
