/**
 * Vercel Sandbox - Using Helper Functions Example
 * 
 * This example demonstrates how to use the sandbox utility functions
 * from lib/sandbox.ts
 * 
 * To run this example:
 * 1. Set up authentication (see README.md)
 * 2. Run: node --env-file .env.local --experimental-strip-types ./examples/sandbox/using-helpers.ts
 */

import {
  createSandbox,
  runSandboxCommand,
  getSandboxUrl,
  stopSandbox,
  installPackages,
} from '../../lib/sandbox';

async function main() {
  console.log('Creating sandbox using helper functions...');
  
  // Create a sandbox with simplified configuration
  const sandbox = await createSandbox({
    sourceUrl: 'https://github.com/vercel/sandbox-example-next.git',
    vcpus: 4,
    timeout: '10m',
    ports: [3000],
    runtime: 'node22',
  });

  console.log('Sandbox created successfully!');

  // Install dependencies
  console.log('\nInstalling npm dependencies...');
  const installResult = await runSandboxCommand(sandbox, {
    cmd: 'npm',
    args: ['install'],
    stdout: process.stdout,
    stderr: process.stderr,
  });

  if (installResult.exitCode !== 0) {
    console.log('Installation failed');
    process.exit(1);
  }

  // Start development server
  console.log('\nStarting development server...');
  await runSandboxCommand(sandbox, {
    cmd: 'npm',
    args: ['run', 'dev'],
    detached: true,
    stdout: process.stdout,
    stderr: process.stderr,
  });

  // Get the sandbox URL
  const url = getSandboxUrl(sandbox, 3000);
  console.log(`\n✅ Development server running at: ${url}`);

  // Optionally install additional system packages
  console.log('\nInstalling additional system packages...');
  await installPackages(sandbox, ['git', 'curl']);
  
  console.log('\n✅ Setup complete!');
  console.log('\nTo stop the sandbox, run the stop-sandbox.ts example');
  console.log('or call stopSandbox(sandbox) in your code');
}

main().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
