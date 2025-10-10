#!/usr/bin/env node

/**
 * Demo script to test Codex Pulse artifact generation
 * Creates sample violations data and generates the artifacts
 */

const fs = require('fs');
const path = require('path');

// Create sample violations data
const sampleViolations = [
  {
    id: 'color-contrast',
    impact: 'serious',
    description: 'Elements must have sufficient color contrast',
    help: 'Ensure all text elements have sufficient color contrast',
    helpUrl: 'https://dequeuniversity.com/rules/axe/4.8/color-contrast',
    tags: ['wcag2aa', 'wcag143'],
    nodes: [
      {
        html: '<p style="color: #777; background: #fff;">Low contrast text</p>',
        target: ['p'],
        failureSummary: 'Element has insufficient color contrast of 4.48:1 (foreground color: #777777, background color: #ffffff, font size: 12.0pt, font weight: normal). Expected contrast ratio of 4.5:1',
        page: '/'
      }
    ]
  },
  {
    id: 'image-alt',
    impact: 'critical',
    description: 'Images must have alternate text',
    help: 'Images must have an alt attribute',
    helpUrl: 'https://dequeuniversity.com/rules/axe/4.8/image-alt',
    tags: ['wcag2a', 'wcag111'],
    nodes: [
      {
        html: '<img src="/logo.png">',
        target: ['img'],
        failureSummary: 'Element does not have an alt attribute',
        page: '/'
      }
    ]
  },
  {
    id: 'heading-order',
    impact: 'moderate',
    description: 'Heading levels should only increase by one',
    help: 'Heading levels should be in a sequentially-descending order',
    helpUrl: 'https://dequeuniversity.com/rules/axe/4.8/heading-order',
    tags: ['wcag2a', 'best-practice'],
    nodes: [
      {
        html: '<h3>Skipped heading level</h3>',
        target: ['h3'],
        failureSummary: 'Heading order invalid (h1 followed by h3)',
        page: '/pricing'
      }
    ]
  }
];

// Create test-results directory and write violations
const testResultsDir = path.join(__dirname, '../test-results');
if (!fs.existsSync(testResultsDir)) {
  fs.mkdirSync(testResultsDir, { recursive: true });
}

const violationsPath = path.join(testResultsDir, 'violations.json');
fs.writeFileSync(violationsPath, JSON.stringify(sampleViolations, null, 2));
console.log('✅ Created sample violations file:', violationsPath);

// Set environment variables for testing
process.env.GITHUB_REPOSITORY = 'brandonlacoste9-tech/Beehive';
process.env.GITHUB_SHA = 'abc123def456';
process.env.GITHUB_REF_NAME = 'feature/a11y-testing';
process.env.GITHUB_RUN_ID = '12345';
process.env.GITHUB_RUN_NUMBER = '42';
process.env.GITHUB_EVENT_NAME = 'pull_request';
process.env.GITHUB_REF = 'refs/pull/10/merge';

console.log('🔧 Set environment variables for testing');
console.log('📦 Running Codex Pulse artifact generation...\n');

// Now run the generate-codex-pulse script
require('./generate-codex-pulse.js');
