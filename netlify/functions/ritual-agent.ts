import type { Handler } from "@netlify/functions";
import { randomUUID } from "node:crypto";
import OpenAI from "openai";

const MODEL = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

let cachedClient: OpenAI | null = null;

function getClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing OPENAI_API_KEY");
  }

  if (!cachedClient) {
    cachedClient = new OpenAI({ apiKey });
  }

  return cachedClient;
}

function json(body: Record<string, unknown>, statusCode = 200) {
  return {
    statusCode,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  };
}

export const handler: Handler = async (event) => {
  const requestId = randomUUID();

  if (event.httpMethod !== "POST") {
    return json({ ok: false, error: "Method Not Allowed", requestId }, 405);
  }

  let prompt = "";
  if (event.body) {
    try {
      const body = JSON.parse(event.body) as Record<string, unknown>;
      const candidate = body.prompt;
      if (typeof candidate === "string") {
        prompt = candidate.trim();
      }
    } catch {
      // ignore malformed JSON and fall through to validation
    }
  }

  if (!prompt) {
    return json({ ok: false, error: "Missing prompt", requestId }, 400);
  }

  let client: OpenAI;
  try {
    client = getClient();
  } catch (error) {
    const message =
      error instanceof Error ? error.message : `OpenAI client error: ${String(error)}`;
    return json({ ok: false, error: message, requestId }, 500);
  }

  const promptBytes = Buffer.byteLength(prompt, "utf8");

  try {
    const completion = await client.chat.completions.create({
      model: MODEL,
      messages: [{ role: "user", content: prompt }],
    });

    const output = completion.choices?.[0]?.message?.content ?? "";

    return json({
      ok: true,
      requestId,
      output,
      metadata: {
        jobId: completion.id,
        model: completion.model,
        created: completion.created,
        usage: completion.usage,
        sizeBytes: promptBytes,
        status: completion.choices?.[0]?.finish_reason ?? "unknown",
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : `OpenAI request failed: ${String(error)}`;
    return json({ ok: false, error: message, requestId }, 500);
  }
};
