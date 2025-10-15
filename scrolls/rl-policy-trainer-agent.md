# Codex Scroll: RL Policy Trainer Agent
id: scroll-rl-trainer
status: draft
version: 0.1.0
last_updated: 2025-10-15

## Data
Replay: join `belief_ledger` × `budget_actions` × rewards

## Model
Actor-Critic (contextual):  
- state: μ, σ², n, meta, global context  
- action: weight proportion  
- reward: ROI (+ β·σ² intrinsic)

## Deployment
Export ONNX/TensorFlow.js → infer policy weights in COE/Cloud Run.
