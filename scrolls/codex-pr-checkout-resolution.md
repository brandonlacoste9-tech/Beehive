# Codex Scroll: PR Checkout Ritual Restoration
id: scroll-pr-checkout
status: draft
version: 0.1.0
last_updated: 2025-10-15

## Purpose
Restore Codex's ability to fetch and review pull requests — specifically PR #37 — by enshrining the gh-driven ritual and a git fallback.

## Requirements
- Dockerfile or setup script access for installing CLI dependencies.
- Network access to GitHub package repositories.
- Git credentials with read access to `brandonlacoste9-tech/Beehive`.

## Ritual Steps
1. **Install GitHub CLI (`gh`).**
   ```bash
   type -p curl >/dev/null || (apt update && apt install curl -y)
   curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | \
     dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
   chmod go+r /usr/share/keyrings/githubcli-archive-keyring.gpg
   echo "deb [arch=$(dpkg --print-architecture) \
     signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] \
     https://cli.github.com/packages stable main" | \
     tee /etc/apt/sources.list.d/github-cli.list > /dev/null
   apt update
   apt install gh -y
   ```

2. **Bind the `origin` remote to the upstream hive.**
   ```bash
   git remote add origin https://github.com/brandonlacoste9-tech/Beehive.git
   ```

3. **Summon PR #37 for review.**
   - Primary rite:
     ```bash
     gh pr checkout 37
     ```
   - Fallback weave:
     ```bash
     git fetch origin pull/37/head:pr-37
     git checkout pr-37
     ```

## Outcomes
- Codex PR review workflow is back on rails.
- Manual fetch path remains available when rituals stumble.
- Future hive-mates encounter less onboarding friction.

## Next Steps
- Perform the checkout ritual for PR #37.
- Trigger the Codex review automation and capture findings per lineage guidelines.

## Operational Metadata
- jobId: pr-checkout-37
- status: documented
- sizeBytes: ~2.8K
