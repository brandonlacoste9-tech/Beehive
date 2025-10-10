# Accessibility Testing Workflows

This document describes the automated accessibility testing infrastructure for the Beehive project.

## Overview

The project includes comprehensive GitHub Actions workflows that automate accessibility testing on every pull request deployed to Netlify. The testing uses Playwright with axe-core to ensure WCAG 2.1 Level A & AA compliance.

## Workflows

### 1. Netlify Preview Deployment (`netlify-preview.yml`)

**Trigger:** Runs on pull request events (opened, synchronize, reopened)

**Purpose:** Deploys the PR to Netlify and extracts the live preview URL for testing.

**Steps:**
1. Checks out the repository
2. Sets up Node.js environment
3. Installs dependencies
4. Builds the Next.js project
5. Deploys to Netlify using `nwtgck/actions-netlify`
6. Extracts and saves the preview URL to `preview.txt`
7. Uploads `preview.txt` as an artifact for the next workflow

**Required Secrets:**
- `NETLIFY_AUTH_TOKEN`: Your Netlify personal access token
- `NETLIFY_SITE_ID`: Your Netlify site ID
- `GITHUB_TOKEN`: Automatically provided by GitHub Actions

### 2. Accessibility Smoke Test (`a11y-smoke.yml`)

**Trigger:** Runs after the Netlify Preview Deployment workflow completes successfully

**Purpose:** Performs automated accessibility testing against the live preview deployment.

**Steps:**
1. Checks out the repository
2. Sets up Node.js environment
3. Installs dependencies
4. Installs Playwright browsers
5. Downloads the `preview.txt` artifact from the preview workflow
6. Sets `PLAYWRIGHT_BASE_URL` environment variable from the preview URL
7. Runs Playwright accessibility tests
8. Generates and uploads an HTML accessibility report
9. Posts a comment on the PR with test results summary
10. Logs the scan to the Codex Pulse

**Accessibility Checks:**
- ✅ WCAG 2.1 Level A & AA compliance
- ✅ Document structure validation
- ✅ Navigation accessibility
- ✅ Color contrast checks
- ✅ Image accessibility (alt text, etc.)
- ✅ Form accessibility (labels, ARIA attributes)

## Test Specifications

### `tests/a11y.spec.ts`

Contains Playwright tests integrated with axe-core:

1. **General Accessibility Check**: Scans the entire home page for WCAG violations
2. **Document Structure**: Validates proper HTML landmarks and heading hierarchy
3. **Navigation Accessibility**: Tests navigation elements for accessibility
4. **Color Contrast**: Specifically checks for sufficient color contrast ratios
5. **Image Accessibility**: Validates images have proper alt text and ARIA attributes
6. **Form Accessibility**: Ensures forms are properly labeled and accessible

### `playwright.config.ts`

Centralized Playwright configuration:
- Uses `PLAYWRIGHT_BASE_URL` environment variable for the test base URL
- Generates HTML reports in the `a11y-report/` directory
- Configured for CI environments with retries and single worker
- Tests run in Chromium browser

## Local Development

### Prerequisites

```bash
npm install
```

### Running Tests Locally

1. Start the development server:
```bash
npm run dev
```

2. In another terminal, run the accessibility tests:
```bash
npm run test:a11y
```

3. View the HTML report:
```bash
npx playwright show-report a11y-report
```

### Running Tests Against a Specific URL

```bash
PLAYWRIGHT_BASE_URL=https://your-preview-url.netlify.app npm run test:a11y
```

## Setting Up Netlify Integration

1. **Create a Netlify Account**: Sign up at [netlify.com](https://www.netlify.com)

2. **Create a New Site**: Connect your GitHub repository

3. **Get Your Credentials**:
   - **NETLIFY_AUTH_TOKEN**: Go to User Settings > Applications > Personal Access Tokens > New Access Token
   - **NETLIFY_SITE_ID**: Found in Site Settings > General > Site details > Site ID

4. **Add Secrets to GitHub**:
   - Go to your repository Settings > Secrets and variables > Actions
   - Add `NETLIFY_AUTH_TOKEN`
   - Add `NETLIFY_SITE_ID`

## Workflow Outputs

### PR Comments

The accessibility workflow automatically posts a comment on each PR with:
- Preview URL
- Test status (passed/failed)
- Link to detailed accessibility report
- Coverage summary

### Artifacts

Both workflows generate artifacts:
- **netlify-preview-url**: Contains the preview URL (1-day retention)
- **a11y-report**: HTML accessibility report (30-day retention)

### Codex Pulse

Accessibility scans are logged to `codex-pulse.md` for traceability, including:
- Timestamp
- PR number
- Preview URL
- Test status
- Workflow run ID

## Troubleshooting

### Tests Failing Locally

1. Ensure the dev server is running on `localhost:3000`
2. Check that Playwright browsers are installed: `npx playwright install chromium`
3. Review the HTML report for specific violations

### Workflow Failing

1. Check that Netlify secrets are properly configured
2. Verify the build succeeds locally: `npm run build`
3. Review workflow logs in GitHub Actions
4. Ensure `preview.txt` artifact was created by the preview workflow

## Customization

### Adding More Test Pages

Edit `tests/a11y.spec.ts` and add new test cases:

```typescript
test('should not have accessibility issues on pricing page', async ({ page }) => {
  await page.goto('/pricing');
  
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa'])
    .analyze();
    
  expect(results.violations).toEqual([]);
});
```

### Adjusting Test Rules

To disable specific axe-core rules:

```typescript
const results = await new AxeBuilder({ page })
  .disableRules(['color-contrast']) // Disable specific rule
  .analyze();
```

To test only specific rules:

```typescript
const results = await new AxeBuilder({ page })
  .withRules(['heading-order', 'landmark-unique'])
  .analyze();
```

## Best Practices

1. **Fix violations early**: Address accessibility issues as they're discovered
2. **Review reports**: Don't just rely on automated tests; review the HTML reports
3. **Test interactively**: Automated tests can't catch everything; test with keyboard navigation
4. **Use semantic HTML**: Proper HTML structure prevents many accessibility issues
5. **Add ARIA attributes**: Use ARIA labels and roles when semantic HTML isn't sufficient

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [axe-core Documentation](https://github.com/dequelabs/axe-core)
- [Playwright Documentation](https://playwright.dev/)
- [Netlify Deploy Action](https://github.com/nwtgck/actions-netlify)

## Support

For issues or questions about the accessibility testing workflows:
1. Check the workflow logs in GitHub Actions
2. Review this documentation
3. Open an issue in the repository
