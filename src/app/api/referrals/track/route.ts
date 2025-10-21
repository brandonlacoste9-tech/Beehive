import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { assertServerEnv } from '@/lib/envGuard';

export const runtime = 'nodejs';

function hasSupabaseEnv() {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export async function POST(req: NextRequest) {
  if (!hasSupabaseEnv()) {
    return NextResponse.json({ ok: false, error: 'supabase env missing' }, { status: 503 });
  }
  assertServerEnv();
  const supabase = getSupabaseAdmin();
  const body = await req.json().catch(() => null);
  const source_id = body?.source_id;
  const target_id = body?.target_id;
  const context = body?.context ?? {};

  if (!source_id || !target_id) {
    return NextResponse.json(
      { ok: false, error: 'source_id and target_id required' },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from('referrals')
    .insert([{ source_id, target_id, context }])
    .select()
    .single();

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, referral: data });
}
