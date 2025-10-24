create table if not exists public.release_notes (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  job_id text not null,
  repo text not null,
  pr_number integer not null,
  title text not null,
  summary text,
  labels text[],
  merged_at timestamptz,
  pr_url text,
  author text,
  merge_commit_sha text,
  changelog_entry text not null,
  changelog_commit_sha text,
  status text not null default 'pending',
  metadata jsonb default '{}'::jsonb
);

create index if not exists release_notes_repo_idx on public.release_notes (repo);
create index if not exists release_notes_pr_idx on public.release_notes (repo, pr_number);
create index if not exists release_notes_job_idx on public.release_notes (job_id);
