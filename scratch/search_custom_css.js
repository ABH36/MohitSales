const fs = require('fs');
const content = fs.readFileSync('public/assets/css/custom.css', 'utf-8');
const lines = content.split('\n');
lines.forEach((line, index) => {
  if (line.includes('scroll-reveal')) {
    console.log(`${index + 1}: ${line}`);
  }
});
