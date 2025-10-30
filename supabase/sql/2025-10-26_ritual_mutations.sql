create table if not exists public.ritual_mutations (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  actor text not null,
  ritual text not null,
  status text not null,
  message text not null,
  payload jsonb,
  response jsonb,
  metadata jsonb
);

alter table public.ritual_mutations enable row level security;

create index if not exists ritual_mutations_created_idx on public.ritual_mutations (created_at desc);
create index if not exists ritual_mutations_ritual_idx on public.ritual_mutations (ritual);
