# How to Run Bulk Auto-Review Agent for ALL Open PRs and Issues

## Overview

This document provides instructions for running the automated bulk review agent that processes all open pull requests and issues in both the `brandonlacoste9-tech/adgenxai` and `brandonlacoste9-tech/Beehive` repositories.

## Automation Agent Bulk Run Instructions

### 1. Trigger via Netlify (Recommended Configuration)

**Configuration:**
- **All secrets are stored in Netlify (GitHub token etc.)**
- The agent code: `agents/github-pr-manager/src/auto-review-agent.ts`
- Netlify Function wrapper: `netlify/functions/auto-review-agent.ts`
- Production URL: [adgenxai.pro](https://www.adgenxai.pro)

**To trigger automation:**

#### Option A: Open in Browser
Simply visit this URL in your web browser:
```
https://www.adgenxai.pro/.netlify/functions/auto-review-agent
```

#### Option B: Use cURL from Terminal
```bash
curl -X POST https://www.adgenxai.pro/.netlify/functions/auto-review-agent
```

**What happens:**
- The agent reviews and auto-fixes ALL open PRs and issues in both repos (`adgenxai` & `Beehive`)
- Comments are automatically posted to each PR and issue
- Results are returned in JSON format

---

### 2. Trigger from GitHub Actions (Optional, Scheduled or Manual)

A GitHub Actions workflow is included at `.github/workflows/auto-review-agent.yml` that can:
- Run on a schedule (daily at 10 AM UTC)
- Be triggered manually via the Actions tab
- Be integrated into other workflows

**To run manually:**
1. Go to the [Actions tab](https://github.com/brandonlacoste9-tech/Beehive/actions)
2. Select "Auto Review Agent" workflow
3. Click "Run workflow"
4. Click the green "Run workflow" button

**Workflow snippet to add to other workflows:**
```yaml
- name: Run Netlify Bulk Auto Agent
  run: curl -X POST https://www.adgenxai.pro/.netlify/functions/auto-review-agent
```

---

## Agent Overview

The auto-review agent:
- ✅ Reviews every open pull request in both target repos
- ✅ Reviews every open issue in both target repos
- ✅ Places intelligent comments with summaries and recommendations
- ✅ Provides statistics on files changed, additions/deletions
- ✅ Checks for missing labels and assignees
- ✅ Auto-fixes common issues (when enabled)
- ✅ Creates PRs with fixes as per current logic
- ✅ Output is visible in GitHub threads, issue comments, and Beehive logs

### What Gets Reviewed

**For Pull Requests:**
- Files changed
- Lines added/deleted
- Mergeable status
- Test status
- Code quality checks

**For Issues:**
- Labels assigned
- Assignees
- Comment activity
- Status and age
- Priority indicators

---

## Environment Setup

### Required Environment Variables (Netlify)

The following environment variable must be set in Netlify:

```bash
GITHUB_TOKEN=ghp_your_github_personal_access_token
```

Or alternatively:
```bash
GITHUB_PERSONAL_ACCESS_TOKEN=ghp_your_github_personal_access_token
```

### Creating a GitHub Token

1. Go to [GitHub Settings → Personal Access Tokens](https://github.com/settings/tokens)
2. Click "Generate new token (classic)"
3. Name: "Auto-Review Agent"
4. Scopes required:
   - ✅ `repo` (Full control of private repositories)
5. Generate and copy the token
6. Add to Netlify environment variables

---

## Monitoring

### Check Results

After triggering, check these locations for review comments:

**Pull Requests:**
- [AdGenXAI Open PRs](https://github.com/brandonlacoste9-tech/adgenxai/pulls?state=open)
- [Beehive Open PRs](https://github.com/brandonlacoste9-tech/Beehive/pulls?state=open)

**Issues:**
- [AdGenXAI Open Issues](https://github.com/brandonlacoste9-tech/adgenxai/issues?state=open)
- [Beehive Open Issues](https://github.com/brandonlacoste9-tech/Beehive/issues?state=open)

### Logs

- Netlify function logs: Check Netlify dashboard → Functions → auto-review-agent
- GitHub Actions logs: Check Actions tab → Auto Review Agent workflow
- Beehive application logs: If configured

---

## Response Format

When triggered successfully, the agent returns:

```json
{
  "success": true,
  "message": "Auto-review agent completed successfully",
  "duration": "5.23s",
  "summary": "Auto-Review Agent Summary:\n--------------------------\nTotal Items Reviewed: 12\n\nBy Type:\n  - Pull Requests: 5\n  - Issues: 7\n\nBy Status:\n  - Reviewed: 0\n  - Commented: 12\n  - Fixed: 0\n  - Errors: 0\n",
  "results": [
    {
      "repo": "brandonlacoste9-tech/adgenxai",
      "type": "pull_request",
      "number": 42,
      "title": "Add new feature",
      "status": "commented",
      "message": "Review comment added"
    }
    // ... more results
  ]
}
```

---

## Continuous Review/Fix Cycles

To maintain continuous code quality:

1. **Daily Automated Runs**: The GitHub Actions workflow runs daily at 10 AM UTC
2. **Manual Triggers**: Run as needed when multiple PRs/issues need review
3. **Re-run Logic**: The agent can be run multiple times safely - it will add new comments each time

**Best Practice:**
- Run after major PR batches
- Run before planning meetings to triage issues
- Run after merges to check for new issues

---

## Troubleshooting

### Agent Returns Error

**"GitHub token not configured"**
- Solution: Add `GITHUB_TOKEN` to Netlify environment variables

**"Authentication failed"**
- Solution: Regenerate GitHub token with correct scopes

**"Rate limit exceeded"**
- Solution: Wait 1 hour and retry (GitHub API limits)

### No Comments Appearing

1. Check Netlify function logs for errors
2. Verify GitHub token has `repo` scope
3. Ensure there are actually open PRs/issues
4. Check rate limits haven't been exceeded

### Function Timeout

- The function has sufficient timeout for normal operation
- If you have 100+ open items, consider running multiple times or batching

---

## Support & Triage

After triggering the agent:

1. ✅ Say "ready" to confirm trigger
2. 🔍 Review the JSON response for summary
3. 📊 Check the linked PRs and issues for comments
4. 🎯 Proceed with support/triage based on agent recommendations

---

## Architecture

```
Beehive Repository
├── agents/github-pr-manager/
│   ├── src/
│   │   └── auto-review-agent.ts    # Core agent logic
│   ├── package.json                 # Agent dependencies
│   ├── tsconfig.json               # TypeScript config
│   └── README.md                   # Agent documentation
├── netlify/functions/
│   └── auto-review-agent.ts        # Netlify Function wrapper
└── .github/workflows/
    └── auto-review-agent.yml       # GitHub Actions workflow
```

---

## Next Steps

1. Ensure `GITHUB_TOKEN` is set in Netlify environment variables
2. Test the agent with a single curl request
3. Review the comments on PRs and issues
4. Set up scheduled runs via GitHub Actions if desired
5. Monitor and iterate on review logic as needed

---

## References

- Agent README: `agents/github-pr-manager/README.md`
- Environment Variables: `.env.example`
- GitHub Actions: `.github/workflows/auto-review-agent.yml`
- Production URL: https://www.adgenxai.pro

---

**Ready to run?** Just execute:
```bash
curl -X POST https://www.adgenxai.pro/.netlify/functions/auto-review-agent
```

Then say "ready" and proceed with support/triage! 🚀
