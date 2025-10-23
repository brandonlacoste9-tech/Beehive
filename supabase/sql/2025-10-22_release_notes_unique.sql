delete from public.release_notes rn
using public.release_notes newer
where rn.repo = newer.repo
  and rn.pr_number = newer.pr_number
  and rn.created_at < newer.created_at;

alter table if exists public.release_notes
  add constraint release_notes_repo_pr_unique unique (repo, pr_number);

create index if not exists release_notes_created_at_idx on public.release_notes (created_at desc);
