/**
 * POST /api/generate
 * Main endpoint for AI-powered ad generation
 * Supports streaming responses for real-time feedback
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  generateAds,
  generateConstrainedAdCopy,
  evaluateGeneratedAds,
  getAvailablePersonas,
  getAvailableAdTypes,
  getAvailableToneModifiers,
} from '@/lib/ad-generation';
import { createLogger } from '@/lib/logger';
import type { PersonaId, AdType, ToneModifier } from '@/lib/personas';

const logger = createLogger({ function: 'api-generate' });

/**
 * GET /api/generate
 * Returns available options for generation
 */
export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      personas: getAvailablePersonas(),
      adTypes: getAvailableAdTypes(),
      toneModifiers: getAvailableToneModifiers(),
    });
  } catch (error) {
    logger.error('get_options_failed', {
      error: error instanceof Error ? error.message : String(error),
    });

    return NextResponse.json(
      { error: 'Failed to retrieve generation options' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/generate
 * Generate ad variations
 *
 * Request body:
 * {
 *   productName: string
 *   productDescription: string
 *   targetAudience: string
 *   personaId: PersonaId
 *   adType: AdType
 *   toneModifier?: ToneModifier
 *   variationCount?: number (default: 3)
 *   additionalContext?: string
 *   streaming?: boolean (default: true)
 *   maxCharacters?: number (for constrained ads)
 *   maxLines?: number (for constrained ads)
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const required = ['productName', 'productDescription', 'targetAudience', 'personaId', 'adType'];
    const missing = required.filter(field => !body[field]);

    if (missing.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missing.join(', ')}` },
        { status: 400 }
      );
    }

    // Extract request parameters
    const personaId = body.personaId as PersonaId;
    const adType = body.adType as AdType;
    const toneModifier = body.toneModifier as ToneModifier | undefined;
    const streaming = body.streaming !== false; // Default to true
    const variationCount = body.variationCount || 3;

    logger.info('generation_request', {
      product: body.productName,
      persona: personaId,
      adType,
      variationCount,
      streaming,
    });

    // Handle constrained ads (with character/line limits)
    if (body.maxCharacters || body.maxLines) {
      try {
        const ad = await generateConstrainedAdCopy({
          productName: body.productName,
          productDescription: body.productDescription,
          targetAudience: body.targetAudience,
          personaId,
          adType,
          toneModifier,
          additionalContext: body.additionalContext,
          maxCharacters: body.maxCharacters,
          maxLines: body.maxLines,
        });

        return NextResponse.json({
          ads: [ad],
          metadata: {
            productName: body.productName,
            persona: personaId,
            adType,
            toneModifier,
            constrained: true,
            generatedAt: new Date().toISOString(),
          },
        });
      } catch (error) {
        logger.error('constrained_generation_failed', {
          product: body.productName,
          error: error instanceof Error ? error.message : String(error),
        });

        return NextResponse.json(
          { error: 'Ad generation failed: ' + (error instanceof Error ? error.message : 'Unknown error') },
          { status: 500 }
        );
      }
    }

    // Handle streaming responses
    if (streaming) {
      return handleStreamingGeneration(
        {
          productName: body.productName,
          productDescription: body.productDescription,
          targetAudience: body.targetAudience,
          personaId,
          adType,
          toneModifier,
          variationCount,
          additionalContext: body.additionalContext,
          streaming: true,
        },
        logger
      );
    }

    // Handle non-streaming responses
    try {
      const result = await generateAds({
        productName: body.productName,
        productDescription: body.productDescription,
        targetAudience: body.targetAudience,
        personaId,
        adType,
        toneModifier,
        variationCount,
        additionalContext: body.additionalContext,
        streaming: false,
      });

      return NextResponse.json(result);
    } catch (error) {
      logger.error('generation_failed', {
        product: body.productName,
        error: error instanceof Error ? error.message : String(error),
      });

      return NextResponse.json(
        { error: 'Ad generation failed: ' + (error instanceof Error ? error.message : 'Unknown error') },
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

/**
 * Handle streaming generation with real-time feedback
 */
async function handleStreamingGeneration(
  generationRequest: any,
  logger: any
): Promise<NextResponse> {
  // Create a readable stream for streaming responses
  const encoder = new TextEncoder();
  let generatedAds: string[] = [];
  let metadata: any = null;

  const customReadable = new ReadableStream({
    async start(controller) {
      try {
        // Send opening bracket for JSON stream
        controller.enqueue(encoder.encode('{"ads":['));

        // Generate ads with streaming chunks
        const result = await generateAds(generationRequest, (chunk: string) => {
          // Send each chunk as it arrives
          const escaped = JSON.stringify(chunk).slice(1, -1); // Remove quotes and escape properly
          controller.enqueue(encoder.encode(escaped));
        });

        generatedAds = result.ads;
        metadata = result.metadata;

        // Send closing and metadata
        controller.enqueue(encoder.encode('"],"metadata":'));
        controller.enqueue(encoder.encode(JSON.stringify(metadata)));
        controller.enqueue(encoder.encode('}'));

        controller.close();
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        controller.enqueue(
          encoder.encode(
            JSON.stringify({
              error: 'Generation failed: ' + errorMessage,
            })
          )
        );
        controller.close();
      }
    },
  });

  return new NextResponse(customReadable, {
    headers: {
      'Content-Type': 'application/json',
      'Transfer-Encoding': 'chunked',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
