import fetch from 'node-fetch';
import { planRemix } from '../scripts/variant_planner';
import { invokeCodex } from '../scripts/gpt5_exec';

const SIGNAL_SOURCE = 'https://<your-site>.netlify.app/api/signals';

type SignalRow = Record<string, unknown>;

interface RemixPlan {
  action: string;
  target: string;
  reason: string;
}

async function fetchSignals(): Promise<SignalRow[]> {
  try {
    const response = await fetch(SIGNAL_SOURCE);

    if (!response.ok) {
      throw new Error(`Signal source responded with ${response.status}`);
    }

    const data = (await response.json()) as { rows?: SignalRow[] };

    return data.rows ?? [];
  } catch (error) {
    console.error('[agent] unable to fetch signals', error);
    return [];
  }
}

async function run(): Promise<void> {
  const signals = await fetchSignals();

  for (const signal of signals) {
    const plan = planRemix(signal) as RemixPlan | null;

    if (!plan || !plan.action || !plan.target) {
      continue;
    }

    const prompt = `Execute a ${plan.action} on ${plan.target} because: ${plan.reason}`;

    try {
      const output = await invokeCodex(prompt);

      console.log(`[mutation] ${plan.action} → ${plan.target}`);
      console.log(`[codex] ${output}`);
    } catch (error) {
      console.error('[agent] codex invocation failed', error);
    }
  }
}

run().catch((error) => {
  console.error('[agent error]', error);
});
