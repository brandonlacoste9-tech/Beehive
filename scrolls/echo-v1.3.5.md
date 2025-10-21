## ⚡ Echo Scroll v1.3.5 — Agent Runner & Mutation Orchestration

### 🧬 Summary
BeeHive v1.3.5 deploys Codex-powered agents that autonomously consume signals, plan remix actions, and execute mutations.  
The swarm now reacts to on-chain activity with scroll updates, config patches, and broadcast triggers.

### 🔧 Core Upgrades
- `agents/remix_runner.ts` → agent runner for signal consumption
- `scripts/agentkit_config.json` → declarative agent schedule + capabilities
- `out/mutations.log` → mutation audit trail

### 🧠 Flow
1. Agent fetches `/api/signals`
2. Planner maps signal → remix plan
3. Codex executes mutation
4. Mutation is logged and broadcast

**Tagline:**  
> *The Codex no longer waits—it listens, plans, and remixes.*
