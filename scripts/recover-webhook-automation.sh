#!/usr/bin/env bash
set -euo pipefail

# Recovery script: Apply webhook automation after main branch is fixed
# Run this AFTER the corrupted file is removed from origin/main

echo "🔄 Starting webhook automation recovery..."

# Step 1: Clean up local branches
echo "Cleaning up local git state..."
git checkout main 2>/dev/null || git checkout -b main origin/main
git fetch origin --prune
git reset --hard origin/main

echo "✅ Local main branch synced with origin"

# Step 2: Create fresh webhook automation branch
BRANCH_NAME="webhook-automation-integration"
echo "Creating fresh branch: $BRANCH_NAME"
git checkout -b "$BRANCH_NAME"

# Step 3: Cherry-pick webhook commits from infra/dev-machine-rebase
echo "Cherry-picking webhook automation commits..."

# Get the webhook-related commits (adjust SHAs if needed)
WEBHOOK_COMMITS=$(git log origin/infra/dev-machine-rebase --oneline -10 | grep -E "(webhook|automation)" | awk '{print $1}' | tac)

if [ -z "$WEBHOOK_COMMITS" ]; then
    echo "⚠️  No webhook commits found. Applying patches instead..."

    # Apply patches created earlier
    if [ -d "/tmp/webhook-patches" ]; then
        git am /tmp/webhook-patches/*.patch
        echo "✅ Patches applied"
    else
        echo "❌ ERROR: No patches found. Manual intervention required."
        exit 1
    fi
else
    echo "Found commits to cherry-pick:"
    echo "$WEBHOOK_COMMITS"

    for commit in $WEBHOOK_COMMITS; do
        echo "Applying $commit..."
        git cherry-pick "$commit" || {
            echo "⚠️  Conflict detected. Resolve and run: git cherry-pick --continue"
            exit 1
        }
    done

    echo "✅ All webhook commits applied"
fi

# Step 4: Push and create PR
echo "Pushing branch to origin..."
git push origin "$BRANCH_NAME"

echo "Creating pull request..."
gh pr create \
    --title "chore: integrate webhook automation for AdGenXAI production" \
    --body "## Summary
Adds complete webhook automation infrastructure for GitHub event processing:

- **Webhook Gateway Package**: Event router, dispatcher, and telemetry system
- **Netlify Functions**: github-webhook receiver and webhook-telemetry endpoint
- **Validation Workflow**: CI checks for webhook configuration
- **Deployment Script**: Automated setup with safety rails
- **Documentation**: Complete setup and troubleshooting guides

## Test Plan
- [ ] Webhook signature verification works
- [ ] Telemetry logging captures events
- [ ] Observation mode (ENABLE_WEBHOOK_PROCESSING=false) works
- [ ] CI validation passes

## Security
- Webhook secrets managed via Netlify env vars
- Signature verification using crypto.timingSafeEqual
- Audit logging for all events
- Observation mode before activation

🤖 Generated with Claude Code

**Note**: This PR was recovered after fixing a corrupted file in main branch.

Ready for squash merge to maintain clean history." \
    --base main \
    --head "$BRANCH_NAME"

echo "✅ PR created successfully!"
echo ""
echo "Next steps:"
echo "1. Review the PR on GitHub"
echo "2. Run CI checks"
echo "3. Squash merge when ready"
