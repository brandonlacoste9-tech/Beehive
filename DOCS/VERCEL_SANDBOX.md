# Vercel Sandbox Integration

## Overview

Vercel Sandbox is integrated into AdGenXAI to provide a secure, ephemeral compute environment for running untrusted or user-generated code. This enables safe execution of AI-generated creative code, user-submitted templates, and isolated testing environments.

## Architecture

### Components

1. **Sandbox Utilities** (`lib/sandbox.ts`)
   - Core sandbox creation and management functions
   - Type-safe wrapper around Vercel Sandbox SDK
   - Helper functions for common operations

2. **Example Implementations** (`examples/sandbox/`)
   - Next.js development server example
   - Python application example
   - System package installation example
   - Helper function usage examples

3. **Authentication**
   - OIDC token authentication (recommended)
   - Access token authentication (alternative)

## Use Cases in AdGenXAI

### 1. AI-Generated Creative Testing

Test AI-generated advertising creative code in isolated sandboxes before deployment:

```typescript
import { createSandbox, runSandboxCommand } from '@/lib/sandbox';

async function testAIGeneratedCreative(code: string, repoUrl: string) {
  const sandbox = await createSandbox({
    sourceUrl: repoUrl,
    vcpus: 2,
    timeout: '5m',
    ports: [3000],
  });

  // Deploy and test the creative
  await runSandboxCommand(sandbox, {
    cmd: 'npm',
    args: ['run', 'build'],
    stdout: process.stdout,
  });

  return getSandboxUrl(sandbox, 3000);
}
```

### 2. User-Submitted Creative Templates

Safely execute user-submitted creative templates without risking the production environment:

```typescript
async function runUserTemplate(templateRepo: string) {
  const sandbox = await createSandbox({
    sourceUrl: templateRepo,
    vcpus: 4,
    timeout: '10m',
    runtime: 'node22',
  });

  // Install dependencies and run
  await runSandboxCommand(sandbox, {
    cmd: 'npm',
    args: ['install'],
  });

  await runSandboxCommand(sandbox, {
    cmd: 'npm',
    args: ['start'],
    detached: true,
  });

  return sandbox;
}
```

### 3. Creative Campaign Previews

Create temporary preview environments for creative campaigns:

```typescript
async function createCampaignPreview(campaignId: string) {
  const sandbox = await createSandbox({
    sourceUrl: `https://github.com/yourorg/campaign-${campaignId}.git`,
    timeout: '30m',
    ports: [3000],
  });

  // Set up campaign preview
  await runSandboxCommand(sandbox, {
    cmd: 'npm',
    args: ['run', 'preview'],
    detached: true,
  });

  return {
    previewUrl: getSandboxUrl(sandbox, 3000),
    sandboxId: sandbox.id,
  };
}
```

### 4. Development Sandboxes for Users

Provide users with isolated development environments for creating custom creatives:

```typescript
async function createUserSandbox(userId: string, projectTemplate: string) {
  const sandbox = await createSandbox({
    sourceUrl: projectTemplate,
    vcpus: 4,
    timeout: '2h', // Extended for development
    ports: [3000, 8080],
  });

  // Set up development environment
  await runSandboxCommand(sandbox, {
    cmd: 'npm',
    args: ['install'],
  });

  await installPackages(sandbox, ['git', 'vim']);

  return {
    editorUrl: getSandboxUrl(sandbox, 3000),
    apiUrl: getSandboxUrl(sandbox, 8080),
  };
}
```

## API Integration

### Creating Sandboxes via API

You can expose sandbox creation through your API routes:

```typescript
// app/api/sandbox/create/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createSandbox } from '@/lib/sandbox';

export async function POST(req: NextRequest) {
  try {
    const { sourceUrl, timeout, vcpus } = await req.json();

    const sandbox = await createSandbox({
      sourceUrl,
      timeout: timeout || '10m',
      vcpus: vcpus || 4,
      ports: [3000],
    });

    return NextResponse.json({
      success: true,
      sandboxUrl: sandbox.domain(3000),
      sandboxId: (sandbox as any).id,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to create sandbox' },
      { status: 500 }
    );
  }
}
```

## Security Considerations

### Isolation

- Sandboxes run in isolated environments separate from production
- Each sandbox has its own file system and network
- User code runs as `vercel-sandbox` user with limited privileges

### Resource Limits

- CPU and memory are limited by vCPU allocation
- Timeout ensures sandboxes don't run indefinitely
- Maximum timeout enforced based on plan (45min Hobby, 5h Pro/Enterprise)

### Code Validation

Before running user code in sandboxes:

```typescript
import { validateUserCode } from '@/lib/validation';

async function safeExecuteUserCode(code: string, repoUrl: string) {
  // Validate code before sandbox execution
  const validation = await validateUserCode(code);
  
  if (!validation.safe) {
    throw new Error('Code validation failed: ' + validation.reason);
  }

  // Proceed with sandbox execution
  const sandbox = await createSandbox({
    sourceUrl: repoUrl,
    timeout: '5m',
  });
  
  // ... execute code
}
```

### Authentication

Always use proper authentication:

```typescript
// Use OIDC token (recommended)
const sandbox = await Sandbox.create({
  // VERCEL_OIDC_TOKEN from environment
  source: { url: repoUrl, type: 'git' },
  // ...
});

// Or use access token
const sandbox = await Sandbox.create({
  teamId: process.env.VERCEL_TEAM_ID,
  projectId: process.env.VERCEL_PROJECT_ID,
  token: process.env.VERCEL_TOKEN,
  source: { url: repoUrl, type: 'git' },
  // ...
});
```

## Monitoring and Observability

### Viewing Sandboxes

1. Navigate to your Vercel project
2. Go to **Observability** > **Sandboxes**
3. View:
   - Active and stopped sandboxes
   - Command history
   - Sandbox URLs
   - Resource usage

### Programmatic Monitoring

```typescript
// Track sandbox lifecycle
async function monitorSandbox(sandbox: Sandbox) {
  console.log('Sandbox created:', (sandbox as any).id);
  
  // Run commands and track results
  const result = await runSandboxCommand(sandbox, {
    cmd: 'npm',
    args: ['test'],
  });

  console.log('Test exit code:', result.exitCode);
  
  // Clean up
  await stopSandbox(sandbox);
  console.log('Sandbox stopped');
}
```

### Usage Tracking

Monitor compute usage in the Vercel dashboard:
- **Usage** tab > **Sandbox compute**
- Track usage across all projects
- Monitor costs and quota

## Best Practices

### 1. Always Set Timeouts

```typescript
const sandbox = await createSandbox({
  sourceUrl: repoUrl,
  timeout: '10m', // Always specify timeout
});
```

### 2. Clean Up Resources

```typescript
try {
  const sandbox = await createSandbox({...});
  // ... use sandbox
} finally {
  await stopSandbox(sandbox);
}
```

### 3. Handle Errors Gracefully

```typescript
const result = await runSandboxCommand(sandbox, {
  cmd: 'npm',
  args: ['build'],
});

if (result.exitCode !== 0) {
  console.error('Build failed');
  await stopSandbox(sandbox);
  throw new Error('Sandbox build failed');
}
```

### 4. Use Appropriate Resource Allocation

```typescript
// For simple tasks
const sandbox = await createSandbox({
  vcpus: 2,
  timeout: '5m',
});

// For complex builds
const sandbox = await createSandbox({
  vcpus: 4,
  timeout: '20m',
});
```

### 5. Stream Output for Long-Running Commands

```typescript
await runSandboxCommand(sandbox, {
  cmd: 'npm',
  args: ['run', 'build'],
  stdout: process.stdout,
  stderr: process.stderr,
});
```

## Cost Optimization

### Minimize Sandbox Lifetime

- Use appropriate timeouts
- Stop sandboxes when done
- Avoid keeping sandboxes idle

### Right-Size Resources

- Use 2 vCPUs for simple tasks
- Use 4 vCPUs for builds and complex operations
- Don't over-allocate resources

### Batch Operations

```typescript
// Instead of multiple sandboxes
// Use one sandbox for multiple operations
const sandbox = await createSandbox({...});

await runSandboxCommand(sandbox, { cmd: 'task1' });
await runSandboxCommand(sandbox, { cmd: 'task2' });
await runSandboxCommand(sandbox, { cmd: 'task3' });

await stopSandbox(sandbox);
```

## Integration Examples

See the `examples/sandbox/` directory for complete working examples:

- `next-dev.ts` - Next.js development server
- `python-example.ts` - Python application
- `install-packages.ts` - System package installation
- `using-helpers.ts` - Using utility functions

## Additional Resources

- [Vercel Sandbox Documentation](https://vercel.com/docs/workflow-collaboration/vercel-sandbox)
- [Vercel Sandbox SDK Reference](https://vercel.com/docs/workflow-collaboration/vercel-sandbox/sdk-reference)
- [Vercel Sandbox Pricing](https://vercel.com/docs/workflow-collaboration/vercel-sandbox/pricing)
- [Example Repository](https://github.com/vercel/sandbox-example-next)

## Support

For issues or questions:
- Check the [Vercel Sandbox documentation](https://vercel.com/docs/workflow-collaboration/vercel-sandbox)
- Contact AdGenXAI support at support@adgenxai.pro
- Open an issue on the [GitHub repository](https://github.com/brandonlacoste9-tech/Beehive/issues)
