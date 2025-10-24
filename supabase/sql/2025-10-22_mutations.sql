-- codex_mutations: immutable event log
create table if not exists public.codex_mutations (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  actor text not null,
  ritual text not null,
  target text,
  status text not null,
  message text,
  payload jsonb,
  response jsonb
);

create index if not exists idx_codex_mutations_created_at on public.codex_mutations (created_at desc);
create index if not exists idx_codex_mutations_ritual on public.codex_mutations (ritual);
create index if not exists idx_codex_mutations_status on public.codex_mutations (status);
