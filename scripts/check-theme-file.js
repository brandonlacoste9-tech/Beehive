const fs = require('fs');
const path = require('path');

// Path to the theme file
const themePath = path.join(__dirname, 'lib', 'theme.ts');

if (fs.existsSync(themePath)) {
  console.log('✅ lib/theme.ts exists and is correctly named.');
} else {
  console.error('❌ lib/theme.ts is missing or misnamed! Check for case sensitivity.');
  process.exit(1);
}