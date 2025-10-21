#!/usr/bin/env node
import { Buffer } from 'node:buffer';
import { readFileSync } from 'node:fs';
import process, { stdin as input, stdout as output } from 'node:process';

const HELP = `Usage: npx tsx scripts/gpt5_exec.ts [options]\n\n` +
  `Options:\n` +
  `  --prompt <text>   Prompt text to send.\n` +
  `  --file <path>     Read prompt from a file.\n` +
  `  --stdin           Read prompt from standard input.\n` +
  `  --system <text>   Optional system directive for the model.\n` +
  `  --json            Output raw JSON response instead of text.\n` +
  `  -h, --help        Show this help message.\n`;

function parseArgs() {
  const args = process.argv.slice(2);
  const flags = {
    prompt: '',
    file: '',
    stdin: false,
    system: '',
    json: false,
    help: false,
  };

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    switch (arg) {
      case '--prompt':
        flags.prompt = args[++i] ?? '';
        break;
      case '--file':
        flags.file = args[++i] ?? '';
        break;
      case '--stdin':
        flags.stdin = true;
        break;
      case '--system':
        flags.system = args[++i] ?? '';
        break;
      case '--json':
        flags.json = true;
        break;
      case '-h':
      case '--help':
        flags.help = true;
        break;
      default:
        if (!flags.prompt) {
          flags.prompt = arg;
        } else {
          flags.prompt += ` ${arg}`;
        }
        break;
    }
  }

  return flags;
}

async function readFromStdin(): Promise<string> {
  const chunks: Buffer[] = [];
  return new Promise((resolve, reject) => {
    input.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
    input.on('error', reject);
    input.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    input.resume();
  });
}

function extractText(payload: any): string {
  if (!payload) return '';
  if (typeof payload.output_text === 'string' && payload.output_text.trim()) {
    return payload.output_text.trim();
  }
  if (Array.isArray(payload.output)) {
    const segments: string[] = [];
    for (const item of payload.output) {
      if (Array.isArray(item.content)) {
        for (const part of item.content) {
          if (part && part.type === 'text' && typeof part.text === 'string') {
            segments.push(part.text);
          }
        }
      }
    }
    return segments.join('\n').trim();
  }
  if (
    payload.data &&
    Array.isArray(payload.data) &&
    typeof payload.data[0]?.text === 'string'
  ) {
    return payload.data[0].text.trim();
  }
  if (typeof payload.text === 'string') {
    return payload.text.trim();
  }
  return '';
}

async function main() {
  const flags = parseArgs();

  if (flags.help) {
    output.write(`${HELP}\n`);
    return;
  }

  const key = process.env.OPENAI_API_KEY || process.env.OPENAI_KEY;
  if (!key) {
    console.error('Missing OPENAI_API_KEY environment variable.');
    process.exitCode = 1;
    return;
  }

  let prompt = flags.prompt;
  if (flags.file) {
    prompt = readFileSync(flags.file, 'utf8');
  }
  if (!prompt && flags.stdin) {
    prompt = await readFromStdin();
  }

  if (!prompt.trim()) {
    console.error('No prompt provided. Use --prompt, --file, or --stdin.');
    process.exitCode = 1;
    return;
  }

  const baseUrl = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1';

  const body: Record<string, any> = {
    model: process.env.OPENAI_MODEL || 'gpt-5-pro',
    input: [
      {
        role: 'user',
        content: prompt.trim(),
      },
    ],
  };

  if (flags.system) {
    body.input.unshift({ role: 'system', content: flags.system.trim() });
  }

  const response = await fetch(`${baseUrl.replace(/\/$/, '')}/responses`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify(body),
  });

  const payload = await response.json();

  if (!response.ok) {
    console.error('Codex request failed:', JSON.stringify(payload, null, 2));
    process.exitCode = 1;
    return;
  }

  const text = extractText(payload);
  const metadata = {
    jobId: payload.id ?? null,
    model: payload.model ?? body.model,
    status: payload.status ?? 'unknown',
    sizeBytes: Buffer.byteLength(text, 'utf8'),
  };

  console.error(`[codex::meta] ${JSON.stringify(metadata)}`);

  if (flags.json) {
    output.write(`${JSON.stringify({ metadata, payload }, null, 2)}\n`);
    return;
  }

  output.write(`${text}\n`);
}

main().catch((error) => {
  console.error('Unexpected failure invoking Codex:', error);
  process.exitCode = 1;
});
