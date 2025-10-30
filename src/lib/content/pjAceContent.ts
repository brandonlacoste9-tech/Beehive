import { CaseStudyProps } from '@/components/marketing/CaseStudyPage';
import { CreatorProfileProps } from '@/components/marketing/CreatorProfile';

type FeatureCard = {
  title: string;
  description: string;
  stat?: string;
};

type TemplateItem = {
  name: string;
  description: string;
  icon: string;
};

type ApiEndpoint = {
  method: string;
  path: string;
  description: string;
  sample?: string;
};

export const pjAceProfile: CreatorProfileProps = {
  name: 'PJ Ace',
  handle: 'pjaccetturo',
  heroImageUrl: 'https://images.unsplash.com/photo-1522199996308-ccdcb5b06222?auto=format&fit=crop&w=800&q=80',
  bio: 'PJ Ace (PJ Accetturo) is a viral AI filmmaker who reimagines cinematic storytelling with generative AI. From meme-driven ad campaigns to full 25-minute AI TV episodes, PJ combines cinematic craft with aggressive prompt engineering to generate viral, platform-native content in days.',
  highlights: [
    { label: 'Viral reach', value: '120M views in 48 hours' },
    { label: 'Production speed', value: 'Campaigns in < 3 days' },
    { label: 'Cost delta', value: '$500 vs $500K legacy' },
  ],
  projects: [
    {
      id: 'im8-ad',
      title: 'IM8 Digital Twin Ad',
      date: '2024',
      thumbnail: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=640&q=80',
      views: '120M views • 2 days',
      tags: ['Veo 3', 'ElevenLabs', 'Omni Reference'],
    },
    {
      id: 'grandma-video',
      title: 'Grandma Forgot Her Clothes',
      date: '2023',
      thumbnail: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=640&q=80',
      views: '48M views • 72 hours',
      tags: ['Comedy', 'Prompt Lab'],
    },
    {
      id: 'ai-tv',
      title: 'AI TV Episode',
      date: '2024',
      thumbnail: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=640&q=80',
      views: 'Series pilot in 6 days',
      tags: ['Long-form', 'Codex QA'],
    },
    {
      id: 'popeyes',
      title: 'Popeyes Meme Sprint',
      date: '2023',
      thumbnail: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=640&q=80',
      views: '17M views • 48 hours',
      tags: ['Brand Beef', 'Rapid Iteration'],
    },
  ],
  ctaPrimary: {
    text: 'Launch PJ Ace Template',
    href: '/templates/import?source=pj-ace-viral-ad',
  },
};

export const caseStudies: Record<string, CaseStudyProps> = {
  'im8-ad': {
    id: 'im8-ad',
    title: 'IM8 Digital Twin Ad',
    releaseDate: 'February 2024',
    metrics: { views: 120_000_000, shares: 890_000, costEstimate: '$12K estimated' },
    heroMedia: 'Veo 3 sequence: Beckham digital twin walking through neon IM8 store set',
    tools: ['Veo 3', 'Midjourney Omni Reference', 'ElevenLabs', 'Codex QA', 'Final Cut Pro'],
    pipeline: [
      {
        step: 'Ideate',
        agent: 'Agent Swarm Studio — Meme Strategist',
        snippet: 'Objective: Remind fans IM8 can body-double Beckham. Hook: \'David Beckham clones himself for sneaker drop\'.',
      },
      {
        step: 'Generate',
        agent: 'Veo 3 Shot Director',
        snippet: 'camera: dolly forward, lighting: neon blue + amber rim; prompt: Beckham digital twin emerges from portal.',
      },
      {
        step: 'Voice',
        agent: 'ElevenLabs Voice Forge',
        snippet: '{ "voice": "beckham-clone", "consentId": "signed-2024-02-01", "style": "confident" }',
      },
      {
        step: 'QA',
        agent: 'Codex Review Bot',
        snippet: 'Check pacing < 30s, ensure likeness consent attached, prep Netlify preview + Lighthouse run.',
      },
    ],
    shots: [
      {
        scene: 'Portal reveal',
        prompt: 'Ultra wide establishing shot of neon IM8 flagship, Beckham digital twin stepping through portal, cinematic neon bloom.',
        refImages: ['omniRef:beckham-front', 'omniRef:beckham-profile'],
      },
      {
        scene: 'Times Square broadcast',
        prompt: 'Times Square billboards synchronizing to IM8 logo as digital twin sprints across rooftops.',
      },
      {
        scene: 'Locker room close-up',
        prompt: 'Close-up of IM8 sneaker rotating in zero gravity, Beckham twin narrates benefits.',
      },
    ],
    timeline: { days: 2, phases: ['Prompt lab & approvals', 'Veo 3 generation + Omni referencing', 'Edit, QA, distribution sprint'] },
    ethicalNotes: 'Celebrity likeness cleared via IM8 talent agreement; ElevenLabs consent recorded and watermarking enabled. Final export labelled as AI-generated and archived with provenance JSON.',
  },
  'grandma-video': {
    id: 'grandma-video',
    title: 'Grandma Forgot Her Clothes',
    releaseDate: 'August 2023',
    metrics: { views: 48_000_000, shares: 310_000, costEstimate: '$3K estimated' },
    heroMedia: 'Viral TikTok-ready cut featuring grandma protagonist and alpaca cameo',
    tools: ['Veo 3', 'ChatGPT Prompt Lab', 'After Effects', 'Codex QA'],
    pipeline: [
      {
        step: 'Spark',
        agent: 'Ideation Agent',
        snippet: 'Premise: Grandma forgets clothes, alpaca saves the day. Ensure comedic beats hit at 3s, 7s, 12s.',
      },
      {
        step: 'Storyboard',
        agent: 'Shotlist Agent',
        snippet: 'Generate 6-shot vertical storyboard optimized for TikTok loops; include alt endings for A/B tests.',
      },
      {
        step: 'Generate',
        agent: 'Veo 3 Rapid Render',
        snippet: 'Prompt pack with slapstick cues, pastel lighting, comedic timing markers.',
      },
      {
        step: 'Distribution',
        agent: 'Launch Director',
        snippet: 'Schedule TikTok+IG cross-post, attach meme seeding kit for Discord communities.',
      },
    ],
    shots: [
      {
        scene: 'Kitchen chaos',
        prompt: 'Grandma in apron realizes outfit missing, alpaca bursts through door tossing sequined robe.',
      },
      {
        scene: 'Community reaction',
        prompt: 'Split-screen of TikTok duets laughing, comments flying, grandma waves from neon stage.',
      },
    ],
    timeline: { days: 3, phases: ['Prompt lab', 'Rapid Veo 3 renders', 'Social seeding + meme remix'] },
    ethicalNotes: 'All performers synthetic; comedic scenario flagged safe-for-work. Automatic AI-generated label displayed on upload.',
  },
  'ai-tv': {
    id: 'ai-tv',
    title: 'AI TV Episode',
    releaseDate: 'May 2024',
    metrics: { views: 3_200_000, shares: 210_000, costEstimate: '$25K estimated' },
    heroMedia: '25-minute AI-native TV pilot exploring multiverse heists',
    tools: ['Veo 3', 'Midjourney Omni Reference', 'ElevenLabs', 'DaVinci Resolve', 'Codex QA'],
    pipeline: [
      {
        step: 'Writers room',
        agent: 'Script Agent',
        snippet: 'Generate 4-act structure, maintain PJ Ace tone (earnest + absurdist).',
      },
      {
        step: 'Look dev',
        agent: 'Reference Manager',
        snippet: 'Upload Omni reference pack to lock character continuity across 25 minutes.',
      },
      {
        step: 'Production',
        agent: 'Director Agent',
        snippet: 'Batch Veo 3 sequences, orchestrate ElevenLabs ensemble, auto-sync subtitles.',
      },
      {
        step: 'QA + Release',
        agent: 'Codex QA',
        snippet: 'Full Codex review with notes on pacing, compliance, and metadata export for streaming partners.',
      },
    ],
    shots: [
      {
        scene: 'Heist briefing',
        prompt: 'Diverse cast at holographic table planning multiverse jump, cinematic lighting, kinetic camera.',
        refImages: ['omniRef:crew-front', 'omniRef:hologram'],
      },
      {
        scene: 'Portal chase',
        prompt: 'Extended chase through shifting universes, match-on-action transitions, saturated color palette.',
      },
    ],
    timeline: { days: 6, phases: ['Act structure + voice casting', 'Look dev + Veo 3 batches', 'Edit + QC + distribution'] },
    ethicalNotes: 'Voice actors compensated and licensed for ElevenLabs clones; distribution includes AI-disclosure bumpers and accessible subtitles.',
  },
};

export const heroCopy = {
  headline: 'AdGenXAI powers the next generation of AI filmmakers.',
  subhead:
    'Creators like PJ Ace use agent-first pipelines to turn a prompt into a viral cinematic ad or a 25-minute AI TV episode in days, not months.',
  ctaPrimary: { text: 'Spin up PJ Ace workflow', href: '/templates/import?source=pj-ace-viral-ad' },
  ctaSecondary: { text: 'Explore Creator Showcase', href: '/creators/pj-ace' },
  statLine: 'Idea → Agent Swarm → Veo 3 → Post-edit → Preview & test → Deploy & iterate.',
};

export const featureHighlights: FeatureCard[] = [
  {
    title: 'Agent Swarm Studio',
    description:
      'Orchestrate ideation, script, shotlist, and post-production agents in one roster UI. Codex QA watches every revision before launch.',
    stat: 'Template roster: PJ Ace Meme Strategist, Scriptwright, Shotlist Pilot, Director, Post Supervisor.',
  },
  {
    title: 'Viral Templates',
    description:
      'Start with PJ Ace battle-tested templates — Bible Vlog, Diss Track Ads, Brand Beef, Documentary-style epic. Import prompts, shotlists, and distribution plans instantly.',
  },
  {
    title: 'Legal & Ethics Guardrails',
    description:
      'Consent flows for likeness and voice, AI-generated labels, provenance audit trail, and moderation checks keep high-velocity teams compliant.',
  },
];

export const legalFeatures = [
  'Likeness consent modal captures signatures before render.',
  'Voice cloning disclosure layered into ElevenLabs flows.',
  'Auto-labels apply “AI-generated” watermark plus provenance JSON.',
  'Moderation queue catches banned phrases and high-risk prompts.',
  'Downloadable audit trail with prompts, models, approvals, and timestamps.',
  'Copyright & provenance panel educates brands on model licenses.',
];

export const analyticsHighlights = [
  {
    title: 'Viral Momentum',
    detail: 'Track velocity of views in the first 24 hours vs baseline to steer spend in real-time.',
  },
  {
    title: 'Prompt ROI',
    detail: 'Tie conversion lift to specific prompts and variants so creative ops double down on what works.',
  },
  {
    title: 'Variant “meme-ability”',
    detail: 'Composite share, comment, and completion data to crown the clip that travels the internet.',
  },
  {
    title: 'Badge usage',
    detail: 'Monitor how often operators escalate high-risk tasks for manual approval.',
  },
  {
    title: 'Echo reuse',
    detail: 'See which prompts and reference packs become cross-campaign staples.',
  },
];

export const templateGallery: TemplateItem[] = [
  {
    name: 'Bible Vlog',
    description: 'Weekly serialized short tackling sacred stories with PJ Ace’s cinematic meme language.',
    icon: '📖',
  },
  {
    name: 'Brand Beef',
    description: 'Spin up playful call-outs and clapbacks overnight with Veo 3, Omni Reference, and TikTok-native pacing.',
    icon: '🔥',
  },
  {
    name: 'Documentary Epic',
    description: 'ElevenLabs-narrated hero journey with Omni reference-driven consistency and Codex QA gating.',
    icon: '🎬',
  },
];

export const developerEndpoints: ApiEndpoint[] = [
  {
    method: 'POST',
    path: '/api/agents/run',
    description: 'Launch a swarm using PJ Ace templates with async job tokens and SSE updates.',
    sample: `curl -X POST https://adgenxai.dev/api/agents/run \
  -H "Content-Type: application/json" \
  -d '{
    "templateId": "pj-ace-viral-ad",
    "campaign": {
      "name": "IM8 Blitz",
      "objective": "Launch digital twin ad",
      "assets": []
    },
    "variants": 3
  }'`,
  },
  {
    method: 'POST',
    path: '/api/pipeline/veo3/generate',
    description: 'Server-side Veo 3 orchestration with shotlists and Omni Reference IDs.',
  },
  {
    method: 'POST',
    path: '/api/reference/upload',
    description: 'Store Omni reference packs and return IDs for pipeline hydration.',
  },
  {
    method: 'POST',
    path: '/api/audio/elevenlabs',
    description: 'Trigger voice generation with consent payload and fetch signed audio URLs.',
  },
  {
    method: 'POST',
    path: '/api/codex/review',
    description: 'Submit preview diffs for Codex QA review before approvals.',
  },
  {
    method: 'GET',
    path: '/live/:agentId/stream',
    description: 'Subscribe to SSE stream for live swarm updates, artifact status, and preview URLs.',
  },
];

export const rolloutPlan = [
  'Week 0 — Design hero, Creator Showcase, Case Study, and demo flows with PJ Ace narrative.',
  'Week 1 — Build marketing hero, feature cards, CreatorProfile, and CaseStudy components with mock data + template CTA.',
  'Week 2 — Wire preview sandbox to mocked async jobs and SSE streams, add Codex review stub.',
  'Week 3 — Connect Netlify previews, enable /api/agents/run to enqueue jobs, layer privacy + consent flows.',
  'Week 4 — Ship analytics dashboard, legal hub, and exportable case study prompt packs.',
];

export const deliverables = [
  {
    title: 'Starter Next.js page',
    detail: 'Hero, feature cards, Creator Showcase, and demo sandbox wired to mocked endpoints.',
  },
  {
    title: 'Case Study template & 3 filled pages',
    detail: 'Grandma Video, IM8 Ad, and AI TV Show rendered with downloadable prompt packs.',
  },
  {
    title: 'Creator Showcase UI spec',
    detail: 'Component props, states, accessibility notes, and PJ Ace project JSON for designers.',
  },
];

export const legalCta = {
  headline: 'AI ethics, provenance, and consent front-and-center.',
  body: 'Surface likeness approval workflows, voice cloning disclosures, AI-generated labels, and downloadable audit trails to keep brand campaigns compliant without slowing them down.',
  cta: { text: 'Review compliance playbook', href: '/legal/ai-consent' },
};

export const developerHero = {
  title: 'Build with AdGenXAI APIs',
  description: 'SSE streams, async job tokens, and Codex-reviewed pipelines help developers replicate PJ Ace-grade workflows in their stacks.',
  cta: { text: 'View API reference', href: '/developers#api' },
  quickstartTitle: 'Quickstart: Replicate the Grandma video pipeline',
  quickstartBody:
    'Use the `/api/agents/run` endpoint with the `pj-ace-grandma` template to orchestrate ideation, Veo 3 renders, and Codex QA from one request.',
};

