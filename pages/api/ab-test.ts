import { GoogleGenerativeAI } from '@google/generative-ai';
import { withAuth, checkUsageLimit, incrementUsage, recordGeneration, AuthenticatedRequest } from '../../src/lib/auth';
import type { NextApiResponse } from 'next';

/**
 * A/B Testing - Generate Multiple Variations
 *
 * Generates 5 different variations of ad creative for A/B testing
 *
 * POST /api/ab-test
 * Headers: { Authorization: Bearer <token> }
 * Body: { product, audience, tone, variations }
 */

interface Variation {
  variation: number;
  headline: string;
  body: string;
  imagePrompt: string;
  angle: string; // The marketing angle used
}

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const user = req.user!;
    const { product, audience, tone = 'professional', variations = 5 } = req.body;

    if (!product || !audience) {
      return res.status(400).json({
        error: 'Missing required fields',
        details: 'product and audience are required',
      });
    }

    // Check if user has Pro or Enterprise plan
    if (user.plan === 'free') {
      return res.status(403).json({
        error: 'A/B testing requires Pro or Enterprise plan',
        message: 'Upgrade to access A/B testing with 5 variations',
        upgrade_url: '/pricing',
      });
    }

    // Check usage limit (A/B test counts as 1 generation)
    const usageCheck = await checkUsageLimit(user.id);
    if (!usageCheck.allowed) {
      return res.status(429).json({
        error: 'Usage limit exceeded',
        message: usageCheck.reason,
        upgrade_url: '/pricing',
      });
    }

    // Generate variations
    const variationResults = await generateVariations({
      product,
      audience,
      tone,
      count: Math.min(variations, 5),
    });

    // Increment usage (counts as 1 generation)
    await incrementUsage(user.id);

    // Record in history
    for (const variation of variationResults) {
      await recordGeneration({
        userId: user.id,
        product,
        audience,
        tone,
        headline: variation.headline,
        body: variation.body,
        imagePrompt: variation.imagePrompt,
        model: `gemini-ab-test-v${variation.variation}`,
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        variations: variationResults,
        totalVariations: variationResults.length,
        testingTips: [
          'Test each variation with at least 100 impressions',
          'Monitor click-through rate (CTR) and conversion rate',
          'Let tests run for at least 3-7 days for statistical significance',
          'Consider audience segment differences',
          'The winning variation can become your control for future tests',
        ],
      },
      usage: {
        remaining: usageCheck.remaining === -1 ? 'unlimited' : (usageCheck.remaining! - 1),
        limit: user.daily_limit === -1 ? 'unlimited' : user.daily_limit,
      },
    });
  } catch (error) {
    console.error('A/B test error:', error);
    return res.status(500).json({
      error: 'Failed to generate A/B test variations',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

export default withAuth(handler);

/**
 * Generate multiple variations using different marketing angles
 */
async function generateVariations(params: {
  product: string;
  audience: string;
  tone: string;
  count: number;
}): Promise<Variation[]> {
  const { product, audience, tone, count } = params;

  // Different marketing angles for variations
  const angles = [
    'Problem-Solution: Focus on the pain point and how the product solves it',
    'Social Proof: Emphasize testimonials, reviews, and popularity',
    'Urgency & Scarcity: Create FOMO with limited time or availability',
    'Benefit-Focused: Highlight the main benefit and transformation',
    'Feature-Focused: Showcase unique features and capabilities',
  ];

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    // Fallback variations
    return Array.from({ length: count }, (_, i) => ({
      variation: i + 1,
      headline: `${product} - Version ${i + 1}`,
      body: `Discover how ${product} can help ${audience}. Try it today!`,
      imagePrompt: `${product} advertisement for ${audience}, ${tone} style, variation ${i + 1}`,
      angle: angles[i] || 'General',
    }));
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

  const variations: Variation[] = [];

  for (let i = 0; i < count; i++) {
    const angle = angles[i];
    const prompt = `You are an expert advertising copywriter creating A/B test variations.

Product: ${product}
Target Audience: ${audience}
Tone: ${tone}
Marketing Angle: ${angle}

Create compelling ad creative following this specific angle. Make it distinct from other variations.

Provide:
1. A catchy headline (max 60 characters) - must be unique and follow the angle
2. Persuasive body copy (2-3 sentences, max 150 words) - emphasize the angle
3. An image prompt for AI image generation (detailed description)

Format as JSON:
{
  "headline": "...",
  "body": "...",
  "imagePrompt": "..."
}`;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Parse JSON
      let creative;
      try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          creative = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('No JSON found');
        }
      } catch (parseError) {
        creative = {
          headline: `${product} - Variation ${i + 1}`,
          body: text.substring(0, 300),
          imagePrompt: `${product} advertisement for ${audience}, ${tone} style, ${angle}`,
        };
      }

      variations.push({
        variation: i + 1,
        headline: creative.headline,
        body: creative.body,
        imagePrompt: creative.imagePrompt,
        angle: angle.split(':')[0],
      });

      // Small delay between API calls to avoid rate limits
      if (i < count - 1) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    } catch (error) {
      console.error(`Variation ${i + 1} generation error:`, error);
      // Fallback for this variation
      variations.push({
        variation: i + 1,
        headline: `${product} for ${audience} - V${i + 1}`,
        body: `Experience ${product} designed specifically for ${audience}. ${angle.split(':')[1] || 'Try it today!'}`,
        imagePrompt: `${product} advertisement for ${audience}, ${tone} style, marketing angle: ${angle}`,
        angle: angle.split(':')[0],
      });
    }
  }

  return variations;
}
