import { getStore } from "@netlify/blobs";

type MutationStatus = "success" | "failure" | string;

export type MutationLogEntry = {
  actor: string;
  ritual: string;
  status: MutationStatus;
  message: string;
  payload?: unknown;
  metadata?: Record<string, unknown>;
  timestamp?: string;
};

const STORE_NAME = "beehive_mutation_ledger";
const HISTORY_KEY = "ledger.json";
const MAX_HISTORY = 200;

async function readHistory() {
  try {
    const store = getStore(STORE_NAME);
    const existing = (await store.get(HISTORY_KEY, { type: "json" })) as MutationLogEntry[] | null;
    return Array.isArray(existing) ? existing : [];
  } catch (error) {
    console.warn("ledger-read-fallback", error);
    return [] as MutationLogEntry[];
  }
}

async function writeHistory(entries: MutationLogEntry[]) {
  try {
    const store = getStore(STORE_NAME);
    await store.set(HISTORY_KEY, JSON.stringify(entries));
  } catch (error) {
    console.warn("ledger-write-failed", error);
  }
}

/**
 * Persists a ritual outcome to the communal ledger while echoing it to stdout
 * for rapid observability. The ledger is pruned to remain lightweight for
 * CodexReplay overlays.
 */
export async function logMutation(entry: MutationLogEntry): Promise<void> {
  const timestamp = entry.timestamp ?? new Date().toISOString();
  const enriched: MutationLogEntry = { ...entry, timestamp };

  console.log("mutation-ledger", JSON.stringify(enriched));

  const history = await readHistory();
  history.push(enriched);

  const pruned = history.slice(-MAX_HISTORY);
  await writeHistory(pruned);
}
