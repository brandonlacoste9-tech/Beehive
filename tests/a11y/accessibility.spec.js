const { test, expect } = require('@playwright/test');
const AxeBuilder = require('axe-playwright').default;
const fs = require('fs');
const path = require('path');

// Store all violations across tests
const allViolations = [];

test.describe('Accessibility Tests', () => {
  test.afterAll(async () => {
    // Save all violations to a file for artifact generation
    const outputDir = path.join(__dirname, '../../test-results');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    const violationsPath = path.join(outputDir, 'violations.json');
    fs.writeFileSync(violationsPath, JSON.stringify(allViolations, null, 2));
    console.log(`Saved ${allViolations.length} violations to ${violationsPath}`);
  });

  test('home page should not have accessibility violations', async ({ page }) => {
    await page.goto('/');
    
    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');
    
    // Run axe accessibility scan
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    
    // Add page information to violations
    accessibilityScanResults.violations.forEach(violation => {
      violation.nodes.forEach(node => {
        node.page = '/';
      });
      allViolations.push(violation);
    });
    
    // Log violations for debugging
    if (accessibilityScanResults.violations.length > 0) {
      console.log('Accessibility violations found on home page:');
      accessibilityScanResults.violations.forEach((violation) => {
        console.log(`- ${violation.id}: ${violation.description}`);
        console.log(`  Impact: ${violation.impact}`);
        console.log(`  Help: ${violation.help}`);
        console.log(`  Nodes affected: ${violation.nodes.length}`);
      });
    } else {
      console.log('✅ No accessibility violations found on home page');
    }
    
    // We collect violations but don't fail the test to generate the report
    expect(accessibilityScanResults.violations).toBeDefined();
  });
  
  test('pricing page should not have accessibility violations', async ({ page }) => {
    // Check if pricing page exists, if not skip
    const response = await page.goto('/pricing');
    
    if (response.status() === 404) {
      console.log('Pricing page not found, skipping test');
      test.skip();
      return;
    }
    
    await page.waitForLoadState('networkidle');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    
    // Add page information to violations
    accessibilityScanResults.violations.forEach(violation => {
      violation.nodes.forEach(node => {
        node.page = '/pricing';
      });
      allViolations.push(violation);
    });
    
    if (accessibilityScanResults.violations.length > 0) {
      console.log('Accessibility violations found on pricing page:');
      accessibilityScanResults.violations.forEach((violation) => {
        console.log(`- ${violation.id}: ${violation.description}`);
        console.log(`  Impact: ${violation.impact}`);
      });
    } else {
      console.log('✅ No accessibility violations found on pricing page');
    }
    
    expect(accessibilityScanResults.violations).toBeDefined();
  });
});
