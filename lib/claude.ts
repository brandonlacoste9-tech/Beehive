/**
 * Claude API Integration
 * Streaming integration with Anthropic's Claude API for ad generation
 */

import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface GenerationRequest {
  productName: string;
  productDescription: string;
  targetAudience: string;
  personaSystemPrompt: string;
  adType: string;
  toneGuidance: string;
  variationCount: number;
  additionalContext?: string;
}

export interface GenerationResult {
  ads: string[];
  tokensUsed: number;
  stopReason: string;
  modelUsed: string;
  generatedAt: Date;
}

/**
 * Calculate estimated tokens for a string (rough estimate)
 * Claude uses about 1 token per 3-4 characters on average
 */
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 3.5);
}

/**
 * Generate ad copy using Claude API
 * Supports streaming for real-time feedback
 */
export async function generateAdCopy(
  request: GenerationRequest,
  onChunk?: (chunk: string) => void
): Promise<GenerationResult> {
  const systemPrompt = `${request.personaSystemPrompt}

You are an expert copywriter specializing in high-converting advertisements.

Ad Type Guidelines: ${request.adType}
Tone Guidance: ${request.toneGuidance}

Generate exactly ${request.variationCount} distinct ad variations. Each variation should:
1. Be unique in approach and angle
2. Focus on different benefits or pain points
3. Use different language and phrasing
4. Be ready to use immediately

Format your response as a numbered list (1., 2., 3., etc.) with clear separation between ads.`;

  const userPrompt = `Create ${request.variationCount} ad variations for:

Product: ${request.productName}
Description: ${request.productDescription}
Target Audience: ${request.targetAudience}
${request.additionalContext ? `Additional Context: ${request.additionalContext}` : ''}

Generate compelling, ready-to-use ad variations.`;

  const fullPrompt = systemPrompt + '\n\n' + userPrompt;

  try {
    let fullResponse = '';
    let tokensUsed = 0;

    // Use streaming for real-time feedback
    const stream = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1500,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: userPrompt,
        },
      ],
      stream: true,
    });

    // Process stream chunks
    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
        const chunk = event.delta.text;
        fullResponse += chunk;

        // Call callback for real-time feedback
        if (onChunk) {
          onChunk(chunk);
        }
      } else if (event.type === 'message_delta' && event.usage) {
        tokensUsed = event.usage.output_tokens;
      }
    }

    // Parse ads from response
    const ads = parseAdVariations(fullResponse, request.variationCount);

    return {
      ads,
      tokensUsed: estimateTokens(systemPrompt) + estimateTokens(userPrompt) + tokensUsed,
      stopReason: 'complete',
      modelUsed: 'claude-3-5-sonnet-20241022',
      generatedAt: new Date(),
    };
  } catch (error) {
    if (error instanceof Anthropic.APIError) {
      throw new Error(`Claude API Error: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Parse ad variations from Claude's response
 */
function parseAdVariations(response: string, expectedCount: number): string[] {
  const ads: string[] = [];

  // Split by numbered items (1. 2. 3. etc)
  const lines = response.split('\n');
  let currentAd = '';
  let adNumber = 1;

  for (const line of lines) {
    const trimmedLine = line.trim();

    // Check if this line starts a new numbered ad
    const numberMatch = trimmedLine.match(/^(\d+)\.\s+(.+)/);

    if (numberMatch) {
      // Save previous ad if it exists
      if (currentAd.trim()) {
        ads.push(currentAd.trim());
      }

      // Start new ad
      currentAd = numberMatch[2];
      adNumber++;
    } else if (trimmedLine && adNumber <= expectedCount) {
      // Continue building current ad
      currentAd += '\n' + trimmedLine;
    }
  }

  // Don't forget the last ad
  if (currentAd.trim()) {
    ads.push(currentAd.trim());
  }

  // If we didn't find enough numbered ads, split by double newlines as fallback
  if (ads.length < expectedCount) {
    const fallbackAds = response
      .split('\n\n')
      .map(ad => ad.trim())
      .filter(ad => ad.length > 10)
      .slice(0, expectedCount);

    return fallbackAds.length > 0 ? fallbackAds : [response.trim()];
  }

  return ads.slice(0, expectedCount);
}

/**
 * Generate a single ad with specific constraints
 * Useful for tight constraints like social media character limits
 */
export async function generateConstrainedAd(
  request: GenerationRequest & { maxCharacters?: number; maxLines?: number }
): Promise<string> {
  const constraints = [];
  if (request.maxCharacters) {
    constraints.push(`Must be under ${request.maxCharacters} characters`);
  }
  if (request.maxLines) {
    constraints.push(`Must be ${request.maxLines} lines or fewer`);
  }

  const systemPrompt = `${request.personaSystemPrompt}

You are an expert copywriter specializing in high-converting advertisements.
${constraints.length > 0 ? `Constraints: ${constraints.join(', ')}` : ''}`;

  const userPrompt = `Create a single compelling ad for:

Product: ${request.productName}
Description: ${request.productDescription}
Target Audience: ${request.targetAudience}

${request.additionalContext ? `Additional Context: ${request.additionalContext}` : ''}

Tone: ${request.toneGuidance}
Ad Type: ${request.adType}

Generate the ad copy directly without any preamble or explanation.`;

  try {
    const message = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 500,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: userPrompt,
        },
      ],
    });

    const content = message.content[0];
    if (content.type === 'text') {
      return content.text.trim();
    }

    throw new Error('Unexpected response format from Claude');
  } catch (error) {
    if (error instanceof Anthropic.APIError) {
      throw new Error(`Claude API Error: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Evaluate generated ad quality
 * Returns a score and recommendations
 */
export async function evaluateAd(
  adCopy: string,
  targetAudience: string,
  productName: string
): Promise<{
  score: number;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
}> {
  const systemPrompt = `You are an expert in advertising and copywriting. Evaluate ads based on:
- Clarity and directness
- Emotional appeal
- Call-to-action strength
- Audience relevance
- Differentiation
- Persuasiveness

Provide a score from 1-100 and specific feedback.`;

  const userPrompt = `Evaluate this ad:

Ad Copy: "${adCopy}"
Product: ${productName}
Target Audience: ${targetAudience}

Provide:
1. Overall score (1-100)
2. Top 3 strengths
3. Top 3 weaknesses
4. 3 specific recommendations for improvement

Format as JSON.`;

  try {
    const message = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 800,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: userPrompt,
        },
      ],
    });

    const content = message.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response format');
    }

    // Extract JSON from response
    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not parse evaluation response');
    }

    const evaluation = JSON.parse(jsonMatch[0]);

    return {
      score: evaluation.score || 0,
      strengths: evaluation.strengths || [],
      weaknesses: evaluation.weaknesses || [],
      recommendations: evaluation.recommendations || [],
    };
  } catch (error) {
    if (error instanceof Anthropic.APIError) {
      throw new Error(`Claude API Error: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Generate variations of an existing ad
 * Useful for creating alternatives once a good ad is identified
 */
export async function generateVariations(
  originalAd: string,
  variationType: 'tone' | 'length' | 'approach' | 'audience',
  personaSystemPrompt: string,
  variationCount: number = 3
): Promise<string[]> {
  const variationGuide = {
    tone: 'Create versions with different emotional tones (serious, playful, urgent, etc)',
    length: 'Create versions in different lengths (short and punchy, medium, longer and detailed)',
    approach: 'Create versions using different angles (emotional, logical, curiosity-driven, etc)',
    audience: 'Create versions tailored for different audience segments',
  };

  const systemPrompt = `${personaSystemPrompt}

You are an expert copywriter. Your task is to create variations of an ad.
${variationGuide[variationType]}

Generate exactly ${variationCount} variations that maintain the core message but differ in the specified way.`;

  const userPrompt = `Original ad: "${originalAd}"

Create ${variationCount} variations using different ${variationType}.
Format as a numbered list (1., 2., 3., etc).`;

  try {
    let fullResponse = '';

    const stream = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1000,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: userPrompt,
        },
      ],
      stream: true,
    });

    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
        fullResponse += event.delta.text;
      }
    }

    return parseAdVariations(fullResponse, variationCount);
  } catch (error) {
    if (error instanceof Anthropic.APIError) {
      throw new Error(`Claude API Error: ${error.message}`);
    }
    throw error;
  }
}
