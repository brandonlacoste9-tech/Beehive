// app/lib/users.ts
import fs from "node:fs/promises";
import path from "node:path";

type Customer = { email: string; status: "active" | "canceled"; provider: "stripe" | "coinbase"; sessionId?: string };

const FILE = path.join(process.cwd(), "data", "users.json");

export async function upsertCustomer(c: Customer) {
  await ensureFile();
  const raw = JSON.parse(await fs.readFile(FILE, "utf8")) as Customer[];
  const idx = raw.findIndex((x) => x.email === c.email);
  if (idx >= 0) raw[idx] = { ...raw[idx], ...c };
  else raw.push(c);
  await fs.writeFile(FILE, JSON.stringify(raw, null, 2), "utf8");
}

async function ensureFile() {
  try {
    await fs.mkdir(path.dirname(FILE), { recursive: true });
    await fs.access(FILE);
  } catch {
    await fs.writeFile(FILE, "[]", "utf8");
  }
}
