create table if not exists public.referrals (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  source_id uuid null,
  target_id uuid null,
  context jsonb
);

alter table public.referrals enable row level security;

create index if not exists referrals_created_idx on public.referrals(created_at desc);
create index if not exists referrals_source_idx on public.referrals(source_id);
create index if not exists referrals_target_idx on public.referrals(target_id);
