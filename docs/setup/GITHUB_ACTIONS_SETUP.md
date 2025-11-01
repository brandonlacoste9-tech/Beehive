# GitHub Actions Setup Guide

## Overview

The Beehive project now includes a comprehensive CI/CD pipeline with automated testing, quality checks, security scanning, and deployment workflows.

---

## Workflows

### 1. **CI Workflow** (`.github/workflows/ci.yml`)

**Triggers**: On push to `main` or `develop`, or on pull requests

**Steps**:
1. Setup Node.js environment
2. Install dependencies with npm cache
3. Run ESLint
4. Type checking with TypeScript
5. Unit tests with Vitest
6. Build Next.js application
7. Install and run Playwright E2E tests
8. Upload test artifacts on failure
9. Upload coverage reports

**Artifacts**:
- `test-results/` - E2E test results (7-day retention)
- `coverage/` - Code coverage reports (7-day retention)

---

### 2. **Deploy Workflow** (`.github/workflows/deploy.yml`)

**Triggers**:
- Push to `main` branch
- After successful CI workflow completion

**Environment Variables** (set in GitHub Secrets):
```
NETLIFY_AUTH_TOKEN    # Netlify authentication token
NETLIFY_SITE_ID       # Netlify site ID
NEXT_PUBLIC_SUPABASE_URL      # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY # Supabase anon key
OPENAI_API_KEY        # OpenAI API key for deployments
GITHUB_TOKEN          # (auto-provided)
```

**Steps**:
1. Checkout code with full history
2. Setup Node.js 20.x
3. Install dependencies
4. Build Next.js application
5. Deploy to Netlify (production)
6. Create deployment notification
7. Archive deployment logs on failure

---

### 3. **Code Quality Workflow** (`.github/workflows/quality.yml`)

**Triggers**: On push to `main`/`develop`, or pull requests

**Includes**:

#### Code Quality Checks:
- Secret scanning (via `npm run check-secrets`)
- Prettier code formatting validation
- ESLint linting
- TypeScript type checking
- Unit tests with coverage (`--coverage` flag)

#### Coverage Upload:
- Sends coverage reports to Codecov
- Adds PR comment with coverage percentages
- Tracks: Statements, Branches, Functions, Lines

#### Security Scanning:
- Trivy vulnerability scanning (filesystem)
- SARIF format upload to GitHub Security tab
- NPM audit (moderate severity threshold)

---

### 4. **Release Workflow** (`.github/workflows/release.yml`)

**Triggers**:
- Manual dispatch (workflow_dispatch)
  - Allows selection of release type: `patch`, `minor`, or `major`
- Push of git tags matching `v*` pattern

**Steps**:
1. Checkout full history
2. Setup Node.js
3. Extract version from package.json
4. Create GitHub Release (on tag push)
5. Publish documentation to GitHub Pages

**Release Assets**:
- `package.json` - Version reference
- `CHANGELOG.md` - Release notes

---

### 5. **Integration Test Workflow** (`.github/workflows/integration-test.yml`)

**Triggers**: Changes to platform files or API routes

**File Triggers**:
- `lib/platforms/**`
- `app/api/publish/**`
- `.github/workflows/integration-test.yml`

**Steps**:
1. Type check platform implementations
2. Lint platform code
3. Run platform-specific tests
4. Generate platform documentation
5. Upload platform docs as artifacts
6. Comment on PRs with platform status

---

## Required Secrets

Add these to your GitHub repository settings: **Settings → Secrets and variables → Actions**

### Core Secrets:
```
NETLIFY_AUTH_TOKEN          # Get from Netlify: User Settings → Applications
NETLIFY_SITE_ID             # Get from Netlify: Site Settings → General
GITHUB_TOKEN                # (Auto-provided by GitHub Actions)
```

### API Keys:
```
NEXT_PUBLIC_SUPABASE_URL    # From Supabase project settings
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
OPENAI_API_KEY              # For production deployments
GITHUB_TOKEN                # For GitHub Models
```

### Optional:
```
CODECOV_TOKEN               # For Codecov integration
```

---

## Platform Integrations

### Instagram (`lib/platforms/instagram.ts`)

**Capabilities**:
- Direct image publishing via Facebook Graph API
- Automatic caption inclusion
- Published ID tracking

**Configuration**:
```typescript
const config: InstagramConfig = {
  accountId: "YOUR_ACCOUNT_ID",
  accessToken: "YOUR_ACCESS_TOKEN",
};

const result = await publishImage(config, imageUrl, caption);
// Returns: { containerId, publishedId }
```

**Requirements**:
- Facebook Business Account
- Instagram Graph API access
- Valid long-lived access token

---

### TikTok (`lib/platforms/tiktok.ts`)

**Capabilities**:
- Video upload via TikTok Content Posting API
- Multi-step publish process (init → upload → publish)
- Privacy level control
- Automatic title generation from metadata

**Configuration**:
```typescript
const config: TikTokConfig = {
  clientKey: "YOUR_CLIENT_KEY",
  clientSecret: "YOUR_CLIENT_SECRET",
  accessToken: "YOUR_ACCESS_TOKEN",
  openId: "YOUR_OPEN_ID",
};

const result = await publishVideo(config, videoUrl, title);
// Returns: { shareId }
```

**Requirements**:
- TikTok Developer Account
- Content Posting API approval
- OAuth2 tokens
- Valid openId

---

### YouTube (`lib/platforms/youtube.ts`)

**Capabilities**:
- Video upload via YouTube Data API v3
- OAuth2 authentication with refresh tokens
- Full metadata support (title, description, tags)
- Privacy level control (public/private/unlisted)

**Configuration**:
```typescript
const config: YouTubeConfig = {
  clientId: "YOUR_CLIENT_ID",
  clientSecret: "YOUR_CLIENT_SECRET",
  refreshToken: "YOUR_REFRESH_TOKEN",
};

const result = await publishVideo(config, videoBuffer, {
  title: "My Video",
  description: "Video description",
  tags: ["ai", "content"],
  privacyStatus: "public",
});
// Returns: { videoId }
```

**Requirements**:
- Google Cloud Project
- YouTube Data API v3 enabled
- OAuth2 credentials
- Valid refresh token

---

## Usage Examples

### Using Platform Index

```typescript
import {
  publishImage,
  publishYouTubeVideo,
  PLATFORMS
} from '@/lib/platforms';

// Instagram
const igResult = await publishImage(
  { accountId, accessToken },
  imageUrl,
  caption
);

// YouTube
const ytResult = await publishYouTubeVideo(
  { clientId, clientSecret, refreshToken },
  videoBuffer,
  metadata
);
```

### In API Routes

```typescript
// app/api/publish/route.ts
import { publishImage, publishYouTubeVideo } from '@/lib/platforms';

export async function POST(req: Request) {
  const { platform, content, metadata } = await req.json();

  try {
    let result;
    if (platform === 'instagram') {
      result = await publishImage(igConfig, content.url, content.caption);
    } else if (platform === 'youtube') {
      result = await publishYouTubeVideo(ytConfig, content.buffer, metadata);
    }

    return Response.json({ success: true, result });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}
```

---

## Monitoring Workflows

### View Workflow Status:
1. Go to **GitHub Repository → Actions**
2. Select workflow (CI, Deploy, Quality, etc.)
3. Click run to see logs

### Debugging Failed Builds:

**CI Failures**:
```bash
# Run locally to reproduce
npm run lint
npm run type-check
npm test
npm run build
npm run e2e
```

**Deploy Failures**:
- Check Netlify site settings
- Verify environment variables in GitHub Secrets
- Check build logs in Actions tab

**Quality Check Failures**:
- Run `npm run format` to fix formatting
- Run `npm run lint -- --fix` to fix linting issues
- Check `npm audit` for security issues

---

## Best Practices

### 1. Branch Protection
- Require CI to pass before merging to `main`
- Require code review
- Enforce up-to-date branches

### 2. Commit Hygiene
```bash
# Format before committing
npm run format

# Type check locally
npm run type-check

# Run tests locally
npm test
```

### 3. Environment Secrets
- Never commit `.env` files
- Use GitHub Secrets for all sensitive data
- Rotate tokens periodically
- Use different secrets for staging vs production

### 4. Deployment Strategy
- Develop on feature branches
- Test in CI before merging
- Deploy automatically to production on main push
- Monitor Netlify deployments in real-time

---

## Troubleshooting

### "NETLIFY_AUTH_TOKEN not found"
- Add token to GitHub Secrets
- Use full spelling: `NETLIFY_AUTH_TOKEN` (not abbreviated)

### "Platform integration tests failing"
- Verify API credentials in env variables
- Check platform API rate limits
- Review platform-specific error messages in logs

### "Coverage not being reported"
- Ensure `npm run test:coverage` generates `coverage-summary.json`
- Codecov token optional but recommended

### "Deployment stuck or timing out"
- Check Next.js build time locally
- Review build logs in Actions tab
- Increase timeout if needed

---

## Next Steps

1. **Add Secrets to GitHub**: Configure all required secrets in repository settings
2. **Test Workflows**: Push a commit and monitor CI workflow
3. **Deploy Branch**: Merge to `main` to trigger deployment
4. **Monitor**: Check Actions tab and Netlify dashboard
5. **Iterate**: Use feedback from workflows to improve code quality

---

## Resources

- **GitHub Actions Docs**: https://docs.github.com/en/actions
- **Netlify Docs**: https://docs.netlify.com
- **Next.js Build**: https://nextjs.org/docs/app/api-reference/cli/build
- **Playwright Testing**: https://playwright.dev
- **Vitest**: https://vitest.dev

---

**Last Updated**: October 31, 2025
**Status**: Production Ready ✅
