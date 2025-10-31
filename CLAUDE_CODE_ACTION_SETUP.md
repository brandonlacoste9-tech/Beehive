# Claude Code Action Setup Guide

## Overview

The Beehive repository now includes the **Claude Code Action** — a GitHub workflow that allows Claude to automatically help with your repository by:
- Answering questions about code
- Implementing features and fixes
- Reviewing PRs and code changes
- Updating documentation
- Running tests and validation

The action is triggered by mentioning `@claude` in PR/issue comments or review comments.

---

## Installation & Configuration

### Step 1: Install the Claude GitHub App

1. Visit: https://github.com/apps/claude
2. Click **"Install"** or **"Configure"**
3. Select your repository (Beehive)
4. Grant the app access to your repository

The app requires these permissions:
- ✅ Read/Write access to Pull Requests
- ✅ Read/Write access to Issues
- ✅ Read/Write access to Contents (code files)

---

### Step 2: Choose Your Authentication Method

You have three options:

#### **Option A: OAuth (Claude Max Subscribers) ⭐ RECOMMENDED**

Best for Claude Max subscribers with an active subscription.

**Setup Steps**:

1. **Get your OAuth credentials** from Claude:
   ```bash
   # Open Claude in terminal
   claude

   # Login with your Claude Max account
   /login
   ```

2. **Find your credentials**:
   - **macOS**: Search "claude" in Keychain → "Show password"
   - **Linux/WSL**: View `~/.claude/.credentials.json`

   You'll find three values:
   - `access_token`
   - `refresh_token`
   - `expires_at` (timestamp)

3. **Add to GitHub Secrets**:
   - Go to: **Settings → Secrets and variables → Actions**
   - Add these secrets:

   | Secret Name | Value |
   |---|---|
   | `CLAUDE_ACCESS_TOKEN` | Your access_token |
   | `CLAUDE_REFRESH_TOKEN` | Your refresh_token |
   | `CLAUDE_EXPIRES_AT` | Your expires_at timestamp |
   | `SECRETS_ADMIN_PAT` | GitHub PAT with `secrets:write` permission |

4. **Create GitHub Personal Access Token (PAT)**:
   - Go to: https://github.com/settings/tokens
   - Create new token (classic)
   - Check: `repo` and `admin:repo_hook`
   - Copy the token and add as `SECRETS_ADMIN_PAT` secret

**Configuration**:
The workflow file already has OAuth enabled:
```yaml
use_oauth: true
claude_access_token: ${{ secrets.CLAUDE_ACCESS_TOKEN }}
claude_refresh_token: ${{ secrets.CLAUDE_REFRESH_TOKEN }}
claude_expires_at: ${{ secrets.CLAUDE_EXPIRES_AT }}
secrets_admin_pat: ${{ secrets.SECRETS_ADMIN_PAT }}
```

---

#### **Option B: Direct Anthropic API**

Best for standard Anthropic API users.

**Setup Steps**:

1. **Get your API key** from: https://console.anthropic.com/
2. **Add to GitHub Secrets**:
   - Go to: **Settings → Secrets and variables → Actions**
   - Create secret: `ANTHROPIC_API_KEY` = your API key

**Configuration**:
Update `.github/workflows/claude.yml`:
```yaml
# Comment out OAuth section:
# use_oauth: true
# claude_access_token: ...
# claude_refresh_token: ...
# claude_expires_at: ...
# secrets_admin_pat: ...

# Uncomment this instead:
anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
```

---

#### **Option C: AWS Bedrock or Google Vertex AI**

For enterprise users with Bedrock or Vertex AI access.

See official documentation for setup:
- **Bedrock**: https://docs.aws.amazon.com/bedrock/
- **Vertex AI**: https://cloud.google.com/vertex-ai/docs

---

## How to Use Claude Code Action

### Basic Usage: Mention @claude

Simply mention `@claude` in any PR/issue comment:

```
@claude Can you review this PR and suggest improvements?
```

### Examples

#### Code Review
```
@claude Please review this PR for:
- Code quality and style
- Potential bugs
- Performance issues
- Security concerns
```

#### Feature Implementation
```
@claude I need to add support for LinkedIn publishing.
Can you implement a lib/platforms/linkedin.ts file following
the same pattern as Instagram and TikTok?
```

#### Bug Fixes
```
@claude This test is failing. Can you debug and fix it?

The error message is:
[paste error log]
```

#### Documentation Updates
```
@claude The README is outdated. Can you update it to reflect
the latest platform integrations and setup process?
```

#### Questions
```
@claude What does this function do and how could we optimize it?
```

### Advanced: Direct Prompt in Workflow

You can also trigger Claude automatically with a direct prompt:

```yaml
steps:
  - uses: grll/claude-code-action@beta
    with:
      # ... auth config ...
      direct_prompt: |
        Please update CHANGELOG.md with the changes from this PR.
        List new features, bug fixes, and breaking changes.
```

---

## Configuration Options

The workflow file includes these settings:

| Option | Value | Purpose |
|--------|-------|---------|
| `timeout_minutes` | 60 | Max time for Claude to work |
| `max_turns` | 10 | Max conversation turns (prevents runaway tasks) |
| `use_sticky_comment` | false | Use single comment (false = update original) |
| `trigger_phrase` | @claude | Trigger word for Claude |
| `base_branch` | main | Base branch for PRs |
| `branch_prefix` | claude/ | Prefix for Claude-created branches |

### Customize Trigger Phrase

Change `@claude` to something else:

```yaml
trigger_phrase: "/claude"
# or
trigger_phrase: "@bot"
```

### Increase/Decrease Work Duration

```yaml
timeout_minutes: "120"  # 2 hours (max)
max_turns: "5"          # Limit conversation turns
```

---

## Allowed Tools

Claude can use these tools by default:

✅ **Always Available**:
- File reading and editing
- Git operations (view history, see diffs)
- GitHub API access
- Comment management

✅ **Explicitly Allowed**:
- `npm install` - Install dependencies
- `npm run build` - Build the project
- `npm run test` - Run unit tests
- `npm run lint` - Run linter
- `npm run type-check` - TypeScript checking
- `npm run format` - Auto-format code

### Add More Tools

To allow Claude to run additional commands:

```yaml
allowed_tools: |
  Bash(npm install)
  Bash(npm run build)
  Bash(npm run test)
  Bash(npm run lint)
  Bash(npm run type-check)
  Bash(npm run format)
  Bash(git diff)
  Bash(git log)
  # Add custom commands here:
  Bash(./scripts/custom-script.sh)
```

### Prevent Tool Usage

```yaml
disallowed_tools: |
  Bash(rm -rf)
  Bash(git push)
```

---

## Workflow Behavior

### Branch Management

When Claude creates code changes:

**On Issues**: Creates a new branch (`claude/issue-123-description`)

**On Open PRs**: Pushes directly to the PR's existing branch

**On Closed PRs**: Creates a new branch (original is no longer active)

### Progress Updates

Claude updates a single comment with:
- ✅ Completed tasks
- 🔄 In-progress indicators
- ❌ Any errors encountered
- 📝 Final summary

### Commits

All commits are:
- Signed with commit signatures
- Include meaningful messages
- Reference the PR/issue number
- Prefixed with `claude/`

---

## Monitoring & Debugging

### View Action Logs

1. Go to: **Actions** tab in your GitHub repository
2. Click **"Claude Code Assistant"** workflow
3. Click the specific run
4. Click **"Run Claude Code Assistant"** step
5. Expand to see detailed logs

### Common Issues

#### "Claude didn't respond"
- Check trigger: Did you mention `@claude`?
- Check permissions: Does the app have repository access?
- Check secrets: Are all auth secrets configured?
- Check logs: View action logs for error messages

#### "Action timed out"
- Increase `timeout_minutes` in workflow
- Reduce complexity of the request
- Break into smaller tasks

#### "Token expired"
- For OAuth: PAT will auto-refresh with `secrets_admin_pat`
- For API keys: Check your token at console.anthropic.com

---

## Best Practices

### ✅ DO:
- Be specific with requests
- Mention `@claude` in comments on PRs/issues
- Trust Claude with small, well-defined tasks
- Use for code review, documentation, testing
- Provide context (error logs, screenshots)

### ❌ DON'T:
- Ask Claude to approve/merge PRs (security limitation)
- Merge Claude's branches without review
- Trust Claude with production deployment
- Ask for tasks outside repository context
- Forget to review changes before merging

### Examples of Good Requests:
```
@claude Can you add unit tests for the publishImage function?

@claude Please update GITHUB_ACTIONS_SETUP.md to include
the new deploy workflow we just added.

@claude Review this PR for potential security issues,
especially around API key handling.
```

---

## Customization

### Custom Instructions

The workflow includes custom instructions that tell Claude:
- The project is "Beehive" (AI publishing platform)
- Technology stack (Next.js, TypeScript, Supabase, CrewAI)
- Key architectural patterns
- Quality standards (tests, types, docs)

To modify these, edit `.github/workflows/claude.yml`:

```yaml
custom_instructions: |
  You are an expert full-stack developer assisting with the Beehive platform.

  # Add your custom guidance here
  When implementing features:
  - Always use TypeScript strict mode
  - Write tests for new functions
  - Update relevant documentation
```

### Environment Variables

Pass custom env vars to Claude Code execution:

```yaml
claude_env: |
  NODE_ENV: development
  DEBUG: false
  DATABASE_URL: postgres://...
```

---

## Beehive Platform Context

Claude is configured to understand your platform:

**Architecture**:
- Next.js frontend with React components
- TypeScript for type safety
- Supabase PostgreSQL backend
- CrewAI for agent orchestration
- Platform integrations (Instagram, TikTok, YouTube)

**BeeHive Rituals**:
- **Badge**: Agent credentialing & permissions
- **Metrics**: Real-time monitoring & optimization
- **Echo**: Pattern learning & playbook updates
- **History**: Persistent memory & seasonal analysis

**Patterns Claude Follows**:
- Strict TypeScript type checking
- Comprehensive error handling
- Full test coverage
- Up-to-date documentation
- Clean commit messages

---

## Examples

### Example 1: Code Review Request

**You write**:
```
@claude Can you review this PR for the new TikTok integration?
Pay special attention to error handling and type safety.
```

**Claude will**:
- Review the PR changes
- Check for TypeScript errors
- Verify error handling
- Suggest improvements
- Post findings as comment

### Example 2: Feature Implementation

**You write**:
```
@claude I need to add a LinkedIn publishing platform.
Create lib/platforms/linkedin.ts following the existing pattern
from Instagram and TikTok. Include proper types and error handling.
```

**Claude will**:
- Study existing platform integrations
- Create linkedin.ts with matching architecture
- Add TypeScript types
- Include error handling
- Push to new branch
- Link to PR for review

### Example 3: Bug Fix

**You write**:
```
@claude The deploy workflow is failing with this error:

Error: NETLIFY_AUTH_TOKEN not found

Can you debug and fix it?
```

**Claude will**:
- Check workflow configuration
- Verify GitHub secrets setup
- Review Netlify documentation
- Suggest fixes
- Potentially push corrected workflow

### Example 4: Documentation Update

**You write**:
```
@claude The docs are outdated. Please update:
1. GITHUB_ACTIONS_SETUP.md with the new deploy workflow
2. README.md with current platform integrations
3. Add any new workflow documentation
```

**Claude will**:
- Review current documentation
- Check code for what needs documentation
- Update all files
- Ensure consistency
- Commit changes with clear messages

---

## Security Considerations

✅ **What's Safe**:
- Claude has read-only access to the repository
- Claude can create commits on branches (not merged)
- All changes are pushed to a branch for review
- No direct access to production
- All API keys are handled securely via GitHub Secrets

⚠️ **What Claude Cannot Do**:
- Approve or merge pull requests
- Deploy to production
- Delete branches or files without asking
- Access other repositories
- View CI/CD results or secrets

---

## Troubleshooting

### Action Doesn't Trigger

**Problem**: Mentioned `@claude` but nothing happened

**Solutions**:
1. Check that Claude app is installed: **Settings → GitHub Apps**
2. Verify message contains exact trigger: `@claude` (case-sensitive by default)
3. Check that you have write access to repository
4. Review action logs for errors

### Authentication Fails

**Problem**: Action fails with "Authentication error"

**Solutions**:

For OAuth:
- Verify `CLAUDE_ACCESS_TOKEN` is set in secrets
- Check token hasn't expired in `CLAUDE_EXPIRES_AT`
- Ensure `SECRETS_ADMIN_PAT` has `secrets:write` permission

For API key:
- Verify `ANTHROPIC_API_KEY` is set in secrets
- Check key is valid at https://console.anthropic.com
- Ensure key has sufficient quota

### Timeout Issues

**Problem**: Action times out before completion

**Solutions**:
- Increase `timeout_minutes` (up to 360 = 6 hours)
- Reduce complexity of the request
- Break large tasks into smaller ones
- Check if Claude is waiting for clarification

---

## Cost Considerations

### OAuth (Claude Max Subscription)
- Uses your subscription tokens
- No additional cost
- Included in your subscription quota

### Direct API
- Charges per token used
- Typical PR review: ~5,000-50,000 tokens
- Feature implementation: ~100,000-500,000 tokens
- Check usage at: https://console.anthropic.com/account/usage

### Cost Optimization
- Use `max_turns: "5"` to limit conversation
- Ask specific, focused questions
- Provide context to reduce token usage
- Review logs to understand token consumption

---

## Support & Resources

- **Claude Code Action Docs**: https://github.com/anthropics/claude-code-action
- **Anthropic API Docs**: https://docs.anthropic.com
- **GitHub Actions Docs**: https://docs.github.com/en/actions
- **This Repository**: Beehive platform documentation

---

## Next Steps

1. ✅ Install Claude GitHub App
2. ✅ Configure authentication (OAuth or API key)
3. ✅ Test by mentioning `@claude` in a PR comment
4. ✅ Review Claude's response and merge if happy
5. ✅ Use for code reviews, features, and documentation

---

## Summary

You now have a powerful AI assistant integrated into your GitHub workflow. Claude can help with:
- Code reviews
- Feature implementation
- Bug fixes
- Documentation updates
- Testing
- And much more!

Simply mention `@claude` in any comment and describe what you need.

---

**Setup Status**: ✅ Ready to Configure
**Workflow File**: `.github/workflows/claude.yml`
**Config Guide**: This document
**Last Updated**: October 31, 2025
