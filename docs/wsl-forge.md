# WSL Forge Ritual — Codex Binary Smoke Test

> Purpose: restore confidence that the Codex Netlify function can be exercised from a Windows Subsystem for Linux (WSL) shell without native toolchain drift.

## 1. Verify the forge

1. Launch PowerShell as Administrator and run `wsl --status`.
2. Confirm the default distribution is WSL 2. If not, run:
   ```powershell
   wsl --set-default-version 2
   ```
3. Inside your chosen distribution, update the base packages:
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```
4. Ensure Git is available (`git --version`). Windows Git wrappers can corrupt file permissions; prefer the distro package.

## 2. Install the Codex toolchain inside WSL

1. Install `nvm`:
   ```bash
   curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
   source "$HOME/.nvm/nvm.sh"
   ```
2. Pin Node.js 20 (Netlify Functions default runtime):
   ```bash
   nvm install 20
   nvm use 20
   ```
3. Install the Netlify CLI locally so the Codex function can be invoked:
   ```bash
   npm install --global netlify-cli
   ```

## 3. Clone & prepare the Hive inside WSL

```bash
mkdir -p ~/workspace && cd ~/workspace
# If you already cloned via Windows, re-clone inside WSL to avoid CRLF issues.
git clone https://github.com/<org>/Beehive.git
cd Beehive
```

1. If the repository was checked out without a manifest, bootstrap one:
   ```bash
   npm init -y
   ```
2. Install dependencies (the repository is Next.js-based but intentionally lean):
   ```bash
   npm install
   ```
3. Export environment variables expected by the Codex workflow:
   ```bash
   export SITE_URL="https://<your-netlify-site>.netlify.app"
   export CODEX_MAX_OUTPUT_TOKENS=800   # Optional tuning
   ```

## 4. Invoke the Codex binary locally

Use Netlify CLI to run the function in isolation. The helper script ensures the JSON payload matches the GitHub Action:

```bash
cat <<'JSON' > payload.json
{
  "repo": "local/forge",
  "pr": 0,
  "base": "deadbeef",
  "head": "cafebabe",
  "title": "WSL Forge Smoke",
  "body": "Dry-run of Codex review from WSL",
  "diff": "diff --git a/example.ts b/example.ts\n--- a/example.ts\n+++ b/example.ts\n+console.log('forge online');\n",
  "maxOutputTokens": 400
}
JSON

netlify functions:invoke codex_review --payload-file=payload.json
```

If the invocation returns findings, the Codex binary is operational. Failures commonly stem from:

- Missing or incorrect `SITE_URL` (the Netlify AI Gateway proxy).
- No AI credits remaining on the linked Netlify account.
- Corporate firewalls blocking outbound HTTPS from WSL (whitelist `netlify.app`).

## 5. Record the ritual

After a successful dry-run, record the session in the Hive ledger:

1. Add an entry to `CHANGELOG.md` under the current draft release noting that WSL forge validation passed.
2. Update `scrolls/scroll_index.json` if you promote the forge ritual from draft to active.
3. Share findings in StudioShare / CodexReplay with metadata (jobId, status) pulled from the CLI output.

With the forge stabilized, local scribes can rely on the Codex binary while iterating on BeeHive features.
