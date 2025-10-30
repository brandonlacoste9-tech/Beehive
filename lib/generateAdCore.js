function sanitizeResult(value) {
  const clamp = (s, n) => (s.length > n ? s.slice(0, n) : s);
  const headline = clamp(String(value?.headline ?? 'Generated Headline').trim(), 80);
  const body = clamp(String(value?.body ?? 'Generated Body').trim(), 400);
  const imagePrompt = clamp(String(value?.imagePrompt ?? '').trim(), 180);
  return { headline, body, imagePrompt };
}

function buildSystemPrompt() {
  return [
    'You are AdGenXAI. Generate strictly a JSON object with keys:',
    '"headline" (string, <= 80 chars),',
    '"body" (string, <= 400 chars),',
    '"imagePrompt" (string, <= 180 chars, concise scene description).',
    'Rules: no markdown, no code fences, no extra keys, no commentary. Return only the JSON object.',
  ].join(' ');
}

async function generateAdFromPrompt({ prompt, apiKey }) {
  if (!prompt || typeof prompt !== 'string') {
    throw new Error('Missing prompt');
  }
  if (!apiKey) {
    throw new Error('Missing OPENAI_API_KEY');
  }

  const system = buildSystemPrompt();

  const r = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: prompt },
      ],
      max_tokens: 300,
      temperature: 0.2,
      response_format: { type: 'json_object' },
    }),
  });

  if (!r.ok) {
    const detail = await r.text();
    const err = new Error('OpenAI request failed');
    err.status = r.status;
    err.detail = detail;
    throw err;
  }

  const j = await r.json();
  const content = j?.choices?.[0]?.message?.content || '';

  let parsed;
  try {
    parsed = JSON.parse(content);
  } catch (_) {
    const start = content.indexOf('{');
    const end = content.lastIndexOf('}');
    if (start !== -1 && end !== -1 && end > start) {
      try {
        parsed = JSON.parse(content.slice(start, end + 1));
      } catch (_) {
        parsed = undefined;
      }
    } else {
      parsed = undefined;
    }
  }

  let result;
  if (parsed && parsed.headline && parsed.body && typeof parsed.imagePrompt === 'string') {
    result = {
      headline: String(parsed.headline),
      body: String(parsed.body),
      imagePrompt: String(parsed.imagePrompt),
    };
  } else {
    const [firstLine, ...rest] = content.split('\n');
    result = {
      headline: (firstLine || 'Generated Headline').trim(),
      body: (rest.join('\n') || content || 'Generated Body').trim(),
      imagePrompt: '',
    };
  }

  return sanitizeResult(result);
}

module.exports = {
  generateAdFromPrompt,
  sanitizeResult,
  buildSystemPrompt,
};

