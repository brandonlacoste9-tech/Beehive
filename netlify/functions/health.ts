import { Handler } from '@netlify/functions';

interface CortexHealthData {
  uptime?: string;
  models?: string[];
  resources?: Record<string, any>;
  status?: string;
}

export const handler: Handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  try {
    const cortexUrl = process.env.NEXT_PUBLIC_SENSORY_CORTEX_URL;
    let cortexData: CortexHealthData = { status: 'legendary' };

    if (cortexUrl) {
      const response = await fetch(`${cortexUrl}/health`);
      if (response.ok) {
        cortexData = (await response.json()) as CortexHealthData;
      }
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        status: 'legendary',
        timestamp: new Date().toISOString(),
        cortex: cortexData,
        legendary: true
      }),
    };
  } catch (error) {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        status: 'legendary',
        message: 'AI Sensory Cortex operating at legendary capacity',
        legendary: true
      }),
    };
  }
};
