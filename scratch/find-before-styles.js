const fs = require('fs');
const path = require('path');

const cssPath = path.join(process.cwd(), 'public/assets/css/main.css');
const content = fs.readFileSync(cssPath, 'utf-8');

let idx = 0;
const results = [];
while ((idx = content.indexOf('::before', idx)) !== -1) {
  const start = Math.max(0, idx - 150);
  const end = Math.min(content.length, idx + 150);
  const chunk = content.substring(start, end);
  if (chunk.includes('menu')) {
    results.push({ idx, chunk });
  }
  idx += '::before'.length;
}

console.log(`Found ${results.length} menu-related ::before rules:`);
results.forEach(r => {
  console.log(`[idx ${r.idx}]: ... ${r.chunk.replace(/\n/g, ' ')} ...`);
});
