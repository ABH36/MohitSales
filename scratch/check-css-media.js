const fs = require('fs');
const path = require('path');

const files = [
  path.join(__dirname, '../public/assets/css/custom.css'),
  path.join(__dirname, '../public/css/custom.css')
];

files.forEach(file => {
  if (!fs.existsSync(file)) return;
  console.log(`\n================ Checking ${file} ================`);
  const content = fs.readFileSync(file, 'utf-8');
  const lines = content.split('\n');
  
  lines.forEach((line, index) => {
    if (line.includes('display: none') || line.includes('display: block') || line.includes('brand-table')) {
      // Print 5 lines before and after
      const start = Math.max(0, index - 5);
      const end = Math.min(lines.length - 1, index + 5);
      console.log(`--- Line ${index + 1} ---`);
      for (let i = start; i <= end; i++) {
        console.log(`${i + 1}: ${lines[i]}`);
      }
      console.log();
    }
  });
});
