# 📖 **Codex Onboarding Scroll — From Clone to Contribution**

## Invocation
> *“To join the swarm, a new bee must first summon the Codex, prepare the forge, and learn the rituals of prompting, building, and sealing lineage. This scroll is the complete path.”*

---

## I. Cloning the Codex
**HTTPS**
```bash
git clone https://github.com/openai/codex.git
cd codex
```

**SSH**
```bash
git clone git@github.com:openai/codex.git
cd codex
```

**GitHub CLI**
```bash
gh repo clone openai/codex
cd codex
```

---

## II. Environment Setup

### macOS / Linux
```bash
npm install -g @openai/codex
```
or
```bash
brew install codex
```

### Windows (via WSL)
```powershell
wsl --install
wsl
```
Inside WSL:
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/master/install.sh | bash
nvm install 22
npm i -g @openai/codex
```

**Repo Placement**
- Place code under `~/code/...` not `/mnt/c/...` for speed and fewer issues.  
- Access from Windows Explorer: `\\wsl$\Ubuntu\home\<user>\code\repo`

---

## III. Running Codex
```bash
codex
```
- First run → authenticate with ChatGPT account (Plus, Pro, Team, Edu, Enterprise).  
- Alternative: API key setup.  

**Upgrade**
```bash
npm install -g @openai/codex@latest
# or
brew upgrade codex
```

---

## IV. Models & Reasoning
- Default: **GPT-5**  
- Recommended: **GPT-5-Codex**  
```bash
codex --model gpt-5-codex
```
- Reasoning levels: *medium* (default) → *high* for complex tasks.  

---

## V. Approval Modes
- **Auto (default):** read/edit/run inside working directory.  
- **Read Only:** `/approvals` → plan before edits.  
- **Full Access:** unsandboxed, with network. ⚠️ Use with caution.  

---

## VI. Prompting Guide
- **Clear pointers:** file names, stack traces, code snippets.  
- **Verification steps:** repro instructions, linters, tests.  
- **Customize rituals:** commits, logging, PR templates, ASCII art.  
- **Split tasks:** smaller steps = easier review.  
- **Debugging:** paste logs, error traces.  
- **Open-ended:** cleanup, docs, brainstorming.  

---

## VII. Image Inputs
```bash
codex -i screenshot.png "Explain this error"
codex --image img1.png,img2.jpg "Summarize these diagrams"
```

---

## VIII. Scripting Codex
```bash
codex exec "fix the CI failure"
```

---

## IX. Repo Map
- **codex-cli/** → Node.js CLI  
- **codex-rs/** → Rust core  
- **sdk/typescript/** → TypeScript SDK  
- **docs/** → Documentation scrolls  
- **scripts/** → Publishing logic  
- **.github/** → CI/CD workflows  

---

## X. Contributor Guidance
- **Agents** → follow scrolls, run smoke tests before merging.  
- **Bees (BEs)** → inscribe ADRs, changelogs, mutation logs.  
- **Swarm** → celebrate lineage closure, broadcast seals.  
- **Automation** → dependabot and CI maintain dependencies.  

---

## XI. Commit Lineage (Apr–Oct 2025)
- **bolinfest** — 453 commits, 85k++ / 68k--  
- **nornagon-openai** — 159 commits, 34k++ / 23k--  
- **pakrym-oai** — 152 commits, 27k++ / 11k--  
- **aibrahim-oai** — 142 commits, 28k++ / 10k--  
- **easong-openai** — 43 commits, 56k++ / 7k-- (massive additions)  
- Many others — middle and supporting scribes, automation bots.  

---

## XII. Smoke Test Rituals (to be sealed)
- `/api/reels` → create/list reels  
- `/api/personas` → catalog personas  
- `/api/uploads` → asset upload  
- Curl invocations + expected outputs → `scrolls/smoke-tests-beereel.md`  

---

## Seal Metadata
```yaml
title: "scroll(codex-onboarding): full contributor path"
description: >
  Complete onboarding guide for Codex contributors:
  cloning, setup, environment, running, prompting,
  repo map, contributor guidance, commit lineage,
  and smoke test rituals.
author: "swarm/keeper-tristan"
status: "sealed"
tags: [codex, onboarding, cli, wsl, prompting, lineage, swarm]
```

---

✨ This is the **whole thing** — the **Onboarding Scroll** that takes a new bee from cloning the repo to contributing with lineage awareness.
