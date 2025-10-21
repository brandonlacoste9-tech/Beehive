export type AgentTrigger = {
  http?: string[];
  cron?: string;
};

export type AgentEntitlements = {
  limits?: {
    rpm?: number;
  };
};

export type CodexAgent = {
  id: string;
  domain: string;
  personality: string;
  skills: string;
  triggers: AgentTrigger;
  entitlements?: AgentEntitlements;
};

type HttpError = Error & { status?: number };

const AGENTS: CodexAgent[] = [
  {
    id: 'nexus',
    domain: 'admin/scheduling',
    personality: 'calm, organized EA',
    skills: 'calendar sync, email triage, notes',
    triggers: { http: ['/api/codex/agents/nexus/run'] },
    entitlements: { limits: { rpm: 60 } },
  },
  {
    id: 'ledger',
    domain: 'finance/accounting',
    personality: 'precise, formal CPA',
    skills: 'invoice gen, parts costing, spend audit',
    triggers: { http: ['/api/codex/agents/ledger/run'] },
    entitlements: { limits: { rpm: 45 } },
  },
  {
    id: 'harvest',
    domain: 'ops (restaurant)',
    personality: 'direct, fast manager',
    skills: 'shift board, prep lists, inventory',
    triggers: { http: ['/api/codex/agents/harvest/run'] },
  },
  {
    id: 'forge',
    domain: 'auto/mechanics',
    personality: 'diagnostic, pragmatic',
    skills: 'symptom intake, repair estimate, parts',
    triggers: { http: ['/api/codex/agents/forge/run'] },
  },
  {
    id: 'spark',
    domain: 'electrical systems',
    personality: 'schematic-minded, safe',
    skills: 'breaker trace, load calc, BOM',
    triggers: { http: ['/api/codex/agents/spark/run'] },
  },
  {
    id: 'hydro',
    domain: 'plumbing',
    personality: 'methodical, code-aware',
    skills: 'leak triage, pipe layout, materials',
    triggers: { http: ['/api/codex/agents/hydro/run'] },
  },
  {
    id: 'triage',
    domain: 'med intake',
    personality: 'calm, empathetic',
    skills: 'intake forms, vitals, route of care',
    triggers: { http: ['/api/codex/agents/triage/run'] },
  },
  {
    id: 'medic',
    domain: 'medical knowledge',
    personality: 'professional, cautious',
    skills: 'guideline lookup, patient info sheet',
    triggers: { http: ['/api/codex/agents/medic/run'] },
  },
  {
    id: 'design',
    domain: 'UX/brand (leafcutter)',
    personality: 'precise, aesthetic',
    skills: 'logo briefs, palette, typography recs',
    triggers: { http: ['/api/codex/agents/design/run'] },
  },
  {
    id: 'firewall',
    domain: 'security',
    personality: 'strict, no-nonsense',
    skills: 'spam/abuse filter, IP risk, 2FA nudges',
    triggers: { http: ['/api/codex/agents/firewall/run'] },
  },
  {
    id: 'buzz',
    domain: 'social ads',
    personality: 'upbeat, punchy',
    skills: 'headlines, captions, hashtag sets',
    triggers: { http: ['/api/codex/agents/buzz/run'] },
  },
  {
    id: 'research',
    domain: 'academic (mining)',
    personality: 'thorough, cited',
    skills: 'source gather, summary, bibtex',
    triggers: { http: ['/api/codex/agents/research/run'] },
  },
];

const LEDGER = new Map(AGENTS.map((agent) => [agent.id, agent]));

export function listCodexAgents() {
  return AGENTS;
}

export function getCodexAgent(id: string) {
  return LEDGER.get(id);
}

export function requireCodexAgent(id: string) {
  const agent = getCodexAgent(id);
  if (!agent) {
    throw httpError(404, `unknown agent: ${id}`);
  }
  return agent;
}

export async function requireJSON(req: Request) {
  try {
    return await req.json();
  } catch (err) {
    throw httpError(400, 'invalid JSON body');
  }
}

export function correlationHeaders(runId: string) {
  return { 'x-codex-run': runId };
}

export function rateLimit(_key: string, _rpm = 60) {
  return;
}

function httpError(status: number, message: string) {
  const error = new Error(message) as HttpError;
  error.status = status;
  return error;
}
