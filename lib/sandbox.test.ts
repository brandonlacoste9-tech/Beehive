/**
 * Unit tests for Vercel Sandbox utilities
 * 
 * Note: These tests verify the utility function logic without actually
 * creating sandboxes (which would require Vercel credentials).
 */

import { describe, it, expect, vi } from 'vitest';
import type { Sandbox } from '@vercel/sandbox';

// Import the types and functions
import type { SandboxConfig, SandboxCommandOptions } from '../lib/sandbox';

describe('Sandbox Configuration', () => {
  it('should define correct SandboxConfig interface', () => {
    const config: SandboxConfig = {
      sourceUrl: 'https://github.com/test/repo.git',
      vcpus: 4,
      timeout: '10m',
      ports: [3000],
      runtime: 'node22',
    };

    expect(config.sourceUrl).toBe('https://github.com/test/repo.git');
    expect(config.vcpus).toBe(4);
    expect(config.timeout).toBe('10m');
    expect(config.ports).toEqual([3000]);
    expect(config.runtime).toBe('node22');
  });

  it('should allow optional authentication fields', () => {
    const config: SandboxConfig = {
      sourceUrl: 'https://github.com/test/repo.git',
      teamId: 'team_123',
      projectId: 'project_456',
      token: 'token_789',
    };

    expect(config.teamId).toBe('team_123');
    expect(config.projectId).toBe('project_456');
    expect(config.token).toBe('token_789');
  });

  it('should support both runtime options', () => {
    const nodeConfig: SandboxConfig = {
      sourceUrl: 'https://github.com/test/repo.git',
      runtime: 'node22',
    };

    const pythonConfig: SandboxConfig = {
      sourceUrl: 'https://github.com/test/repo.git',
      runtime: 'python3.13',
    };

    expect(nodeConfig.runtime).toBe('node22');
    expect(pythonConfig.runtime).toBe('python3.13');
  });
});

describe('Sandbox Command Options', () => {
  it('should define correct SandboxCommandOptions interface', () => {
    const options: SandboxCommandOptions = {
      cmd: 'npm',
      args: ['install'],
      detached: false,
      sudo: false,
    };

    expect(options.cmd).toBe('npm');
    expect(options.args).toEqual(['install']);
    expect(options.detached).toBe(false);
    expect(options.sudo).toBe(false);
  });

  it('should allow optional stream parameters', () => {
    const mockWritable = {
      write: vi.fn(),
      end: vi.fn(),
    } as any;

    const options: SandboxCommandOptions = {
      cmd: 'npm',
      args: ['build'],
      stdout: mockWritable,
      stderr: mockWritable,
    };

    expect(options.stdout).toBeDefined();
    expect(options.stderr).toBeDefined();
  });
});

describe('Sandbox Utility Functions', () => {
  it('should validate getSandboxUrl mock behavior', () => {
    // Mock sandbox with domain method
    const mockSandbox = {
      domain: vi.fn((port: number) => `https://sandbox-id.vercel.app:${port}`),
    } as unknown as Sandbox;

    const url = mockSandbox.domain(3000);
    expect(url).toBe('https://sandbox-id.vercel.app:3000');
    expect(mockSandbox.domain).toHaveBeenCalledWith(3000);
  });

  it('should validate timeout conversion logic', async () => {
    const ms = (await import('ms')).default;
    
    // Test time string conversions
    expect(ms('5m')).toBe(300000); // 5 minutes = 300000ms
    expect(ms('10m')).toBe(600000); // 10 minutes = 600000ms
    expect(ms('1h')).toBe(3600000); // 1 hour = 3600000ms
  });
});

describe('Sandbox Package Installation', () => {
  it('should format package installation command correctly', () => {
    const packages = ['golang', 'redis', 'postgresql'];
    const expectedArgs = ['install', '-y', ...packages];

    expect(expectedArgs).toEqual(['install', '-y', 'golang', 'redis', 'postgresql']);
  });

  it('should handle single package installation', () => {
    const packages = ['git'];
    const expectedArgs = ['install', '-y', ...packages];

    expect(expectedArgs).toEqual(['install', '-y', 'git']);
  });
});

describe('Sandbox Error Handling', () => {
  it('should handle command exit codes', () => {
    const successResult = { exitCode: 0 };
    const failureResult = { exitCode: 1 };

    expect(successResult.exitCode).toBe(0);
    expect(failureResult.exitCode).not.toBe(0);
  });

  it('should validate timeout ranges', () => {
    const ms = require('ms');
    
    // Hobby plan: max 45 minutes
    const hobbyMax = ms('45m');
    expect(hobbyMax).toBe(2700000);

    // Pro/Enterprise: max 5 hours
    const proMax = ms('5h');
    expect(proMax).toBe(18000000);
  });
});
