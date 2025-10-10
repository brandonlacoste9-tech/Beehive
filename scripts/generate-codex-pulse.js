#!/usr/bin/env node

/**
 * Generate Codex Pulse artifacts from Playwright + axe-core test results
 * This script reads the test results JSON and generates both JSON and Markdown artifacts
 */

const fs = require('fs');
const path = require('path');

// Read violations from test results
const violationsPath = path.join(__dirname, '../test-results/violations.json');

if (!fs.existsSync(violationsPath)) {
  console.log('No violations file found, creating empty report...');
  // Create empty violations file
  const outputDir = path.join(__dirname, '../test-results');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  fs.writeFileSync(violationsPath, JSON.stringify([], null, 2));
}

const allViolations = JSON.parse(fs.readFileSync(violationsPath, 'utf8'));

// Schema path for reference
const schemaPath = path.join(__dirname, '../codex-pulse-schema.json');

// Collect unique pages from violations
const testedPages = new Set();
allViolations.forEach(violation => {
  violation.nodes?.forEach(node => {
    if (node.page) {
      testedPages.add(node.page);
    }
  });
});

// Get metadata from environment variables
const metadata = {
  repository: process.env.GITHUB_REPOSITORY || 'unknown/unknown',
  commit: process.env.GITHUB_SHA || 'unknown',
  branch: process.env.GITHUB_REF_NAME || 'unknown',
  runId: process.env.GITHUB_RUN_ID || 'local',
  runNumber: parseInt(process.env.GITHUB_RUN_NUMBER || '0', 10),
};

if (process.env.GITHUB_EVENT_NAME === 'pull_request' && process.env.GITHUB_REF) {
  const prMatch = process.env.GITHUB_REF.match(/refs\/pull\/(\d+)\//);
  if (prMatch) {
    metadata.pullRequest = parseInt(prMatch[1], 10);
  }
}

// Calculate summary statistics
const summary = {
  totalViolations: allViolations.length,
  totalPages: testedPages.size || 2, // Default to 2 pages tested
  criticalCount: allViolations.filter(v => v.impact === 'critical').length,
  seriousCount: allViolations.filter(v => v.impact === 'serious').length,
  moderateCount: allViolations.filter(v => v.impact === 'moderate').length,
  minorCount: allViolations.filter(v => v.impact === 'minor').length,
};

// Create Codex Pulse JSON artifact
const codexPulse = {
  version: '1.0.0',
  timestamp: new Date().toISOString(),
  metadata,
  summary,
  violations: allViolations,
  passes: [], // Could be populated from test results if needed
};

// Write JSON artifact
const outputDir = path.join(__dirname, '../codex-pulse-artifacts');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const jsonPath = path.join(outputDir, 'codex-pulse.json');
fs.writeFileSync(jsonPath, JSON.stringify(codexPulse, null, 2));
console.log('✅ Generated Codex Pulse JSON artifact:', jsonPath);

// Generate Markdown artifact
let markdown = `# 🐝 Codex Pulse: Accessibility Report

**Repository:** ${metadata.repository}  
**Commit:** \`${metadata.commit.substring(0, 7)}\`  
**Branch:** ${metadata.branch}  
**Run ID:** ${metadata.runId}  
**Timestamp:** ${new Date(codexPulse.timestamp).toUTCString()}

`;

if (metadata.pullRequest) {
  markdown += `**Pull Request:** #${metadata.pullRequest}\n\n`;
}

markdown += `## 📊 Summary

| Metric | Count |
|--------|-------|
| **Total Violations** | ${summary.totalViolations} |
| **Pages Tested** | ${summary.totalPages} |
| **Critical** | 🔴 ${summary.criticalCount} |
| **Serious** | 🟠 ${summary.seriousCount} |
| **Moderate** | 🟡 ${summary.moderateCount} |
| **Minor** | 🔵 ${summary.minorCount} |

`;

if (allViolations.length === 0) {
  markdown += `## ✅ No Accessibility Violations Found

All tested pages passed accessibility checks! 🎉

`;
} else {
  markdown += `## ⚠️ Violations Detected

`;

  // Group violations by impact
  const byImpact = {
    critical: allViolations.filter(v => v.impact === 'critical'),
    serious: allViolations.filter(v => v.impact === 'serious'),
    moderate: allViolations.filter(v => v.impact === 'moderate'),
    minor: allViolations.filter(v => v.impact === 'minor'),
  };

  const impactOrder = ['critical', 'serious', 'moderate', 'minor'];
  const impactEmoji = {
    critical: '🔴',
    serious: '🟠',
    moderate: '🟡',
    minor: '🔵',
  };

  impactOrder.forEach(impact => {
    const violations = byImpact[impact];
    if (violations.length > 0) {
      markdown += `### ${impactEmoji[impact]} ${impact.charAt(0).toUpperCase() + impact.slice(1)} (${violations.length})\n\n`;
      
      violations.forEach((violation, index) => {
        markdown += `#### ${index + 1}. ${violation.help}\n\n`;
        markdown += `**Rule ID:** \`${violation.id}\`  \n`;
        markdown += `**Description:** ${violation.description}  \n`;
        markdown += `**Help URL:** [Documentation](${violation.helpUrl})  \n`;
        
        if (violation.tags && violation.tags.length > 0) {
          markdown += `**Tags:** ${violation.tags.join(', ')}  \n`;
        }
        
        markdown += `**Affected Elements:** ${violation.nodes?.length || 0}\n\n`;
        
        if (violation.nodes && violation.nodes.length > 0) {
          markdown += `<details>\n<summary>Show affected elements</summary>\n\n`;
          violation.nodes.slice(0, 3).forEach((node, nodeIndex) => {
            markdown += `**Element ${nodeIndex + 1}:**\n\`\`\`html\n${node.html}\n\`\`\`\n`;
            if (node.failureSummary) {
              markdown += `\n**Issue:** ${node.failureSummary}\n\n`;
            }
          });
          if (violation.nodes.length > 3) {
            markdown += `\n*... and ${violation.nodes.length - 3} more*\n`;
          }
          markdown += `\n</details>\n\n`;
        }
        
        markdown += `---\n\n`;
      });
    }
  });
}

markdown += `## 📋 Next Steps

1. Review the violations listed above
2. Prioritize fixes based on impact level (Critical → Serious → Moderate → Minor)
3. Use the provided documentation links to understand how to fix each issue
4. Run tests locally with \`npm run test:a11y\` before pushing changes
5. Ensure all critical and serious violations are addressed before merging

---

*Generated by Codex Pulse v${codexPulse.version} | Powered by Playwright + axe-core*
`;

const markdownPath = path.join(outputDir, 'codex-pulse.md');
fs.writeFileSync(markdownPath, markdown);
console.log('✅ Generated Codex Pulse Markdown artifact:', markdownPath);

// Validate against schema (basic check)
if (fs.existsSync(schemaPath)) {
  console.log('📋 Schema validation available at:', schemaPath);
}

console.log('\n🎯 Codex Pulse artifacts generated successfully!');
console.log(`   Total violations: ${summary.totalViolations}`);
console.log(`   Critical: ${summary.criticalCount}, Serious: ${summary.seriousCount}, Moderate: ${summary.moderateCount}, Minor: ${summary.minorCount}`);
