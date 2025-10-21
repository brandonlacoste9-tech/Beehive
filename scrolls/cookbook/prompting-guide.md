# 📜 Scroll of Prompting — How to Speak to Codex

## Invocation
> *“Codex is only as sharp as the instructions it receives. To guide the swarm’s agent, inscribe prompts with clarity, verification, and intent.”*

---

## I. Provide Clear Code Pointers
- Narrow Codex’s search to specific files, packages, or identifiers.  
- Use **greppable identifiers**, **stack traces**, or **rich code snippets**.  
- The more precise the pointer, the faster Codex finds the lineage.  

---

## II. Include Verification Steps
- Give Codex steps to **reproduce an issue** or **validate a feature**.  
- Mention **linters**, **pre-commit checks**, or test commands.  
- If special environments are needed, describe them (see *Environment Configuration*).  

---

## III. Customize the Work Ritual
- Tell Codex *how* to approach the task:  
  - Use specific commits for reference.  
  - Log failing commands.  
  - Avoid certain executables.  
  - Follow a PR template.  
  - Treat a file as `AGENTS.md`.  
  - Even: draw ASCII art before sealing the work.  

---

## IV. Split Large Tasks
- Break complex work into **smaller, focused steps**.  
- Easier for Codex to test, easier for you to review.  
- You can even ask Codex to **help break tasks down**.  

---

## V. Leverage Codex for Debugging
- Paste **logs** or **error traces** directly into Codex.  
- Codex can analyze in parallel and surface root causes quickly.  
- Use it as the **first debugging step** before deeper dives.  

---

## VI. Try Open-Ended Prompts
- Beyond targeted fixes, Codex can:  
  - Clean up code  
  - Find bugs  
  - Brainstorm ideas  
  - Break down tasks  
  - Write detailed docs  
- Leave space for Codex to **surprise you**.  

---

## Seal Metadata
```yaml
title: "scroll(prompting-guide): how to prompt codex"
description: >
  Ritualized guidance for prompting Codex effectively:
  clear pointers, verification steps, customization,
  task splitting, debugging, and open-ended exploration.
author: "swarm/keeper-tristan"
status: "sealed"
tags: [codex, prompting, guide, rituals, swarm]
```

---

✨ This scroll now lives as the **Prompting Guide** — a ritual for how to speak to Codex clearly and effectively.
