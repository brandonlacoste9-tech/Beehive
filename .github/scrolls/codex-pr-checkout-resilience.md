# 📜 Scroll: codex-pr-checkout-resilience

**Purpose:**  
Ensure GitHub Actions workflows check out PR code in a resilient manner, avoiding failures caused by missing merge refs.

## Trigger  
> Any update to `.github/workflows/*` involving `actions/checkout`.

## Ritual Steps  
1. **Replace fragile merge ref:**
   ```yaml
   ref: ${{ github.event.pull_request.head.ref }}
   ```
2. **(Optional) Pre-fetch base and head refs:**
   ```bash
   git fetch --no-tags origin \
     ${{ github.event.pull_request.base.ref }} \
     +refs/pull/${{ github.event.pull_request.number }}/head
   ```
3. **Document the rationale:**
   - Add a scroll note or changelog entry with context about resilience and best practices.
4. **Broadcast update:**
   - Notify maintainers/swarm with summary and PR link.
