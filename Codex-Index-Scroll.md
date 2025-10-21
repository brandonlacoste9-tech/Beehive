---
title: "Codex Index Scroll"
status: "sealed"
tags:
  - codex
  - swarm
  - index
  - lineage
---

# 📜 Codex Index Scroll

This scroll enumerates the living charter of BeeHive’s Codex artifacts. Each entry binds
a ritual, a steward, and the latest export status so the swarm can trace lineage at a glance.

## Main Charter
- **Scroll**: [Codex-Main-Scroll.md](./Codex-Main-Scroll.md)
- **Status**: `sealed`
- **Tags**: `codex`, `swarm`, `adgenxai`, `beereel`, `rituals`, `cookbook`, `lineage`
- **Replay Overlay**: `codex-main`

## Ritual Cookbooks
- **Flowing Honey**: [scrolls/beereel-create-flowing-honey.md](scrolls/beereel-create-flowing-honey.md)
- **Smoke Harness**: [scrolls/smoke-tests-beereel.md](scrolls/smoke-tests-beereel.md)
- **Operational Docs**: [docs/](docs/)

## Deployment Rites
- **Deploy Readme**: [README.deploy.md](./README.deploy.md)
- **Netlify Stack**: `make build` → `make zip`
- **GitHub Actions**: Smoke harness triggered via `make smoke`

## Seal Ledger
| Scroll | Status | Updated |
| --- | --- | --- |
| Codex-Main-Scroll | sealed | 2025-10-20 |
| scroll(beereel-create) | sealed | 2025-10-20 |
| smoke-tests-beereel | drafting | 2025-10-20 |

> Keep this ledger synced whenever a scroll is unsealed or revised. The Codex index is the
> swarm’s compass—update it before shipping SwarmKit bundles.
