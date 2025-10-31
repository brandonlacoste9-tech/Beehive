import { Context } from '@netlify/functions';

interface UsageRecord {
  count: number;
  timestamps: number[];
}

const usageStore = new Map<string, UsageRecord>();

function getSessionId(headers: Headers): string {
  const cookie = headers.get('cookie') || '';
  const sessionMatch = cookie.match(/session_id=([^;]+)/);
  
  if (sessionMatch) {
    return sessionMatch[1];
  }
  
  // Generate new session ID
  return crypto.randomUUID();
}

function cleanOldTimestamps(timestamps: number[], cutoff: number): number[] {
  return timestamps.filter(t => t > cutoff);
}

export default async function handler(req: Request, context: Context) {
  const sessionId = getSessionId(req.headers);
  const now = Date.now();
  const oneDayAgo = now - 24 * 60 * 60 * 1000;
  const oneHourAgo = now - 60 * 60 * 1000;

  if (req.method === 'GET') {
    try {
      let record = usageStore.get(sessionId);
      
      if (!record) {
        record = { count: 0, timestamps: [] };
        usageStore.set(sessionId, record);
      }

      record.timestamps = cleanOldTimestamps(record.timestamps, oneDayAgo);

      const todayCount = record.timestamps.filter(t => t > oneDayAgo).length;
      const lastHourCount = record.timestamps.filter(t => t > oneHourAgo).length;

      const response = new Response(
        JSON.stringify({
          total: record.count,
          today: todayCount,
          lastHour: lastHourCount
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }
      );

      // Set session cookie if new
      if (!req.headers.get('cookie')?.includes('session_id=')) {
        response.headers.set('Set-Cookie', 
          `session_id=${sessionId}; HttpOnly; Secure; SameSite=Lax; Max-Age=${60 * 60 * 24 * 30}; Path=/`
        );
      }

      return response;

    } catch (error) {
      console.error('Usage GET error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch usage stats' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }

  if (req.method === 'POST') {
    try {
      let record = usageStore.get(sessionId);
      
      if (!record) {
        record = { count: 0, timestamps: [] };
      }

      record.count += 1;
      record.timestamps.push(now);
      
      usageStore.set(sessionId, record);

      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );

    } catch (error) {
      console.error('Usage POST error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to track usage' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }

  return new Response(
    JSON.stringify({ error: 'Method not allowed' }),
    { status: 405, headers: { 'Content-Type': 'application/json' } }
  );
}

export const config = {
  path: '/api/usage'
};
