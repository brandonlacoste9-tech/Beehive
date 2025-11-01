# Vercel Sandbox Examples

This directory contains examples demonstrating how to use Vercel Sandbox in the AdGenXAI project.

## What is Vercel Sandbox?

Vercel Sandbox is an ephemeral compute primitive designed to safely run untrusted or user-generated code on Vercel. It supports dynamic, real-time workloads for AI agents, code generation, and developer experimentation.

### Use Cases

- **Execute untrusted or third-party code**: Run code that has not been reviewed, such as AI agent output or user uploads, without exposing your production systems.
- **Build dynamic, interactive experiences**: Create tools that generate or modify code on the fly, such as AI-powered UI builders or developer sandboxes.
- **Test backend logic in isolation**: Preview how user-submitted or agent-generated code behaves in a self-contained environment.
- **Run development servers**: Test your application in an isolated environment.

## Prerequisites

- [Vercel CLI](https://vercel.com/docs/cli)
- Node.js 18+
- A Vercel account and project

## Authentication Setup

### Option 1: Using OIDC Token (Recommended)

1. Link your project:
   ```bash
   vercel link
   ```

2. Pull environment variables:
   ```bash
   vercel env pull
   ```

   This creates a `.env.local` file with a `VERCEL_OIDC_TOKEN` that the SDK will use automatically.

   **Note**: Development tokens expire after 12 hours. Run `vercel env pull` again to refresh.

### Option 2: Using Access Token

If you want to use the SDK from an environment where `VERCEL_OIDC_TOKEN` is unavailable:

1. Get your [Vercel Team ID](https://vercel.com/docs/accounts#find-your-team-id)
2. Get your [Vercel Project ID](https://vercel.com/docs/project-configuration/general-settings#project-id)
3. Create a [Vercel Access Token](https://vercel.com/docs/rest-api/reference/welcome#creating-an-access-token)

4. Add to `.env.local`:
   ```env
   VERCEL_TEAM_ID=your_team_id
   VERCEL_PROJECT_ID=your_project_id
   VERCEL_TOKEN=your_access_token
   ```

## Examples

### 1. Next.js Development Server (`next-dev.ts`)

Demonstrates how to:
- Clone a GitHub repository
- Install dependencies
- Run a Next.js development server
- Access the sandbox URL

```bash
node --env-file .env.local --experimental-strip-types ./examples/sandbox/next-dev.ts
```

### 2. Python Application (`python-example.ts`)

Shows how to:
- Create a Python sandbox
- Install Python packages with pip
- Run a Python application

```bash
node --env-file .env.local --experimental-strip-types ./examples/sandbox/python-example.ts
```

### 3. Install System Packages (`install-packages.ts`)

Demonstrates:
- Installing system packages with dnf
- Running commands with sudo
- Verifying installed packages

```bash
node --env-file .env.local --experimental-strip-types ./examples/sandbox/install-packages.ts
```

### 4. Using Helper Functions (`using-helpers.ts`)

Shows how to use the utility functions from `lib/sandbox.ts`:
- `createSandbox()` - Simplified sandbox creation
- `runSandboxCommand()` - Execute commands
- `getSandboxUrl()` - Get public URLs
- `installPackages()` - Install system packages
- `stopSandbox()` - Stop a running sandbox

```bash
node --env-file .env.local --experimental-strip-types ./examples/sandbox/using-helpers.ts
```

## System Specifications

### Runtimes

- **node22**: Node.js 22 with npm and pnpm
- **python3.13**: Python 3.13 with pip and uv

### Base System

Amazon Linux 2023 with pre-installed packages:
- `bind-utils`, `bzip2`, `findutils`, `git`, `gzip`, `iputils`
- `libicu`, `libjpeg`, `libpng`, `ncurses-libs`
- `openssl`, `openssl-libs`, `procps`, `tar`, `unzip`, `which`, `whois`, `zstd`

### Additional Packages

Install additional packages using `dnf`:

```typescript
await sandbox.runCommand({
  cmd: 'dnf',
  args: ['install', '-y', 'golang'],
  sudo: true,
});
```

See [Amazon Linux package list](https://docs.aws.amazon.com/linux/al2023/release-notes/all-packages-AL2023.7.html).

## Resource Limits

- **Default vCPUs**: 4
- **Default timeout**: 5 minutes
- **Maximum timeout**: 
  - Hobby: 45 minutes
  - Pro/Enterprise: 5 hours
- **Working directory**: `/vercel/sandbox`
- **User**: `vercel-sandbox`
- **Sudo access**: Available

## Observability

### View Sandboxes

1. Go to your Vercel project dashboard
2. Click the **Observability** tab
3. Click **Sandboxes** on the left sidebar

Here you can:
- View active and stopped sandboxes
- Inspect command history
- View sandbox URLs
- Stop running sandboxes

### Track Usage

Go to the **Usage** tab in your Vercel dashboard to track compute usage across all projects.

## Utility Functions

The `lib/sandbox.ts` module provides helper functions:

### `createSandbox(config: SandboxConfig)`

Simplified sandbox creation with sensible defaults.

```typescript
const sandbox = await createSandbox({
  sourceUrl: 'https://github.com/user/repo.git',
  vcpus: 4,
  timeout: '10m',
  ports: [3000],
  runtime: 'node22',
});
```

### `runSandboxCommand(sandbox, options)`

Execute commands in the sandbox.

```typescript
await runSandboxCommand(sandbox, {
  cmd: 'npm',
  args: ['install'],
  stdout: process.stdout,
  stderr: process.stderr,
});
```

### `getSandboxUrl(sandbox, port)`

Get the public URL for a port.

```typescript
const url = getSandboxUrl(sandbox, 3000);
console.log(`Server: ${url}`);
```

### `installPackages(sandbox, packages)`

Install system packages.

```typescript
await installPackages(sandbox, ['golang', 'redis']);
```

### `stopSandbox(sandbox)`

Stop a running sandbox.

```typescript
await stopSandbox(sandbox);
```

## Integration with AdGenXAI

These sandbox utilities can be integrated into the AdGenXAI platform to:

1. **AI-Generated Code Testing**: Test AI-generated advertising creative code in isolation
2. **User-Submitted Code**: Safely run user-submitted creative templates
3. **Preview Environments**: Create temporary preview environments for creative campaigns
4. **Development Sandboxes**: Provide users with isolated development environments

## Additional Resources

- [Vercel Sandbox Documentation](https://vercel.com/docs/workflow-collaboration/vercel-sandbox)
- [Vercel Sandbox SDK Reference](https://vercel.com/docs/workflow-collaboration/vercel-sandbox/sdk-reference)
- [Vercel Sandbox Pricing](https://vercel.com/docs/workflow-collaboration/vercel-sandbox/pricing)
- [Vercel CLI Documentation](https://vercel.com/docs/cli)

## Troubleshooting

### Token Expired

If you see authentication errors, your OIDC token may have expired:

```bash
vercel env pull
```

### Sandbox Timeout

If your sandbox times out before completing, increase the timeout:

```typescript
timeout: ms('20m'), // 20 minutes
```

### Port Already in Use

If a port is already in use, specify different ports:

```typescript
ports: [3001, 8080],
```

### Command Failed

Check the exit code and error output:

```typescript
const result = await sandbox.runCommand({...});
if (result.exitCode !== 0) {
  console.error('Command failed with exit code:', result.exitCode);
}
```
