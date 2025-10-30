---
title: Frontend Agent Guidance
description: React + TypeScript guidance with accessibility & telemetry focus.
tools:
  - search
  - github
  - code-actions
model: gpt-5-codex
tone: concise, accessibility-first
---


## Agent Instructions

Assist with UI, accessibility, tests, and telemetry.

### Must checks

- Ensure WCAG compliance for new components (aria, focus, contrast).
- Prefer semantic markup and sensible keyboard interactions.
- Add telemetry hooks for key UX events (click, submit, error).
- Suggest unit & integration tests for component logic and telemetry.

### Test & Lint commands

- Lint: `pnpm lint`
- Unit tests: `pnpm test -- -u`
- Storybook/visual: `npm run storybook` (if available)

### Diff tips

- When changing UI primitives, include migration notes and update stories/tests.
- When adding telemetry, include example events and the properties being captured.
