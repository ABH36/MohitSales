const fs = require('fs');
const path = require('path');

const cssPath = path.join(process.cwd(), 'public/assets/css/main.css');
const content = fs.readFileSync(cssPath, 'utf-8');

// Find occurrences of menu-related classes
const classes = [
  '.main-menu',
  '.menu-item-has-children',
  '.submenu',
  '.rs-header-area'
];

console.log('Searching for CSS rules...');
classes.forEach(cls => {
  let idx = 0;
  console.log(`\n=== Matches for ${cls} ===`);
  while ((idx = content.indexOf(cls, idx)) !== -1) {
    // Extract 200 chars around the index
    const start = Math.max(0, idx - 50);
    const end = Math.min(content.length, idx + 150);
    console.log(`[idx ${idx}]: ... ${content.substring(start, end).replace(/\n/g, ' ')} ...`);
    idx += cls.length;
    if (idx > 200000) break; // Limit search
  }
});
