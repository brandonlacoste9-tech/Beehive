/**
 * Persona System for AdGenXAI
 * Defines 5 buyer personas with unique characteristics, tones, and prompt templates
 */

export type PersonaId = 'small_business' | 'marketing_manager' | 'influencer' | 'enterprise' | 'startup_founder';

export interface Persona {
  id: PersonaId;
  name: string;
  description: string;
  targetAudience: string;
  primaryGoals: string[];
  tonalCharacteristics: string[];
  preferredStyle: string;
  adLengthPreference: 'short' | 'medium' | 'long';
  systemPrompt: string;
  exampleAdTopics: string[];
}

/**
 * Persona A: Small Business Owner
 * Focus: ROI, simplicity, local impact
 */
export const SMALL_BUSINESS_OWNER: Persona = {
  id: 'small_business',
  name: 'Small Business Owner',
  description: 'Owner of 1-10 person business, focused on practical growth and ROI',
  targetAudience: 'Local customers, repeat buyers',
  primaryGoals: [
    'Increase local foot traffic',
    'Maximize ROI on marketing spend',
    'Build customer loyalty',
    'Keep costs low'
  ],
  tonalCharacteristics: [
    'Honest and straightforward',
    'Practical and no-nonsense',
    'Friendly and personal',
    'Value-focused'
  ],
  preferredStyle: 'Direct, benefit-driven, with clear call-to-action',
  adLengthPreference: 'short',
  systemPrompt: `You are creating ads for small business owners who value ROI and practicality.
Focus on:
- Clear, immediate benefits
- Local relevance and community connection
- Honest, straightforward language (avoid corporate jargon)
- Strong call-to-action with direct next steps
- Emphasis on value for money
- Real customer testimonials or specifics
Generate ads that are brief, punchy, and directly address the pain point.`,
  exampleAdTopics: [
    'Local services (plumbing, cleaning, repairs)',
    'Retail (boutiques, specialty shops)',
    'Professional services (accounting, consulting)',
    'Restaurants and cafes'
  ]
};

/**
 * Persona B: Marketing Manager
 * Focus: Performance metrics, data, brand strategy
 */
export const MARKETING_MANAGER: Persona = {
  id: 'marketing_manager',
  name: 'Marketing Manager',
  description: 'Professional marketer at mid-size company, data-driven decision maker',
  targetAudience: 'B2B decision makers, businesses seeking solutions',
  primaryGoals: [
    'Hit campaign KPIs',
    'Demonstrate marketing ROI',
    'Build brand authority',
    'Increase qualified leads'
  ],
  tonalCharacteristics: [
    'Professional and polished',
    'Data-backed and confident',
    'Strategic and solution-oriented',
    'Competitive edge focused'
  ],
  preferredStyle: 'Sophisticated, metrics-driven, with proof points',
  adLengthPreference: 'medium',
  systemPrompt: `You are creating ads for marketing professionals who think in terms of metrics and strategy.
Focus on:
- Quantifiable results and ROI
- Competitive advantages with proof
- Professional, sophisticated messaging
- Industry-specific terminology (appropriate)
- Multi-channel strategy angle
- Case studies or metrics as proof points
Generate ads that position the offering as a strategic business decision with measurable impact.`,
  exampleAdTopics: [
    'B2B software solutions',
    'Marketing technology platforms',
    'Enterprise services',
    'Professional development courses'
  ]
};

/**
 * Persona C: Influencer/Creator
 * Focus: Engagement, audience growth, authenticity
 */
export const INFLUENCER_CREATOR: Persona = {
  id: 'influencer',
  name: 'Influencer/Creator',
  description: 'Content creator focused on audience growth and engagement',
  targetAudience: 'Followers, fans, engaged community',
  primaryGoals: [
    'Increase follower count and engagement',
    'Build authentic community',
    'Monetize audience',
    'Stay relevant to trends'
  ],
  tonalCharacteristics: [
    'Trendy and current',
    'Authentic and relatable',
    'Playful and entertaining',
    'Community-focused'
  ],
  preferredStyle: 'Casual, trend-aware, conversation-starting',
  adLengthPreference: 'short',
  systemPrompt: `You are creating ads for influencers and content creators who live for engagement.
Focus on:
- Trendy, current language and references
- Authenticity and relatability
- Conversation-starting hooks
- Audience growth angles
- Entertainment value
- Community building elements
Generate ads that feel native to social platforms and encourage interaction/sharing.`,
  exampleAdTopics: [
    'Content creation tools',
    'Personal brand development',
    'Social media growth services',
    'Lifestyle and fashion products',
    'Fitness and wellness'
  ]
};

/**
 * Persona D: Enterprise Brand
 * Focus: Brand safety, compliance, scale
 */
export const ENTERPRISE_BRAND: Persona = {
  id: 'enterprise',
  name: 'Enterprise Brand',
  description: 'Large organization requiring brand consistency and compliance',
  targetAudience: 'Corporate clients, brand-conscious consumers',
  primaryGoals: [
    'Maintain brand reputation',
    'Ensure message consistency',
    'Achieve enterprise scale',
    'Comply with regulations'
  ],
  tonalCharacteristics: [
    'Formal and authoritative',
    'Polished and premium',
    'Trust-building and stable',
    'Inclusive and responsible'
  ],
  preferredStyle: 'Premium, brand-consistent, compliance-aware',
  adLengthPreference: 'medium',
  systemPrompt: `You are creating ads for large enterprises that require brand consistency and safety.
Focus on:
- Formal, authoritative, polished tone
- Brand values and corporate responsibility
- Trust-building and credibility signals
- Compliance and risk-awareness
- Inclusive and diverse representation
- Premium quality positioning
Generate ads that reflect corporate maturity, values alignment, and brand safety.`,
  exampleAdTopics: [
    'Financial services',
    'Enterprise software',
    'Insurance products',
    'Luxury brands',
    'Corporate training'
  ]
};

/**
 * Persona E: Startup Founder
 * Focus: Growth hacking, innovation, disruptive thinking
 */
export const STARTUP_FOUNDER: Persona = {
  id: 'startup_founder',
  name: 'Startup Founder',
  description: 'Entrepreneur focused on rapid growth and market disruption',
  targetAudience: 'Early adopters, tech-savvy users, growth-minded customers',
  primaryGoals: [
    'Achieve rapid user/revenue growth',
    'Disrupt market or create new category',
    'Build defensible competitive advantage',
    'Scale efficiently'
  ],
  tonalCharacteristics: [
    'Bold and visionary',
    'Unconventional and innovative',
    'Ambitious and confident',
    'Fast-paced and energetic'
  ],
  preferredStyle: 'Bold, forward-thinking, growth-focused',
  adLengthPreference: 'medium',
  systemPrompt: `You are creating ads for startup founders who think big about growth and disruption.
Focus on:
- Bold, ambitious vision
- Market opportunity and potential
- First-mover or innovation advantage
- Growth metrics and trajectory
- Mission-driven narrative
- Energy and momentum
Generate ads that inspire action, communicate opportunity, and appeal to early adopters.`,
  exampleAdTopics: [
    'SaaS startups',
    'Fintech innovations',
    'Marketplace platforms',
    'AI/ML tools',
    'Sustainability solutions'
  ]
};

/**
 * Registry of all personas
 */
export const PERSONAS: Record<PersonaId, Persona> = {
  small_business: SMALL_BUSINESS_OWNER,
  marketing_manager: MARKETING_MANAGER,
  influencer: INFLUENCER_CREATOR,
  enterprise: ENTERPRISE_BRAND,
  startup_founder: STARTUP_FOUNDER,
};

/**
 * Get persona by ID
 */
export function getPersona(id: PersonaId): Persona {
  const persona = PERSONAS[id];
  if (!persona) {
    throw new Error(`Persona not found: ${id}`);
  }
  return persona;
}

/**
 * List all personas
 */
export function listPersonas(): Persona[] {
  return Object.values(PERSONAS);
}

/**
 * Ad type variations with prompting guidance
 */
export type AdType = 'social_post' | 'search_engine' | 'email' | 'blog_headline' | 'video_script';

export const AD_TYPES: Record<AdType, { name: string; lengthGuide: string }> = {
  social_post: {
    name: 'Social Media Post',
    lengthGuide: 'Keep to 280 characters for Twitter, 2200 for LinkedIn, flexible for others. Include emoji if appropriate.'
  },
  search_engine: {
    name: 'Search Engine Ad',
    lengthGuide: 'Headline: 30 chars, Description: 90 chars. Include keywords naturally.'
  },
  email: {
    name: 'Email Subject & Preview',
    lengthGuide: 'Subject: 50 chars max, Preview: 100 chars. Create curiosity and urgency.'
  },
  blog_headline: {
    name: 'Blog/Article Headline',
    lengthGuide: 'Headline: 60 chars, Subheading: 120 chars. Focus on curiosity and benefit.'
  },
  video_script: {
    name: 'Video Script/Hook',
    lengthGuide: '15-30 seconds of script. Hook viewer in first 3 seconds, create momentum.'
  }
};

/**
 * Tone modifiers for fine-tuning generation
 */
export type ToneModifier = 'playful' | 'urgent' | 'educational' | 'inspirational' | 'humorous' | 'serious' | 'luxury' | 'casual';

export const TONE_MODIFIERS: Record<ToneModifier, string> = {
  playful: 'Add lighthearted humor and wit',
  urgent: 'Create sense of time sensitivity and FOMO',
  educational: 'Focus on teaching and explaining value',
  inspirational: 'Appeal to higher purpose and transformation',
  humorous: 'Use jokes, puns, or clever wordplay',
  serious: 'Professional, no-nonsense tone',
  luxury: 'Premium, exclusive, sophisticated',
  casual: 'Conversational, friendly, relatable'
};
