import type { Handler } from "@netlify/functions";
import { Buffer } from "node:buffer";
import { logMutation } from "./_logger";

const CAP = process.env.CODEX_CAPABILITY_KEY;
const WEBHOOK = process.env.DISCORD_WEBHOOK_URL;

function decodeBody(body: string | null, isBase64: boolean | undefined) {
  if (!body) return "{}";
  return isBase64 ? Buffer.from(body, "base64").toString("utf8") : body;
}

export const handler: Handler = async (event) => {
  const actor = event.headers?.["x-codex-actor"] ?? event.headers?.["X-Codex-Actor"] ?? "Unknown Steward";

  if (!CAP || !WEBHOOK) {
    await logMutation({
      actor,
      ritual: "broadcast-discord",
      status: "failure",
      message: "Missing Discord webhook env",
      payload: {},
      response: {},
    });
    return { statusCode: 500, body: "Server misconfigured" };
  }

  if ((event.headers?.["x-codex-capability"] ?? event.headers?.["X-Codex-Capability"]) !== CAP) {
    await logMutation({
      actor,
      ritual: "broadcast-discord",
      status: "failure",
      message: "Unauthorized capability",
      payload: {},
      response: {},
    });
    return { statusCode: 401, body: "Unauthorized" };
  }

  const rawBody = decodeBody(event.body ?? null, event.isBase64Encoded);
  let payload: { message?: string };
  try {
    payload = JSON.parse(rawBody || "{}");
  } catch {
    return { statusCode: 400, body: "Invalid JSON" };
  }

  const message = payload.message ?? "Codex broadcast";

  const response = await fetch(WEBHOOK, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content: message }),
  });

  const text = await response.text();
  const ok = response.status >= 200 && response.status < 300;

  await logMutation({
    actor,
    ritual: "broadcast-discord",
    status: ok ? "success" : "failure",
    message: ok ? "Discord broadcast sent" : `Discord failed (${response.status})`,
    payload: { message },
    response: { raw: text },
  });

  return { statusCode: response.status, body: text };
};
