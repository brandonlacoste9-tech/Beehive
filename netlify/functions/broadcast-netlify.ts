import type { Handler } from "@netlify/functions";
import { logMutation } from "./_logger";

const CAP = process.env.CODEX_CAPABILITY_KEY;
const BUILD_HOOK = process.env.NETLIFY_BUILD_HOOK_URL;

export const handler: Handler = async (event) => {
  const actor = event.headers?.["x-codex-actor"] ?? event.headers?.["X-Codex-Actor"] ?? "Unknown Steward";

  if (!CAP || !BUILD_HOOK) {
    await logMutation({
      actor,
      ritual: "broadcast-netlify",
      status: "failure",
      message: "Missing Netlify hook env",
      payload: {},
      response: {},
    });
    return { statusCode: 500, body: "Server misconfigured" };
  }

  if ((event.headers?.["x-codex-capability"] ?? event.headers?.["X-Codex-Capability"]) !== CAP) {
    await logMutation({
      actor,
      ritual: "broadcast-netlify",
      status: "failure",
      message: "Unauthorized capability",
      payload: {},
      response: {},
    });
    return { statusCode: 401, body: "Unauthorized" };
  }

  const response = await fetch(BUILD_HOOK, { method: "POST" });
  const text = await response.text();
  const ok = response.status >= 200 && response.status < 300;

  await logMutation({
    actor,
    ritual: "broadcast-netlify",
    status: ok ? "success" : "failure",
    message: ok ? "Netlify build triggered" : `Netlify hook failed (${response.status})`,
    payload: {},
    response: { raw: text },
  });

  return { statusCode: response.status, body: text };
};
