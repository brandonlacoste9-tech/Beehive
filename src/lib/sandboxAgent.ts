const positiveWords = [
  'growth',
  'love',
  'great',
  'win',
  'excited',
  'positive',
  'optimistic',
  'energy',
  'momentum',
];

const negativeWords = [
  'concern',
  'issue',
  'bug',
  'slow',
  'angry',
  'confused',
  'negative',
  'drop',
  'churn',
];

export type SandboxSentiment = {
  windowMin: number;
  count: number;
  avg: number;
  sample: Array<{ platform: string; text: string; score: number }>;
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function scoreFromMessage(message: string) {
  const text = message.toLowerCase();
  let score = 0;
  for (const word of positiveWords) {
    if (text.includes(word)) score += 1;
  }
  for (const word of negativeWords) {
    if (text.includes(word)) score -= 1;
  }
  if (!message.trim()) return 0;
  return clamp(score / 4, -0.9, 0.9);
}

export function toMood(avg: number) {
  if (avg > 0.25) return 'optimistic/positive';
  if (avg < -0.25) return 'frustrated/negative';
  return 'mixed/neutral';
}

export function createSandboxSentiment({
  message,
  windowMin,
}: {
  message: string;
  windowMin: number;
}): SandboxSentiment {
  const avg = scoreFromMessage(message);
  const countBase = 12 + Math.floor(message.length / 12);
  const count = clamp(countBase, 6, 48);
  const sample: SandboxSentiment['sample'] = [
    {
      platform: 'twitter',
      text:
        message.trim() ||
        'Users requesting clarity on roadmap milestones and story pacing.',
      score: clamp(avg + 0.12, -0.95, 0.95),
    },
    {
      platform: 'discord',
      text: 'Ops chat noting sentiment swing around the latest montage drop.',
      score: clamp(avg - 0.08, -0.95, 0.95),
    },
    {
      platform: 'linkedin',
      text: 'Strategic partner highlighting viral potential if guidance is crisp.',
      score: clamp(avg + 0.04, -0.95, 0.95),
    },
  ];

  return { windowMin, count, avg, sample };
}

export function createSandboxReply({
  message,
  summary,
}: {
  message: string;
  summary: SandboxSentiment;
}) {
  const mood = toMood(summary.avg);
  const ask = message.trim() || 'Synthesize current mood + next actions.';
  return [
    `Sandbox agent response (${mood})`,
    `Window: ${summary.windowMin}m • Mentions: ${summary.count} • Mean: ${summary.avg.toFixed(
      2,
    )}`,
    'Recommended Ritual Actions:',
    `1. Anchor the montage on the prevailing mood ("${mood}") and mirror community language.`,
    '2. Surface one success metric and one tension point to keep narrative grounded.',
    '3. Offer a share-ready pull quote to accelerate referral loops.',
    '',
    `Prompt received: ${ask}`,
  ].join('\n');
}

export function buildSandboxAgentPayload({
  message = '',
  windowMin = 180,
}: {
  message?: string;
  windowMin?: number;
}) {
  const summary = createSandboxSentiment({ message, windowMin });
  const reply = createSandboxReply({ message, summary });
  return { summary, reply };
}
