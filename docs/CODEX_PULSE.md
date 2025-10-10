# Codex Pulse: Accessibility Testing

This repository uses **Codex Pulse** to automatically test for accessibility compliance on every pull request. Codex Pulse integrates Playwright and axe-core to detect WCAG 2.0/2.1 violations and provide actionable feedback.

## 🎯 Features

- **Automated Testing**: Runs on every pull request and push to main
- **Dual Artifacts**: Machine-readable JSON and human-readable Markdown
- **PR Comments**: Immediate feedback posted directly on pull requests
- **Schema Validation**: Consistent artifact structure via JSON Schema
- **Detailed Reports**: Severity-based violations with fix recommendations

## 📊 Artifact Formats

### JSON Artifact (`codex-pulse.json`)

Machine-readable format following the schema defined in `codex-pulse-schema.json`:

```json
{
  "version": "1.0.0",
  "timestamp": "2025-10-10T15:08:35.654Z",
  "metadata": {
    "repository": "owner/repo",
    "commit": "abc123",
    "branch": "feature-branch",
    "pullRequest": 10
  },
  "summary": {
    "totalViolations": 3,
    "criticalCount": 1,
    "seriousCount": 1,
    "moderateCount": 1,
    "minorCount": 0
  },
  "violations": [...]
}
```

### Markdown Artifact (`codex-pulse.md`)

Human-readable report with:
- Executive summary with violation counts
- Violations grouped by severity (Critical, Serious, Moderate, Minor)
- Detailed information for each violation
- Links to documentation
- Actionable next steps

## 🚀 Running Tests Locally

```bash
# Install dependencies
npm install

# Run accessibility tests
npm run test:a11y
```

## 🛠️ How It Works

1. **Workflow Trigger**: The `a11y-smoke.yml` workflow runs on PR events
2. **Test Execution**: Playwright + axe-core scans all pages
3. **Artifact Generation**: Results are converted to Codex Pulse format
4. **Artifact Upload**: JSON, Markdown, and HTML reports are uploaded
5. **PR Comment**: Markdown report is posted as a PR comment

## 📋 Violation Severity Levels

| Level | Description | Example |
|-------|-------------|---------|
| 🔴 **Critical** | Blocker for screen readers | Missing alt text |
| 🟠 **Serious** | Major usability issues | Color contrast failures |
| 🟡 **Moderate** | Important but not blocking | Heading order issues |
| 🔵 **Minor** | Best practice violations | Missing ARIA labels |

## 🔧 Configuration

### Workflow: `.github/workflows/a11y-smoke.yml`

Controls when and how tests run. Key features:
- Runs on pull requests and main branch pushes
- Continues even if violations are found (doesn't block PRs)
- Posts results as PR comments

### Test Configuration: `playwright-a11y.config.js`

Defines test behavior:
- Browser: Chromium
- Test directory: `tests/a11y/`
- Reports: JSON, HTML, and list formats

### Schema: `codex-pulse-schema.json`

Defines the structure of Codex Pulse JSON artifacts for consistency and validation.

## 📖 Best Practices

1. **Address Critical Issues First**: Focus on violations that block accessibility
2. **Use Documentation Links**: Each violation includes a link to detailed guidance
3. **Test Locally**: Run tests before pushing to catch issues early
4. **Track Progress**: Use the PR comments to track fixes across commits

## 🤝 Contributing

When contributing, ensure your changes don't introduce new accessibility violations:

1. Run `npm run test:a11y` locally
2. Review any violations in the console output
3. Fix critical and serious violations before requesting review
4. Check the PR comment for the latest test results

## 📚 Resources

- [axe-core Rules](https://github.com/dequelabs/axe-core/blob/develop/doc/rule-descriptions.md)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Playwright Accessibility Testing](https://playwright.dev/docs/accessibility-testing)
- [Deque University](https://dequeuniversity.com/rules/)

---

*Powered by Playwright + axe-core | Schema version 1.0.0*
