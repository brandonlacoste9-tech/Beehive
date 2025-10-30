import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { withAuth, checkUsageLimit, incrementUsage, recordGeneration, AuthenticatedRequest } from '../../src/lib/auth';
import type { NextApiResponse } from 'next';

/**
 * Authenticated Ad Generation API
 *
 * Requires authentication and tracks usage limits
 *
 * POST /api/generate-ad-auth
 * Headers: { Authorization: Bearer <token> }
 * Body: { product, audience, tone, model }
 */

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const user = req.user!; // Guaranteed by withAuth
    const { product, audience, tone = 'professional', model = 'gemini' } = req.body;

    // Validation
    if (!product || !audience) {
      return res.status(400).json({
        error: 'Missing required fields',
        details: 'product and audience are required',
      });
    }

    // Check usage limit
    const usageCheck = await checkUsageLimit(user.id);
    if (!usageCheck.allowed) {
      return res.status(429).json({
        error: 'Usage limit exceeded',
        message: usageCheck.reason,
        remaining: 0,
        plan: user.plan,
        upgrade_url: '/pricing',
      });
    }

    // Generate ad creative
    const adCreative = await generateWithModel(model, {
      product,
      audience,
      tone,
    });

    // Increment usage counter
    await incrementUsage(user.id);

    // Record generation in history
    await recordGeneration({
      userId: user.id,
      product,
      audience,
      tone,
      headline: adCreative.headline,
      body: adCreative.body,
      imagePrompt: adCreative.imagePrompt,
      model,
    });

    return res.status(200).json({
      success: true,
      data: adCreative,
      usage: {
        remaining: usageCheck.remaining === -1 ? 'unlimited' : (usageCheck.remaining! - 1),
        limit: user.daily_limit === -1 ? 'unlimited' : user.daily_limit,
      },
    });
  } catch (error) {
    console.error('Authenticated ad generation error:', error);
    return res.status(500).json({
      error: 'Failed to generate ad creative',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

export default withAuth(handler);

/**
 * Generate ad creative using specified AI model
 */
async function generateWithModel(
  model: string,
  params: { product: string; audience: string; tone: string }
): Promise<{ headline: string; body: string; imagePrompt: string }> {
  const { product, audience, tone } = params;

  switch (model) {
    case 'gemini':
    case 'gemini-1.5-pro':
      return generateWithGemini(product, audience, tone);

    case 'gemini-flash':
      return generateWithGemini(product, audience, tone, 'gemini-1.5-flash');

    case 'gpt-4':
    case 'gpt-4-turbo':
      return generateWithGPT4(product, audience, tone);

    case 'claude':
    case 'claude-3-5-sonnet':
      return generateWithClaude(product, audience, tone);

    default:
      return generateWithGemini(product, audience, tone);
  }
}

/**
 * Generate with Gemini
 */
async function generateWithGemini(
  product: string,
  audience: string,
  tone: string,
  modelName: string = 'gemini-1.5-pro'
): Promise<{ headline: string; body: string; imagePrompt: string }> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    // Fallback to sample data
    return {
      headline: `Transform Your Experience with ${product}`,
      body: `Discover how ${product} can revolutionize the way ${audience} approach their daily challenges. Built with cutting-edge technology and designed for real results.`,
      imagePrompt: `Professional advertising image for ${product}, targeting ${audience}, ${tone} style, high quality, modern aesthetic`,
    };
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: modelName });

  const prompt = `You are an expert advertising copywriter. Generate compelling ad creative for the following:

Product: ${product}
Target Audience: ${audience}
Tone: ${tone}

Please provide:
1. A catchy headline (max 60 characters)
2. Persuasive body copy (2-3 sentences, max 150 words)
3. An image prompt for AI image generation (detailed description)

Format your response as JSON:
{
  "headline": "...",
  "body": "...",
  "imagePrompt": "..."
}`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();

  // Parse JSON from response
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (parseError) {
    // Fallback parsing
  }

  return {
    headline: text.split('\n')[0].substring(0, 60),
    body: text.substring(0, 300),
    imagePrompt: `${product} advertisement for ${audience}, ${tone} style`,
  };
}

/**
 * Generate with GPT-4
 */
async function generateWithGPT4(
  product: string,
  audience: string,
  tone: string
): Promise<{ headline: string; body: string; imagePrompt: string }> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    // Fallback to sample data
    return {
      headline: `Unlock the Power of ${product}`,
      body: `Join thousands of ${audience} who have already transformed their workflow with ${product}. Experience the difference today.`,
      imagePrompt: `High-quality professional advertising photo for ${product}, targeting ${audience}, ${tone} aesthetic, photorealistic`,
    };
  }

  const openai = new OpenAI({ apiKey });

  const prompt = `You are an expert advertising copywriter. Generate compelling ad creative for the following:

Product: ${product}
Target Audience: ${audience}
Tone: ${tone}

Please provide:
1. A catchy headline (max 60 characters)
2. Persuasive body copy (2-3 sentences, max 150 words)
3. An image prompt for AI image generation (detailed description)

Format your response as JSON:
{
  "headline": "...",
  "body": "...",
  "imagePrompt": "..."
}`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      {
        role: 'system',
        content: 'You are an expert advertising copywriter specializing in high-converting ad copy.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    temperature: 0.8,
    response_format: { type: 'json_object' },
  });

  const text = response.choices[0].message.content || '';

  try {
    const parsed = JSON.parse(text);
    return {
      headline: parsed.headline || '',
      body: parsed.body || '',
      imagePrompt: parsed.imagePrompt || '',
    };
  } catch (parseError) {
    // Fallback parsing
    return {
      headline: text.split('\n')[0].substring(0, 60),
      body: text.substring(0, 300),
      imagePrompt: `${product} advertisement for ${audience}, ${tone} style`,
    };
  }
}

/**
 * Generate with Claude
 */
async function generateWithClaude(
  product: string,
  audience: string,
  tone: string
): Promise<{ headline: string; body: string; imagePrompt: string }> {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    // Fallback to sample data
    return {
      headline: `${product}: Built for ${audience}`,
      body: `Experience the next generation of innovation with ${product}. Designed specifically for ${audience} who demand excellence and results.`,
      imagePrompt: `Premium advertising visual for ${product}, targeting ${audience}, ${tone} mood, award-winning photography`,
    };
  }

  const anthropic = new Anthropic({ apiKey });

  const prompt = `You are an expert advertising copywriter. Generate compelling ad creative for the following:

Product: ${product}
Target Audience: ${audience}
Tone: ${tone}

Please provide:
1. A catchy headline (max 60 characters)
2. Persuasive body copy (2-3 sentences, max 150 words)
3. An image prompt for AI image generation (detailed description)

Format your response as JSON:
{
  "headline": "...",
  "body": "...",
  "imagePrompt": "..."
}`;

  const response = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  });

  const text = response.content[0].type === 'text' ? response.content[0].text : '';

  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        headline: parsed.headline || '',
        body: parsed.body || '',
        imagePrompt: parsed.imagePrompt || '',
      };
    }
  } catch (parseError) {
    // Fallback parsing
  }

  return {
    headline: text.split('\n')[0].substring(0, 60),
    body: text.substring(0, 300),
    imagePrompt: `${product} advertisement for ${audience}, ${tone} style`,
  };
}
