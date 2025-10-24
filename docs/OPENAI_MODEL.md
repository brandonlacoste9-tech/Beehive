## Azure OpenAI — configuration & notes

### TOML provider (example)
Add this to your `codex.toml` under `[model_providers]`:

```toml
[model_providers.azure]
name = "Azure"
# Replace YOUR_PROJECT_NAME with the correct subdomain/path for your Azure OpenAI instance.
base_url = "https://YOUR_PROJECT_NAME.openai.azure.com/openai"

# Azure requires an `api-key` header (not a Bearer Authorization header).
# Use env_http_headers so the header is added only when AZURE_OPENAI_API_KEY is set and non-empty.
env_http_headers = { "api-key" = "AZURE_OPENAI_API_KEY" }

# Responses API on Azure typically requires an api-version query param.
query_params = { api-version = "2025-04-01-preview" }

# Use 'responses' for the Responses API. The loader will choose /responses accordingly.
wire_api = "responses"

# Optionally set your Azure deployment name (or leave blank to use OPENAI_MODEL or root model).
model = "your-azure-deployment-name"
```

### Why `env_http_headers` instead of `env_key`

Azure expects an `api-key: <key>` header. Our loader’s `env_key` injects `Authorization: Bearer <token>`, which Azure will not accept. `env_http_headers` maps a header to an env var and adds that header only when the env var is present and non-empty.

### How the loader composes requests

* Endpoint built by loader (example):

```
https://YOUR_PROJECT_NAME.openai.azure.com/openai/responses?api-version=2025-04-01-preview
```

* `meta.model` (from `model` in TOML, root model, or `OPENAI_MODEL`) should be included in the request body for the Responses API (Azure expects model/deployment in the payload).
* Headers will include:

  * `api-key: <AZURE_OPENAI_API_KEY>`
  * `Content-Type: application/json` (if not overridden)

### Quick smoke tests

**JS**

```bash
export CODEX_CONFIG_PATH=config/models.toml
export AZURE_OPENAI_API_KEY="your-azure-api-key"
node scripts/test-config.js    # prints url, meta.model, wire_api, headers
```

**Python**

```bash
CODEX_CONFIG_PATH=config/models.toml AZURE_OPENAI_API_KEY=your-azure-api-key python scripts/test-config.py
```

### CI / secrets

* Add `AZURE_OPENAI_API_KEY` to CI secrets.
* Ensure the `model` value is a valid Azure deployment name, or pass `OPENAI_MODEL` to override.
