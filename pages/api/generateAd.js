import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * AdGenXAI - AI-Powered Ad Creative Generator
 *
 * Generates advertising creative content including:
 * - Headline (attention-grabbing)
 * - Body copy (persuasive description)
 * - Image prompt (for AI image generation)
 *
 * POST /api/generateAd
 * Body: { product, audience, tone }
 */

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { product, audience, tone = 'professional' } = req.body;

    // Validation
    if (!product || !audience) {
      return res.status(400).json({
        error: 'Missing required fields',
        details: 'product and audience are required',
      });
    }

    // Check if Gemini API key is available
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      // Return sample response for development/build
      console.warn('GEMINI_API_KEY not set, returning sample data');
      return res.status(200).json({
        success: true,
        data: {
          headline: `Transform Your Experience with ${product}`,
          body: `Discover how ${product} can revolutionize the way ${audience} approach their daily challenges. Built with cutting-edge technology and designed for real results.`,
          imagePrompt: `Professional advertising image for ${product}, targeting ${audience}, ${tone} style, high quality, modern aesthetic`,
        },
        source: 'sample',
      });
    }

    // Initialize Gemini AI
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

    // Craft the prompt
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

    // Generate content
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse JSON from response
    let adCreative;
    try {
      // Extract JSON from response (handle markdown code blocks)
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        adCreative = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      // Fallback: parse text manually
      adCreative = {
        headline: text.split('\n')[0].substring(0, 60),
        body: text.substring(0, 300),
        imagePrompt: `${product} advertisement for ${audience}, ${tone} style`,
      };
    }

    return res.status(200).json({
      success: true,
      data: adCreative,
      source: 'gemini',
    });

  } catch (error) {
    console.error('Ad generation error:', error);

    return res.status(500).json({
      error: 'Failed to generate ad creative',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
}
