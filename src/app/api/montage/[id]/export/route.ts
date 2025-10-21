import { NextRequest, NextResponse } from 'next/server';
import { assertServerEnv } from '@/lib/envGuard';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export const runtime = 'nodejs';

type MontageRecord = {
  id: string;
  created_at: string | null;
  ritual?: string | null;
  topic?: string | null;
  audience?: string | null;
  sentiment?: Record<string, any> | null;
  result?: string | null;
};

function buildMarkdown(montage: MontageRecord) {
  const created = montage.created_at ? new Date(montage.created_at) : null;
  const sentimentBlock = JSON.stringify(montage.sentiment ?? {}, null, 2);
  const lines = [
    `# Montage — ${montage.topic || 'Untitled Ritual'}`,
    '',
    `- **Audience:** ${montage.audience || 'Unknown'}`,
    `- **Ritual:** ${montage.ritual || 'Unspecified'}`,
    `- **Created:** ${created ? created.toISOString() : 'Unknown'}`,
    '',
    '## Sentiment Snapshot',
    '```json',
    sentimentBlock,
    '```',
    '',
    '## Beat Sheet',
    montage.result?.trim() || '_No beat sheet recorded._',
    '',
    `---`,
    `_Artifact ID: ${montage.id}_`,
  ];

  return lines.join('\n');
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  assertServerEnv();

  const formatParam = req.nextUrl.searchParams.get('format')?.toLowerCase();
  const format = formatParam === 'markdown' ? 'md' : formatParam ?? 'md';

  if (format !== 'md' && format !== 'json') {
    return NextResponse.json(
      { ok: false, error: 'Unsupported format. Use ?format=md or ?format=json.' },
      { status: 400 }
    );
  }

  const { data, error } = await supabaseAdmin
    .from('montages')
    .select('*')
    .eq('id', params.id)
    .single<MontageRecord>();

  if (error || !data) {
    return NextResponse.json({ ok: false, error: 'Montage not found.' }, { status: 404 });
  }

  if (format === 'json') {
    return NextResponse.json({ ok: true, montage: data });
  }

  const markdown = buildMarkdown(data);
  const filename = `montage-${data.id}.md`;

  return new Response(markdown, {
    status: 200,
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
