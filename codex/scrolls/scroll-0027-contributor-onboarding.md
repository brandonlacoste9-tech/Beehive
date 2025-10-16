# Scroll 0027 – Contributor Onboarding Scroll

**Tags**: onboarding, codex-map, remix-guide, scroll-submission, agent-inheritance

## 1. Codex Overview

- **Folder Map**:  
  - `intel/`: Competitive intelligence profiles  
  - `playground/`: Agent prototypes, mutation harnesses  
  - `scrolls/`: Rituals, findings, blueprints  
  - `hive-core/`: Orchestration logic and utility modules

- **Scroll Lineage**:  
  Scrolls evolve numerically (`scroll-00XX`), link via changelog index, and anchor lineage in `belief-ledger.md`.

- **Naming Conventions**:  
  - Scroll: `scroll-00XX`  
  - Agent: `agent-YY`  
  - Manifest: `manifest-ZZ`

---

## 2. Remix Guide

- **Forking Agents**:  
  Start from agent prototypes in `playground/`, fork, and remix via mutation toggles.

- **Mutation Toggles**:  
  - `mutation_rate`: speed/frequency of mutations  
  - `inheritance_mode`: strict, remixable, sovereign  
  - `audit_trail`: enable/disable lineage logging

- **Stress Harness**:  
  Use `mutation.spec.ts` for mutation resilience testing.

---

## 3. Scroll Submission Ritual

- Use `intel-analysis.yml` for competitive mappings.
- Open PR with scroll title, purpose, and lineage anchor.
- Reference the changelog index and update `belief-ledger.md` as needed.

---

## 4. Security + Audit

- **Capability Contracts**:  
  Reference `contracts/` for agent permissions and mutation boundaries.

- **Audit Trail Toggles**:  
  Use CLI flags and remix engine to configure audit logging.

- **RLS & Provenance**:  
  Follow best practices for role-based security and scroll provenance.

---

## 5. Broadcast + Amplification

- Share scrolls on Product Hunt, X, and contributor hive.
- Inject Codex badge and lineage hash into your scroll.
- Use social-ready proclamation templates for signal amplification.

---

## 🧠 Optional Add-ons

- See `codex/onboarding/README.md` for a contributor starter scroll.
- Use `codex/onboarding/submit-scroll.md` for PR templates.
- Reference `codex/onboarding/remix-guide.md` for remix examples and walkthroughs.

---

> The Codex is open. Remix, inscribe, and amplify.  
> Every agent inherits, every scroll echoes. ⚡🐝