/**
 * POST /api/generate/evaluate
 * Evaluate generated ads for quality and effectiveness
 */

import { NextRequest, NextResponse } from 'next/server';
import { evaluateGeneratedAds } from '@/lib/ad-generation';
import { createLogger } from '@/lib/logger';

const logger = createLogger({ function: 'api-evaluate' });

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.ads || !Array.isArray(body.ads) || body.ads.length === 0) {
      return NextResponse.json(
        { error: 'ads array is required and must contain at least one ad' },
        { status: 400 }
      );
    }

    if (!body.productName) {
      return NextResponse.json(
        { error: 'productName is required' },
        { status: 400 }
      );
    }

    if (!body.targetAudience) {
      return NextResponse.json(
        { error: 'targetAudience is required' },
        { status: 400 }
      );
    }

    logger.info('evaluation_request', {
      product: body.productName,
      adCount: body.ads.length,
    });

    try {
      const evaluations = await evaluateGeneratedAds(
        body.ads,
        body.productName,
        body.targetAudience
      );

      // Calculate aggregate stats
      const avgScore = evaluations.reduce((sum, e) => sum + e.score, 0) / evaluations.length;
      const bestAd = evaluations.reduce((best, current) =>
        current.score > best.score ? current : best
      );
      const worstAd = evaluations.reduce((worst, current) =>
        current.score < worst.score ? current : worst
      );

      return NextResponse.json({
        evaluations,
        stats: {
          avgScore: Math.round(avgScore),
          bestScore: bestAd.score,
          worstScore: worstAd.score,
          recommendation: `Ad ${bestAd.adIndex + 1} has the highest score (${bestAd.score}/100)`,
        },
      });
    } catch (error) {
      logger.error('evaluation_failed', {
        product: body.productName,
        error: error instanceof Error ? error.message : String(error),
      });

      return NextResponse.json(
        { error: 'Evaluation failed: ' + (error instanceof Error ? error.message : 'Unknown error') },
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
