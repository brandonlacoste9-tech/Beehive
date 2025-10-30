// Offline test harness for core generator
// - Mocks fetch to avoid network
// - Verifies JSON shaping, clamping, and response contract

const { generateAdFromPrompt } = require('../lib/generateAdCore.js');

function assert(cond, msg) {
  if (!cond) throw new Error(`Assertion failed: ${msg}`);
}

async function testNormal() {
  const mockResponse = {
    choices: [
      {
        message: {
          content: JSON.stringify({
            headline: 'Stay Cool, Stay Hot',
            body: 'Keeps drinks hot for 12 hours, cold for 24.',
            imagePrompt: 'Modern bottle on marble counter with steam and ice',
          }),
        },
      },
    ],
  };

  global.fetch = async () => ({
    ok: true,
    status: 200,
    json: async () => mockResponse,
    text: async () => JSON.stringify(mockResponse),
  });

  const out = await generateAdFromPrompt({ prompt: 'A steel water bottle', apiKey: 'test-key' });
  assert(typeof out.headline === 'string', 'headline is string');
  assert(typeof out.body === 'string', 'body is string');
  assert(typeof out.imagePrompt === 'string', 'imagePrompt is string');
  assert(out.headline.length <= 80, 'headline length');
  assert(out.body.length <= 400, 'body length');
  assert(out.imagePrompt.length <= 180, 'imagePrompt length');
  return out;
}

async function testClamping() {
  const long = 'x'.repeat(1000);
  const mockResponse = {
    choices: [
      {
        message: {
          content: JSON.stringify({ headline: long, body: long, imagePrompt: long }),
        },
      },
    ],
  };

  global.fetch = async () => ({
    ok: true,
    status: 200,
    json: async () => mockResponse,
    text: async () => JSON.stringify(mockResponse),
  });

  const out = await generateAdFromPrompt({ prompt: 'Clamp test', apiKey: 'test-key' });
  assert(out.headline.length === 80, 'headline clamped to 80');
  assert(out.body.length === 400, 'body clamped to 400');
  assert(out.imagePrompt.length === 180, 'imagePrompt clamped to 180');
  return out;
}

async function run() {
  const normal = await testNormal();
  const clamped = await testClamping();

  // Non-JSON plaintext fallback case
  const plainTextContent = [
    'Where Ideas Meet the Skyline',
    'Join top founders for cocktails and connections.',
  ].join('\n');
  global.fetch = async () => ({
    ok: true,
    status: 200,
    json: async () => ({ choices: [{ message: { content: plainTextContent } }] }),
    text: async () => plainTextContent,
  });
  const fallback = await generateAdFromPrompt({ prompt: 'Plain text test', apiKey: 'test-key' });
  assert(typeof fallback.headline === 'string' && fallback.headline.length > 0, 'fallback headline');
  assert(typeof fallback.body === 'string' && fallback.body.length > 0, 'fallback body');

  console.log(JSON.stringify({ status: 'ok', normal, clamped, fallback }, null, 2));
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
