/**
 * Vercel Sandbox - Next.js Dev Server Example
 * 
 * This example demonstrates how to:
 * - Clone a GitHub repository into a sandbox
 * - Install dependencies
 * - Run a Next.js development server
 * - Access the sandbox URL
 * 
 * To run this example:
 * 1. Set up authentication (see README.md)
 * 2. Run: node --env-file .env.local --experimental-strip-types ./examples/sandbox/next-dev.ts
 */

import ms from 'ms';
import { Sandbox } from '@vercel/sandbox';
import { setTimeout } from 'timers/promises';
import { spawn } from 'child_process';

async function main() {
  console.log('Creating Vercel Sandbox...');
  
  const sandbox = await Sandbox.create({
    source: {
      url: 'https://github.com/vercel/sandbox-example-next.git',
      type: 'git',
    },
    resources: { vcpus: 4 },
    // Timeout in milliseconds: ms('10m') = 600000
    // Defaults to 5 minutes. The maximum is 5 hours for Pro/Enterprise, and 45 minutes for Hobby.
    timeout: ms('10m'),
    ports: [3000],
    runtime: 'node22',
  });

  console.log('Sandbox created successfully!');
  console.log(`Sandbox ID: ${(sandbox as any).id || 'N/A'}`);

  console.log(`\nInstalling dependencies...`);
  const install = await sandbox.runCommand({
    cmd: 'npm',
    args: ['install', '--loglevel', 'info'],
    stderr: process.stderr,
    stdout: process.stdout,
  });

  if (install.exitCode != 0) {
    console.log('Installing packages failed');
    process.exit(1);
  }

  console.log(`\nStarting the development server...`);
  await sandbox.runCommand({
    cmd: 'npm',
    args: ['run', 'dev'],
    stderr: process.stderr,
    stdout: process.stdout,
    detached: true,
  });

  // Wait for server to start
  await setTimeout(500);
  
  const sandboxUrl = sandbox.domain(3000);
  console.log(`\n✅ Development server running at: ${sandboxUrl}`);
  console.log('\nOpening sandbox URL in browser...');
  
  // Try to open in browser (works on macOS)
  spawn('open', [sandboxUrl]);

  console.log('\nSandbox will stop after the 10 minute timeout.');
  console.log('To stop manually, use the Vercel dashboard or call sandbox.stop()');
}

main().catch((error) => {
  console.error('Error running sandbox:', error);
  process.exit(1);
});
