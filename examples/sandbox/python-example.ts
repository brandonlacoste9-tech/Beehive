/**
 * Vercel Sandbox - Python Example
 * 
 * This example demonstrates how to:
 * - Create a Python sandbox
 * - Install Python packages
 * - Run Python code
 * 
 * To run this example:
 * 1. Set up authentication (see README.md)
 * 2. Run: node --env-file .env.local --experimental-strip-types ./examples/sandbox/python-example.ts
 */

import ms from 'ms';
import { Sandbox } from '@vercel/sandbox';

async function main() {
  console.log('Creating Python Sandbox...');
  
  const sandbox = await Sandbox.create({
    source: {
      url: 'https://github.com/vercel/sandbox-example-python.git',
      type: 'git',
    },
    resources: { vcpus: 2 },
    timeout: ms('5m'),
    ports: [8000],
    runtime: 'python3.13',
  });

  console.log('Sandbox created successfully!');

  console.log('\nInstalling Python dependencies...');
  const install = await sandbox.runCommand({
    cmd: 'pip',
    args: ['install', '-r', 'requirements.txt'],
    stderr: process.stderr,
    stdout: process.stdout,
  });

  if (install.exitCode !== 0) {
    console.log('Installing packages failed');
    process.exit(1);
  }

  console.log('\nRunning Python application...');
  await sandbox.runCommand({
    cmd: 'python',
    args: ['app.py'],
    stderr: process.stderr,
    stdout: process.stdout,
    detached: true,
  });

  const sandboxUrl = sandbox.domain(8000);
  console.log(`\n✅ Python application running at: ${sandboxUrl}`);
}

main().catch((error) => {
  console.error('Error running sandbox:', error);
  process.exit(1);
});
