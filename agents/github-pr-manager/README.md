# GitHub PR Manager - Auto-Review Agent

This agent automatically reviews all open pull requests and issues in the `brandonlacoste9-tech/adgenxai` and `brandonlacoste9-tech/Beehive` repositories.

## Features

- 🔍 **Automatic Review**: Reviews all open PRs and issues across both repositories
- 💬 **Smart Comments**: Adds helpful review comments with summaries and recommendations
- 📊 **Detailed Reports**: Provides comprehensive reports on files changed, additions/deletions, and status
- 🏷️ **Label & Assignee Checks**: Recommends adding labels and assignees to issues when missing
- ⚡ **Bulk Processing**: Processes all items in a single run

## Architecture

```
agents/github-pr-manager/
├── src/
│   └── auto-review-agent.ts    # Core agent logic
├── package.json                 # Agent dependencies
└── tsconfig.json               # TypeScript configuration

netlify/functions/
└── auto-review-agent.ts        # Netlify Function wrapper
```

## Configuration

### Environment Variables

Add these to your Netlify environment variables:

```bash
# Required: GitHub Personal Access Token
GITHUB_TOKEN=ghp_your_github_personal_access_token

# Alternative name (both are checked)
GITHUB_PERSONAL_ACCESS_TOKEN=ghp_your_github_personal_access_token
```

### Creating a GitHub Personal Access Token

1. Go to [GitHub Settings → Tokens](https://github.com/settings/tokens)
2. Click "Generate new token (classic)"
3. Give it a descriptive name (e.g., "Auto-Review Agent")
4. Select scopes:
   - ✅ `repo` (Full control of private repositories)
   - ✅ `repo:status` (Access commit status)
   - ✅ `public_repo` (Access public repositories)
5. Click "Generate token"
6. Copy the token immediately (you won't see it again!)
7. Add it to Netlify environment variables

## Usage

### Trigger via Browser

Open in your browser:
```
https://www.adgenxai.pro/.netlify/functions/auto-review-agent
```

### Trigger via cURL

```bash
curl -X POST https://www.adgenxai.pro/.netlify/functions/auto-review-agent
```

### Trigger from GitHub Actions

Add to your workflow file (`.github/workflows/auto-review-agent.yml`):

```yaml
name: Auto Review Agent

on:
  schedule:
    # Run every day at 9 AM UTC
    - cron: '0 9 * * *'
  workflow_dispatch:  # Allow manual trigger

jobs:
  auto-review:
    runs-on: ubuntu-latest
    steps:
      - name: Run Auto-Review Agent
        run: |
          curl -X POST https://www.adgenxai.pro/.netlify/functions/auto-review-agent
```

## Response Format

The agent returns a JSON response with:

```json
{
  "success": true,
  "message": "Auto-review agent completed successfully",
  "duration": "5.23s",
  "summary": "...",
  "results": [
    {
      "repo": "brandonlacoste9-tech/adgenxai",
      "type": "pull_request",
      "number": 42,
      "title": "Add new feature",
      "status": "commented",
      "message": "Review comment added"
    },
    {
      "repo": "brandonlacoste9-tech/Beehive",
      "type": "issue",
      "number": 15,
      "title": "Bug report",
      "status": "commented",
      "message": "Review comment added"
    }
  ]
}
```

## What the Agent Does

### For Pull Requests

1. Fetches all open PRs from both repositories
2. Analyzes each PR:
   - Counts files changed
   - Calculates additions and deletions
   - Checks mergeable status
3. Posts a review comment with:
   - PR summary
   - File change statistics
   - Automated recommendations
   - Checklist for manual review

### For Issues

1. Fetches all open issues from both repositories (excluding PRs)
2. Analyzes each issue:
   - Checks for labels
   - Checks for assignees
   - Counts comments
3. Posts a review comment with:
   - Issue summary
   - Current status
   - Recommendations for labels/assignees
   - Next steps

## Monitoring

After running the agent, check:

- [AdGenXAI Open PRs](https://github.com/brandonlacoste9-tech/adgenxai/pulls?state=open)
- [Beehive Open PRs](https://github.com/brandonlacoste9-tech/Beehive/pulls?state=open)
- [AdGenXAI Open Issues](https://github.com/brandonlacoste9-tech/adgenxai/issues?state=open)
- [Beehive Open Issues](https://github.com/brandonlacoste9-tech/Beehive/issues?state=open)

You'll see the auto-review comments on each PR and issue.

## Development

### Building

```bash
cd agents/github-pr-manager
npm install
npm run build
```

### Type Checking

```bash
npm run type-check
```

## Troubleshooting

### "GitHub token not configured"

Make sure you've added `GITHUB_TOKEN` or `GITHUB_PERSONAL_ACCESS_TOKEN` to Netlify environment variables.

### "Authentication failed"

Your GitHub token may have expired or lacks the required scopes. Generate a new token with `repo` scope.

### "Rate limit exceeded"

GitHub API has rate limits. The agent handles this gracefully. Wait a bit and try again.

## Future Enhancements

- [ ] Auto-fix common issues (formatting, linting)
- [ ] Create PRs with fixes
- [ ] Integration with CI/CD pipelines
- [ ] Slack/Discord notifications
- [ ] Custom review rules and policies
- [ ] AI-powered code review suggestions

## Support

For issues or questions:
- Create an issue in the repository
- Check the Netlify function logs for errors
- Review GitHub webhook delivery logs
