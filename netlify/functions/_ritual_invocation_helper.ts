export type RitualInvocationOptions = {
  /**
   * Optional override for the base URL that hosts the Netlify functions.
   * Defaults to the deployment URL (process.env.URL).
   */
  baseUrl?: string;
  /**
   * Optional override for the capability key header. Falls back to
   * process.env.CODEX_CAPABILITY_KEY.
   */
  capabilityKey?: string;
};

export class RitualInvocationError extends Error {
  public readonly status: number;
  public readonly ritual: string;

  constructor(ritual: string, status: number, detail: string) {
    super(`Ritual '${ritual}' failed with status ${status}: ${detail}`);
    this.name = "RitualInvocationError";
    this.status = status;
    this.ritual = ritual;
  }
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export async function invokeRitual<T = unknown>(
  ritualName: string,
  payload: unknown,
  actor: string,
  options: RitualInvocationOptions = {},
): Promise<T> {
  const baseUrl = options.baseUrl ?? requireEnv("URL");
  const capabilityKey = options.capabilityKey ?? requireEnv("CODEX_CAPABILITY_KEY");

  const endpoint = `${baseUrl.replace(/\/$/, "")}/.netlify/functions/${ritualName}`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-codex-capability": capabilityKey,
      "x-codex-actor": actor,
    },
    body: JSON.stringify(payload ?? {}),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => response.statusText);
    throw new RitualInvocationError(ritualName, response.status, detail);
  }

  const text = await response.text();
  try {
    return JSON.parse(text) as T;
  } catch {
    return text as unknown as T;
  }
}
