import { NextResponse } from 'next/server';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

export const runtime = 'nodejs';

export function GET() {
  const filePath = join(process.cwd(), 'openapi', 'codex.openapi.json');
  const raw = readFileSync(filePath, 'utf8');
  return new NextResponse(raw, {
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'public, max-age=60',
    },
  });
}
