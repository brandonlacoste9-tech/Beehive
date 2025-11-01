/**
 * POST /api/generate/variations
 * Generate variations of an existing ad
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateAdVariations } from '@/lib/ad-generation';
import { createLogger } from '@/lib/logger';
import { PersonaId } from '@/lib/personas';

const logger = createLogger({ function: 'api-variations' });

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const required = ['originalAd', 'personaId', 'variationType'];
    const missing = required.filter(field => !body[field]);

    if (missing.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missing.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate variation type
    const validTypes = ['tone', 'length', 'approach', 'audience'];
    if (!validTypes.includes(body.variationType)) {
      return NextResponse.json(
        { error: `Invalid variationType. Must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      );
    }

    const personaId = body.personaId as PersonaId;
    const variationType = body.variationType as 'tone' | 'length' | 'approach' | 'audience';
    const variationCount = body.variationCount || 3;

    logger.info('variation_request', {
      persona: personaId,
      variationType,
      variationCount,
      originalAdLength: body.originalAd.length,
    });

    try {
      const variations = await generateAdVariations(
        body.originalAd,
        variationType,
        personaId,
        variationCount
      );

      return NextResponse.json({
        originalAd: body.originalAd,
        variations,
        metadata: {
          personaId,
          variationType,
          variationCount: variations.length,
          generatedAt: new Date().toISOString(),
        },
      });
    } catch (error) {
      logger.error('variation_generation_failed', {
        persona: personaId,
        variationType,
        error: error instanceof Error ? error.message : String(error),
      });

      return NextResponse.json(
        { error: 'Variation generation failed: ' + (error instanceof Error ? error.message : 'Unknown error') },
        { status: 500 }
      );
    }
  } catch (error) {
    logger.error('request_parsing_failed', {
      error: error instanceof Error ? error.message : String(error),
    });

    return NextResponse.json(
      { error: 'Invalid request format' },
      { status: 400 }
    );
  }
}
