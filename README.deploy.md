# 🚀 BeeHive Deployment Rites

This deploy ledger codifies how the swarm lifts BeeHive rituals into production.
Follow each rite in sequence; every command corresponds to a documented ritual to
avoid ad hoc drift.

## 1. Prepare the Hive
1. `make install` — install dependencies using the Makefile ritual.
2. `npm run lint` — optional but recommended for local feedback before a smoke run.

## 2. Smoke Harness
Run `make smoke` to verify the BEEREEL `/create` ritual scroll is intact. The script
checks `scrolls/smoke-tests-beereel.md` and emits Codex-ready metadata.

## 3. Build + Export
Use `make build` to compile the Next.js site. Because `next.config.js` produces a standalone build for Netlify SSR, no extra export step is required.

## 4. SwarmKit Bundle
`make zip` packages a `SwarmKit.zip` artifact with docs, scrolls, Netlify functions,
and the built site artifacts (standalone `.next` or static `out` when present). The bundle metadata is printed to stdout for
CodexReplay overlays.

## 5. Netlify & GitHub Actions
- **Netlify** executes `npm run build` via the Next.js plugin per `netlify.toml`.
- **GitHub Actions** should invoke `make smoke` after installing dependencies to
  gate merges with the smoke harness.

## 6. Post-Deploy Rituals
1. Update `Codex-Index-Scroll.md` with the new seal status.
2. Append a CHANGELOG entry summarizing the release.
3. Share the SwarmKit artifact link in StudioShare with the metadata emitted during `make zip`.

> Whenever the deploy path changes, update this scroll and ping the Swarm Conductor so
> every contributor can follow the lineage without guesswork.
