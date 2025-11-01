/**
 * Vercel Sandbox - Install System Packages Example
 * 
 * This example demonstrates how to:
 * - Install system packages using dnf
 * - Run commands with sudo
 * - Work with additional system tools
 * 
 * To run this example:
 * 1. Set up authentication (see README.md)
 * 2. Run: node --env-file .env.local --experimental-strip-types ./examples/sandbox/install-packages.ts
 */

import { Sandbox } from '@vercel/sandbox';
import ms from 'ms';

async function main() {
  console.log('Creating Sandbox for package installation...');
  
  const sandbox = await Sandbox.create({
    source: {
      url: 'https://github.com/vercel/sandbox-example-next.git',
      type: 'git',
    },
    resources: { vcpus: 2 },
    timeout: ms('10m'),
    runtime: 'node22',
  });

  console.log('Sandbox created successfully!');

  console.log('\nInstalling system packages (golang, redis)...');
  const install = await sandbox.runCommand({
    cmd: 'dnf',
    args: ['install', '-y', 'golang', 'redis'],
    sudo: true,
    stdout: process.stdout,
    stderr: process.stderr,
  });

  if (install.exitCode !== 0) {
    console.log('Package installation failed');
    process.exit(1);
  }

  console.log('\nVerifying installed packages...');
  
  // Check Go version
  await sandbox.runCommand({
    cmd: 'go',
    args: ['version'],
    stdout: process.stdout,
    stderr: process.stderr,
  });

  // Check Redis
  await sandbox.runCommand({
    cmd: 'redis-cli',
    args: ['--version'],
    stdout: process.stdout,
    stderr: process.stderr,
  });

  console.log('\n✅ Packages installed successfully!');
  
  console.log('\nStopping sandbox...');
  await sandbox.stop();
  console.log('Sandbox stopped.');
}

main().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
