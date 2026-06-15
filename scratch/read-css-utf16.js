const fs = require('fs');
const content = fs.readFileSync('src/app/globals.css', 'utf8');
const lines = content.split('\n');
console.log('Searching for hover menu styles in globals.css:');
lines.forEach((line, index) => {
  if (line.includes('hover') && (line.includes('menu') || line.includes('msc') || line.includes('brand') || line.includes('cat') || line.includes('subcat') || line.includes('nav'))) {
    console.log(`${index + 1}: ${line.trim()}`);
  }
});
