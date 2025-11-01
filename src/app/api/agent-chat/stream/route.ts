import { NextRequest } from 'next/server';
import { buildSandboxAgentPayload } from '@/lib/sandboxAgent';

export const runtime = 'nodejs';

const encoder = new TextEncoder();

function toEvent(data: unknown) {
  return encoder.encode(`data: ${JSON.stringify(data)}\n\n`);
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const message = typeof body?.message === 'string' ? body.message : '';
  const windowMin = Number(body?.windowMin ?? 180) || 180;

  const payload = buildSandboxAgentPayload({ message, windowMin });
  const mood = payload.summary.avg;

  const stream = new ReadableStream({
    async start(controller) {
      controller.enqueue(
        toEvent({ type: 'meta', sentiment: payload.summary, mode: 'sandbox', mood })
      );

      const sentences = payload.reply.split(/(?<=[.!?])\s+/).filter(Boolean);
      for (const sentence of sentences) {
        controller.enqueue(toEvent({ type: 'delta', text: sentence + ' ' }));
        await new Promise((resolve) => setTimeout(resolve, 40));
      }

      controller.enqueue(toEvent({ type: 'done' }));
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}
