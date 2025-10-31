import { Context } from '@netlify/functions';
import { z } from 'zod';

// Request validation schema
const ChatRequestSchema = z.object({
  prompt: z.string().min(1, 'Prompt is required').max(2000, 'Prompt must be 2000 characters or less'),
  model: z.enum(['openai/gpt-5', 'openai/gpt-4o'], {
    errorMap: () => ({ message: 'Model must be either openai/gpt-5 or openai/gpt-4o' })
  })
});

// Rate limiting store (in-memory, resets on function cold start)
interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();
const RATE_LIMIT_WINDOW = 10 * 60 * 1000; // 10 minutes
const RATE_LIMIT_MAX = 30;

function getRateLimitKey(headers: Headers): string {
  const forwarded = headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown';
  const cookie = headers.get('cookie') || '';
  const sessionMatch = cookie.match(/session_id=([^;]+)/);
  const sessionId = sessionMatch ? sessionMatch[1] : ip;
  return `ratelimit:${sessionId}`;
}

function checkRateLimit(key: string): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(key, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW
    });
    return { allowed: true, remaining: RATE_LIMIT_MAX - 1, resetIn: RATE_LIMIT_WINDOW };
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return {
      allowed: false,
      remaining: 0,
      resetIn: entry.resetAt - now
    };
  }

  entry.count += 1;
  return {
    allowed: true,
    remaining: RATE_LIMIT_MAX - entry.count,
    resetIn: entry.resetAt - now
  };
}

async function* generateStreamingResponse(prompt: string, model: string) {
  // Mock streaming - replace with actual AI API streaming
  const response = `[${model}] AI response to: "${prompt.substring(0, 50)}${prompt.length > 50 ? '...' : ''}"`;
  const words = response.split(' ');
  
  for (const word of words) {
    yield word + ' ';
    await new Promise(resolve => setTimeout(resolve, 50)); // Simulate streaming delay
  }
}

export default async function handler(req: Request, context: Context) {
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ ok: false, error: 'Method not allowed' }),
      { status: 405, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    // Rate limiting check
    const rateLimitKey = getRateLimitKey(req.headers);
    const rateLimit = checkRateLimit(rateLimitKey);

    if (!rateLimit.allowed) {
      return new Response(
        JSON.stringify({
          ok: false,
          error: `Rate limit exceeded. Try again in ${Math.ceil(rateLimit.resetIn / 1000)} seconds.`
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': RATE_LIMIT_MAX.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': Math.ceil(rateLimit.resetIn / 1000).toString()
          }
        }
      );
    }

    // Parse and validate request body
    const body = await req.json();
    const validation = ChatRequestSchema.safeParse(body);

    if (!validation.success) {
      const errors = validation.error.errors.map(e => e.message).join(', ');
      return new Response(
        JSON.stringify({ ok: false, error: errors }),
        { status: 422, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { prompt, model } = validation.data;

    // Check if streaming is requested
    const url = new URL(req.url);
    const isStreaming = url.searchParams.get('stream') === '1';

    if (isStreaming) {
      // Return streaming response
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of generateStreamingResponse(prompt, model)) {
              const data = `data: ${JSON.stringify({ chunk })}\n\n`;
              controller.enqueue(encoder.encode(data));
            }
            controller.enqueue(encoder.encode('data: [DONE]\n\n'));
            controller.close();
          } catch (error) {
            controller.error(error);
          }
        }
      });

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
          'X-RateLimit-Limit': RATE_LIMIT_MAX.toString(),
          'X-RateLimit-Remaining': rateLimit.remaining.toString(),
          'X-RateLimit-Reset': Math.ceil(rateLimit.resetIn / 1000).toString()
        }
      });
    }

    // Non-streaming response
    const mockResponse = `[${model}] AI response to: "${prompt.substring(0, 50)}${prompt.length > 50 ? '...' : ''}"`;

    return new Response(
      JSON.stringify({
        ok: true,
        answer: mockResponse
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'X-RateLimit-Limit': RATE_LIMIT_MAX.toString(),
          'X-RateLimit-Remaining': rateLimit.remaining.toString(),
          'X-RateLimit-Reset': Math.ceil(rateLimit.resetIn / 1000).toString()
        }
      }
    );

  } catch (error) {
    console.error('Chat API error:', error);
    
    if (error instanceof SyntaxError) {
      return new Response(
        JSON.stringify({ ok: false, error: 'Invalid JSON in request body' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ ok: false, error: 'An unexpected error occurred. Please try again.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export const config = {
  path: '/api/chat'
};
