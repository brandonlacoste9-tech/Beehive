#!/usr/bin/env node

/**
 * Pre-commit hook to prevent accidental secrets from being committed
 * Usage: Add to .husky/pre-commit or run manually
 */

const { execSync } = require('child_process');
const fs = require('fs');

const SECRET_PATTERNS = [
  { pattern: /AKIA[0-9A-Z]{16}/, name: 'AWS Access Key' },
  { pattern: /ghp_[a-zA-Z0-9]{36}/, name: 'GitHub Personal Access Token' },
  { pattern: /gho_[a-zA-Z0-9]{36}/, name: 'GitHub OAuth Token' },
  { pattern: /sk_live_[a-zA-Z0-9]{24,}/, name: 'Stripe Live Secret Key' },
  { pattern: /sk_test_[a-zA-Z0-9]{24,}/, name: 'Stripe Test Secret Key' },
  { pattern: /eyJ[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}/, name: 'JWT Token' },
  { pattern: /AIza[a-zA-Z0-9_-]{35}/, name: 'Google API Key' },
  { pattern: /sk-[a-zA-Z0-9]{48}/, name: 'OpenAI API Key' },
  { pattern: /("|')?(password|secret|api[_-]?key|access[_-]?token)\1?\s*[:=]\s*['"][^'"]{8,}['"]/, name: 'Generic Secret' }
];

try {
  // Get staged files
  const stagedFiles = execSync('git diff --cached --name-only --diff-filter=ACM', { encoding: 'utf-8' })
    .split('\n')
    .filter(Boolean)
    .filter(file => !file.includes('.env.example')); // Allow .env.example

  let foundSecrets = false;

  for (const file of stagedFiles) {
    if (!fs.existsSync(file)) continue;
    
    const content = fs.readFileSync(file, 'utf-8');
    const lines = content.split('\n');

    lines.forEach((line, index) => {
      SECRET_PATTERNS.forEach(({ pattern, name }) => {
        if (pattern.test(line)) {
          console.error(`\n❌ Potential ${name} detected in ${file}:${index + 1}`);
          console.error(`   Line: ${line.trim().substring(0, 80)}...`);
          foundSecrets = true;
        }
      });
    });
  }

  if (foundSecrets) {
    console.error('\n🚨 Commit rejected: Potential secrets detected!');
    console.error('   Please remove sensitive data before committing.');
    console.error('   Use environment variables or .env.local instead.\n');
    process.exit(1);
  }

  console.log('✅ No secrets detected');
  process.exit(0);

} catch (error) {
  console.error('Error running pre-commit hook:', error.message);
  process.exit(0); // Don't block commit on hook errors
}
