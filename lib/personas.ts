// Type-safe helper for AD_TYPES lookup
export function getAdTypeInfo(adType: string) {
  const normalizedKey = adType.toLowerCase() as keyof typeof AD_TYPES;
  const info = AD_TYPES[normalizedKey];
  if (!info) {
    console.warn(`Unknown ad type: ${adType}. Using default.`);
    return { name: 'Unknown', lengthGuide: 'Standard length' };
  }
  return info;
}

// Type-safe helper for TONE_MODIFIERS lookup
export function getToneModifier(tone: string) {
  const normalizedKey = tone.toLowerCase() as keyof typeof TONE_MODIFIERS;
  const modifier = TONE_MODIFIERS[normalizedKey];
  if (!modifier) {
    console.warn(`Unknown tone: ${tone}. Using default.`);
    return { id: 'casual', name: 'Casual', description: 'Standard tone' };
  }
  return modifier;
}


// lib/personas.ts

export interface Persona {
  id: string;
  name: string;
}


const personasArray: Persona[] = [
  { id: 'startup_founder', name: 'Startup Founder' },
  { id: 'enterprise', name: 'Enterprise' },
  { id: 'influencer', name: 'Influencer' },
  { id: 'small_business', name: 'Small Business Owner' },
  { id: 'marketing_manager', name: 'Marketing Manager' }
];


export function listPersonas(): Persona[] {
  return personasArray;
}


export function getPersona(id: string): Persona {
  const persona = personasArray.find(p => p.id === id);
  if (!persona) throw new Error(`Persona not found: ${id}`);
  return persona;
}


// PERSONAS as object keyed by id
export const PERSONAS = Object.fromEntries(personasArray.map(p => [p.id, p]));

// AD_TYPES as structured object
export const AD_TYPES = {
  awareness: {
    name: 'Awareness',
    lengthGuide: 'Short and catchy'
  },
  conversion: {
    name: 'Conversion',
    lengthGuide: 'Persuasive and direct'
  },
  retargeting: {
    name: 'Retargeting',
    lengthGuide: 'Remind and re-engage'
  }
} as const;

// TONE_MODIFIERS as structured object
export const TONE_MODIFIERS = {
  casual: {
    id: 'casual',
    name: 'Casual',
    description: 'Conversational, friendly, relatable'
  },
  professional: {
    id: 'professional',
    name: 'Professional',
    description: 'Polished, authoritative, expert'
  },
  witty: {
    id: 'witty',
    name: 'Witty',
    description: 'Clever, playful, memorable'
  }
} as const;
