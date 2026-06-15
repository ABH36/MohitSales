const fs = require('fs');
const path = require('path');

const cssPath = path.join(process.cwd(), 'src', 'app', 'globals.css');
if (fs.existsSync(cssPath)) {
  const content = fs.readFileSync(cssPath, 'utf-8');
  const lines = content.split('\n');
  
  console.log('Lines containing subcategory in globals.css:');
  lines.forEach((line, idx) => {
    if (line.includes('subcategory') || line.includes('sub-category')) {
      console.log(`${idx + 1}: ${line}`);
      // Print surrounding lines
      for (let i = Math.max(0, idx - 3); i <= Math.min(lines.length - 1, idx + 8); i++) {
        console.log(`  [${i + 1}] ${lines[i]}`);
      }
      console.log('---');
    }
  });
} else {
  console.log('globals.css not found!');
}
