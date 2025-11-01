/**
 * Ad Generation Business Logic
 * Core logic for managing the ad generation workflow
 */

import {
  generateAdCopy,
  generateConstrainedAd,
  evaluateAd,
  generateVariations,
  GenerationRequest,
} from './claude';
import {
  getPersona,
  type PersonaId,
  type AdType,
  type ToneModifier,
  AD_TYPES,
  TONE_MODIFIERS,
  getAdTypeInfo,
  getToneModifier
} from './personas';
import { createLogger } from './logger';

const logger = createLogger({ function: 'ad-generation' });

export interface GenerateAdRequest {
  productName: string;
  productDescription: string;
  targetAudience: string;
  personaId: PersonaId;
  adType: AdType;
  toneModifier?: ToneModifier;
  variationCount?: number;
  additionalContext?: string;
  streaming?: boolean;
}

export interface GeneratedAds {
  id: string;
  ads: string[];
  metadata: {
    productName: string;
    persona: string;
    adType: string;
    toneModifier?: string;
    tokensUsed: number;
    generatedAt: string;
    generationTime: number;
  };
}

export interface AdEvaluation {
  adIndex: number;
  adCopy: string;
  score: number;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
}

/**
 * Generate ad variations for a product
 */
export async function generateAds(
  request: GenerateAdRequest,
  onChunk?: (chunk: string) => void
): Promise<GeneratedAds> {
  const startTime = Date.now();

  try {

    const persona = getPersona(request.personaId as string);
    const adTypeInfo = getAdTypeInfo(request.adType as string);
    const variationCount = request.variationCount || 3;

    // Build tone guidance
    let toneGuidance = 'Use the persona\'s natural tone';
    if (request.toneModifier) {
      const tone = getToneModifier(request.toneModifier as string);
      toneGuidance = `${toneGuidance}, with additional guidance: ${tone.description}`;
    }

    // Prepare generation request
    const generationRequest: GenerationRequest = {
      productName: request.productName,
      productDescription: request.productDescription,
      targetAudience: request.targetAudience,
      personaSystemPrompt: persona.systemPrompt || `You are a creative marketer targeting ${persona.name}. Write engaging and effective content.`,
      adType: `${adTypeInfo.name} - ${adTypeInfo.lengthGuide}`,
      toneGuidance,
      variationCount,
      additionalContext: request.additionalContext,
    };

    logger.info('generation_started', {
      product: request.productName,
      persona: persona.id,
      variationCount,
    });

    // Generate ads
    const result = await generateAdCopy(generationRequest, onChunk);

    const generatedAds: GeneratedAds = {
      id: `gen_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ads: result.ads,
      metadata: {
        productName: request.productName,
        persona: persona.name,
        adType: request.adType,
        toneModifier: request.toneModifier,
        tokensUsed: result.tokensUsed,
        generatedAt: new Date().toISOString(),
        generationTime: Date.now() - startTime,
      },
    };

    logger.info('generation_completed', {
      product: request.productName,
      persona: persona.id,
      adCount: generatedAds.ads.length,
      generationTime: generatedAds.metadata.generationTime,
      tokensUsed: result.tokensUsed,
    });

    return generatedAds;
  } catch (error) {
    logger.error('generation_failed', {
      product: request.productName,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

/**
 * Generate a single constrained ad (useful for tight format requirements)
 */
export async function generateConstrainedAdCopy(
  request: GenerateAdRequest & {
    maxCharacters?: number;
    maxLines?: number;
  }
): Promise<string> {
  try {

    const persona = getPersona(request.personaId as string);
    const adTypeInfo = getAdTypeInfo(request.adType as string);

    let toneGuidance = 'Use the persona\'s natural tone';
    if (request.toneModifier) {
      const tone = getToneModifier(request.toneModifier as string);
      toneGuidance = `${toneGuidance}, with: ${tone.description}`;
    }

    const generationRequest: GenerationRequest & { maxCharacters?: number; maxLines?: number } = {
      productName: request.productName,
      productDescription: request.productDescription,
      targetAudience: request.targetAudience,
      personaSystemPrompt: persona.systemPrompt || `You are a creative marketer targeting ${persona.name}. Write engaging and effective content.`,
      adType: `${adTypeInfo.name} - ${adTypeInfo.lengthGuide}`,
      toneGuidance,
      variationCount: 1,
      additionalContext: request.additionalContext,
      maxCharacters: request.maxCharacters,
      maxLines: request.maxLines,
    };

    logger.info('constrained_generation_started', {
      product: request.productName,
      persona: request.personaId,
      maxCharacters: request.maxCharacters,
      maxLines: request.maxLines,
    });

    const ad = await generateConstrainedAd(generationRequest);

    logger.info('constrained_generation_completed', {
      product: request.productName,
      persona: request.personaId,
      adLength: ad.length,
    });

    return ad;
  } catch (error) {
    logger.error('constrained_generation_failed', {
      product: request.productName,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

/**
 * Evaluate generated ads
 */
export async function evaluateGeneratedAds(
  ads: string[],
  productName: string,
  targetAudience: string
): Promise<AdEvaluation[]> {
  try {
    const evaluations: AdEvaluation[] = [];

    logger.info('evaluation_started', {
      product: productName,
      adCount: ads.length,
    });

    for (let i = 0; i < ads.length; i++) {
      const evaluation = await evaluateAd(ads[i], targetAudience, productName);
      evaluations.push({
        adIndex: i,
        adCopy: ads[i],
        ...evaluation,
      });
    }

    logger.info('evaluation_completed', {
      product: productName,
      evaluatedCount: evaluations.length,
      avgScore: (evaluations.reduce((sum, e) => sum + e.score, 0) / evaluations.length).toFixed(1),
    });

    return evaluations;
  } catch (error) {
    logger.error('evaluation_failed', {
      product: productName,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

/**
 * Generate variations of an existing ad
 */
export async function generateAdVariations(
  originalAd: string,
  variationType: 'tone' | 'length' | 'approach' | 'audience',
  personaId: PersonaId,
  variationCount: number = 3
): Promise<string[]> {
  try {
    const persona = getPersona(personaId as string);

    logger.info('variation_generation_started', {
      persona: personaId,
      variationType,
      variationCount,
    });

    const variations = await generateVariations(
      originalAd,
      variationType,
      persona.systemPrompt || `You are a creative marketer targeting ${persona.name}. Write engaging and effective content.`,
      variationCount
    );

    logger.info('variation_generation_completed', {
      persona: personaId,
      variationType,
      variationCount: variations.length,
    });

    return variations;
  } catch (error) {
    logger.error('variation_generation_failed', {
      variationType,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

/**
 * Get all available personas with descriptions
 */
import { listPersonas } from './personas';
export function getAvailablePersonas() {
  return listPersonas().map((persona: any) => ({
    id: persona.id,
    name: persona.name,
    description: persona.description,
    targetAudience: persona.targetAudience,
    primaryGoals: persona.primaryGoals,
    tonalCharacteristics: persona.tonalCharacteristics,
  }));
}

/**
 * Get all available ad types
 */
export function getAvailableAdTypes() {
  return Object.entries(AD_TYPES).map(([id, info]) => ({
    id,
    ...info,
  }));
}

/**
 * Get all available tone modifiers
 */
export function getAvailableToneModifiers() {
  return Object.entries(TONE_MODIFIERS).map(([id, info]) => ({
    id,
    name: info.name,
    description: info.description,
  }));
}
