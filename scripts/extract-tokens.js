#!/usr/bin/env node

/**
 * Design Tokens Extractor
 * Extracts design tokens from Tailwind config and CSS variables
 * Usage: npm run extract-tokens
 */

const fs = require('fs');
const path = require('path');

// Load Tailwind config
const tailwindConfig = require('../tailwind.config.js');

function extractTokens() {
  const tokens = {
    colors: {
      primary: tailwindConfig.theme.extend.colors.primary,
      accent: tailwindConfig.theme.extend.colors.accent,
    },
    motion: {
      animations: tailwindConfig.theme.extend.animation,
      keyframes: tailwindConfig.theme.extend.keyframes,
    },
    spacing: {
      // Tailwind default spacing scale
      0: '0px',
      1: '0.25rem',    // 4px
      2: '0.5rem',     // 8px
      3: '0.75rem',    // 12px
      4: '1rem',       // 16px
      5: '1.25rem',    // 20px
      6: '1.5rem',     // 24px
      8: '2rem',       // 32px
      10: '2.5rem',    // 40px
      12: '3rem',      // 48px
      16: '4rem',      // 64px
    },
    typography: {
      fontFamily: tailwindConfig.theme.extend.fontFamily,
    },
    gradients: tailwindConfig.theme.extend.backgroundImage,
  };

  // Write to file
  const outputPath = path.join(__dirname, '..', 'tokens.json');
  fs.writeFileSync(outputPath, JSON.stringify(tokens, null, 2));

  console.log('✅ Design tokens extracted to tokens.json');
  console.log(`📦 Found ${Object.keys(tokens.colors.primary).length} primary colors`);
  console.log(`📦 Found ${Object.keys(tokens.colors.accent).length} accent colors`);
  console.log(`📦 Found ${Object.keys(tokens.motion.animations).length} animations`);
  
  return tokens;
}

if (require.main === module) {
  extractTokens();
}

module.exports = { extractTokens };
