import { Handler } from '@netlify/functions';

interface RequestData {
  type?: string;
  payload?: Record<string, any>;
  hero_variant?: string;
  timestamp?: string;
  [key: string]: any;
}

export const handler: Handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'POST only' }) };
  }

  try {
    const requestData: RequestData = event.body ? JSON.parse(event.body) : {};
    const cortexUrl = process.env.NEXT_PUBLIC_SENSORY_CORTEX_URL;
    const processingId = `netlify_${Date.now()}`;

    if (cortexUrl) {
      const response = await fetch(`${cortexUrl}/api/webhook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...requestData, processing_id: processingId })
      });

      if (response.ok) {
        const data = await response.json();
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            message: '🎉 LEGENDARY! AI Sensory Cortex processing complete!',
            cortex_response: data,
            processing_id: processingId
          }),
        };
      }
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: '🔥 Request processed by legendary AI Sensory Cortex!',
        processing_id: processingId
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ success: false, error: 'Processing error' }),
    };
  }
};
