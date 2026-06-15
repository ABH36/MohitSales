const fs = require('fs');
const path = require('path');

function analyzeFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  console.log(`=== Analyzing ${path.basename(filePath)} ===`);
  lines.forEach((line, idx) => {
    if (line.includes('input') || line.includes('textarea') || line.includes('font-size')) {
      if (line.trim().startsWith('/') || line.trim().startsWith('*')) return;
      console.log(`${idx + 1}: ${line.trim()}`);
    }
  });
}

const customCss = path.join(__dirname, '../public/assets/css/custom.css');
const globalsCss = path.join(__dirname, '../src/app/globals.css');

if (fs.existsSync(customCss)) analyzeFile(customCss);
if (fs.existsSync(globalsCss)) analyzeFile(globalsCss);
