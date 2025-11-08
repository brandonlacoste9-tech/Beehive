/**
 * Vercel Sandbox Utilities
 * 
 * This module provides utilities for creating and managing Vercel Sandboxes
 * for running untrusted or user-generated code safely.
 * 
 * @see https://vercel.com/docs/workflow-collaboration/vercel-sandbox
 */

import { Sandbox } from '@vercel/sandbox';
import ms from 'ms';

export interface SandboxConfig {
  /** Git repository URL to clone */
  sourceUrl: string;
  /** Number of vCPUs to allocate (default: 4) */
  vcpus?: number;
  /** Timeout in milliseconds or time string (e.g., '10m', '5h') */
  timeout?: string | number;
  /** Ports to expose (default: [3000]) */
  ports?: number[];
  /** Runtime environment (default: 'node22') */
  runtime?: 'node22' | 'python3.13';
  /** Team ID (optional, uses VERCEL_TEAM_ID env var if not provided) */
  teamId?: string;
  /** Project ID (optional, uses VERCEL_PROJECT_ID env var if not provided) */
  projectId?: string;
  /** Access token (optional, uses VERCEL_TOKEN env var if not provided) */
  token?: string;
}

export interface SandboxCommandOptions {
  /** Command to execute */
  cmd: string;
  /** Command arguments */
  args?: string[];
  /** Run command in detached mode */
  detached?: boolean;
  /** Standard output stream */
  stdout?: NodeJS.WritableStream;
  /** Standard error stream */
  stderr?: NodeJS.WritableStream;
  /** Run with sudo privileges */
  sudo?: boolean;
}

/**
 * Creates a new Vercel Sandbox with the specified configuration
 * 
 * @param config - Sandbox configuration options
 * @returns Promise resolving to the created Sandbox instance
 * 
 * @example
 * ```typescript
 * const sandbox = await createSandbox({
 *   sourceUrl: 'https://github.com/vercel/sandbox-example-next.git',
 *   vcpus: 4,
 *   timeout: '10m',
 *   ports: [3000],
 * });
 * ```
 */
export async function createSandbox(config: SandboxConfig): Promise<Sandbox> {
  let timeoutMs: number;
  if (typeof config.timeout === 'string') {
    // Parse time string to milliseconds (e.g., '5m' -> 300000)
    // Note: `as any` is needed here because TypeScript cannot properly narrow
    // the string type to ms.StringValue within the type guard. The ms() function
    // safely handles any string and returns a number when given a time string.
    timeoutMs = Number(ms(config.timeout as any));
  } else if (typeof config.timeout === 'number') {
    timeoutMs = config.timeout;
  } else {
    timeoutMs = 300000; // Default: 5 minutes
  }

  const sandboxConfig: any = {
    source: {
      url: config.sourceUrl,
      type: 'git',
    },
    resources: { vcpus: config.vcpus || 4 },
    timeout: timeoutMs,
    ports: config.ports || [3000],
    runtime: config.runtime || 'node22',
  };

  // Add authentication credentials if provided
  if (config.teamId) {
    sandboxConfig.teamId = config.teamId;
  }
  if (config.projectId) {
    sandboxConfig.projectId = config.projectId;
  }
  if (config.token) {
    sandboxConfig.token = config.token;
  }

  return await Sandbox.create(sandboxConfig);
}

/**
 * Runs a command in the sandbox
 * 
 * @param sandbox - The Sandbox instance
 * @param options - Command options
 * @returns Promise resolving to the command result
 * 
 * @example
 * ```typescript
 * const result = await runSandboxCommand(sandbox, {
 *   cmd: 'npm',
 *   args: ['install'],
 *   stdout: process.stdout,
 *   stderr: process.stderr,
 * });
 * ```
 */
export async function runSandboxCommand(
  sandbox: Sandbox,
  options: SandboxCommandOptions
): Promise<any> {
  const params: any = {
    cmd: options.cmd,
    args: options.args || [],
    detached: options.detached || false,
    stdout: options.stdout,
    stderr: options.stderr,
    sudo: options.sudo || false,
  };
  
  return await sandbox.runCommand(params);
}

/**
 * Gets the public URL for a port in the sandbox
 * 
 * @param sandbox - The Sandbox instance
 * @param port - The port number
 * @returns The public URL for the port
 * 
 * @example
 * ```typescript
 * const url = getSandboxUrl(sandbox, 3000);
 * console.log(`Development server: ${url}`);
 * ```
 */
export function getSandboxUrl(sandbox: Sandbox, port: number): string {
  return sandbox.domain(port);
}

/**
 * Stops a running sandbox
 * 
 * @param sandbox - The Sandbox instance to stop
 * 
 * @example
 * ```typescript
 * await stopSandbox(sandbox);
 * console.log('Sandbox stopped');
 * ```
 */
export async function stopSandbox(sandbox: Sandbox): Promise<void> {
  await sandbox.stop();
}

/**
 * Installs additional system packages in the sandbox
 * 
 * @param sandbox - The Sandbox instance
 * @param packages - Array of package names to install
 * @returns Promise resolving to the command result
 * 
 * @example
 * ```typescript
 * await installPackages(sandbox, ['golang', 'redis']);
 * ```
 */
export async function installPackages(
  sandbox: Sandbox,
  packages: string[]
): Promise<any> {
  return await sandbox.runCommand({
    cmd: 'dnf',
    args: ['install', '-y', ...packages],
    sudo: true,
    stdout: process.stdout,
    stderr: process.stderr,
  });
}
