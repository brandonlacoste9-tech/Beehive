# Codex Scroll: Codex CLI Setup & Usage
id: scroll-codex-cli
status: sealed
version: 1.0.0
last_updated: 2025-10-25
authors: ["swarm/keeper-tristan"]
tags: [codex, cli, install, usage, models, approvals, wsl]

> ⚡🐝 *To inscribe Codex within your terminal forge, follow each rite in order—preparation, invocation, guidance. Every command is a verse in the lineage.*

---

## Invocation
> *“To summon Codex in the forge of your terminal, prepare the system, inscribe the package, and grant it voice through authentication.”*

---

## I. Set Up the Forge
- **Supported:** macOS & Linux (official).
- **Windows:** experimental — invoke through **Windows Subsystem for Linux**. See the **Scroll of the WSL Forge** for full rites.

---

## II. Installation Ritual
**With npm**
```bash
npm install -g @openai/codex
```

**With Homebrew**
```bash
brew install codex
```

---

## III. First Summoning
```bash
codex
```

- On first run, Codex will prompt for authentication.
- Recommended: sign in with your ChatGPT account (Plus, Pro, Team, Edu, Enterprise).
- Alternative: provide an API key (requires additional environment shaping).

---

## IV. Upgrading Codex
**With npm**
```bash
npm install -g @openai/codex@latest
```

**With Homebrew**
```bash
brew upgrade codex
```

---

## V. Working with Codex
- Codex manifests as an **interactive terminal UI**.
- It can **read your codebase, compose edits, and run commands** within approved bounds.
- Guide it with prompts, including **image inputs** when context demands.

**Direct Prompt Example**
```bash
codex "explain this codebase"
```

---

## VI. Models & Reasoning
- Default: **GPT-5**.
- Recommended: **GPT-5-Codex** (optimized for agentic coding).
- Switch models with `/model` inside Codex, or via CLI flag:
```bash
codex --model gpt-5-codex
```
- Reasoning levels: *medium* (default) → elevate to *high* for complex undertakings.

---

## VII. Approval Modes
- **Auto (default):** Codex can read/edit/run inside the working directory automatically.
- **Read Only:** use `/approvals` to plan and converse without edits.
- **Full Access:** grants read/edit/run with network access—**wield carefully**.

---

## VIII. Image Inputs
- Paste images directly into the composer.
- Or attach via CLI:
```bash
codex -i screenshot.png "Explain this error"
codex --image img1.png,img2.jpg "Summarize these diagrams"
```

---

## IX. Scripting Codex
Run Codex non-interactively with `exec`:
```bash
codex exec "fix the CI failure"
```

---

## Seal Metadata
```yaml
title: "scroll(codex-cli): setup and usage"
description: >
  Ritual for installing, upgrading, and invoking Codex CLI.
  Covers setup, authentication, models, approval modes,
  image inputs, and scripting.
author: "swarm/keeper-tristan"
status: "sealed"
tags: [codex, cli, install, usage, models, approvals, wsl]
```

---

✨ With this scroll, contributors can **install, summon, and guide Codex** in the terminal—with clarity on models, approvals, and scripting.
