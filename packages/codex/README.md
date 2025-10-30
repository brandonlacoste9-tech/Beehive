# @foundry/codex

Codex CLI for automated SAST remediation using LLM-powered code fixes.

## Overview

This package provides a command-line tool that:
- Reads SAST security reports (e.g., `gl-sast-report.json`)
- Filters high and critical severity findings
- Uses OpenAI/Codex to generate minimal unified diff patches
- Applies patches automatically (with fallback for manual review)

## Installation

From the monorepo root:

```bash
pnpm install
```

## Usage

### Basic usage

```bash
# From monorepo root
pnpm --filter ./packages/codex remediate --report ./gl-sast-report.json

# Or directly
node packages/codex/bin/remediate.js --report ./path/to/sast-report.json
```

### Options

- `--report`, `-s`: Path to SAST report JSON file (default: `gl-sast-report.json`)
- `--output`, `-o`: Output directory for patches (default: `codex_patches`)

### Environment Variables

- `OPENAI_API_KEY`: **Required**. Your OpenAI API key for Codex/GPT access.

## How It Works

1. **Parse SAST Report**: Reads the JSON report and filters HIGH/CRITICAL findings
2. **Generate Prompts**: Creates focused prompts for each finding with file context
3. **Request Patches**: Calls OpenAI to generate minimal unified diff patches
4. **Apply Patches**: Attempts to apply patches via `git apply`
5. **Manual Review**: Patches that fail to apply cleanly are saved for review

## Security Considerations

⚠️ **Important Security Notes:**

- This tool modifies code automatically. Always review generated patches.
- Only run in CI with appropriate safeguards (fork protection, human approval).
- Never run on untrusted SAST reports or in production environments.
- Store `OPENAI_API_KEY` securely in GitHub Secrets, never commit it.

## CI Integration

This package is designed to work with the `codex-remediation.yml` GitHub Actions workflow. See `.github/workflows/codex-remediation.yml` for the automated CI setup.

## Example Output

```
SAST report not found at gl-sast-report.json
No high/critical findings.
```

Or when findings exist:

```
Requesting patch from OpenAI for /path/to/vulnerable.js
Wrote patch: codex_patches/1-vulnerable.js.diff
Patch applied successfully (git apply).
```

## Development

To test locally:

```bash
cd packages/codex
npm install
node bin/remediate.js --report ../../test-sast-report.json
```

## License

MIT
