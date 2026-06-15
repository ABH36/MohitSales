const fs = require('fs');
const path = require('path');

const cssPath = path.join(process.cwd(), 'public/assets/css/main.css');
const content = fs.readFileSync(cssPath, 'utf-8');

const start = 198000;
const end = 200000;

console.log('=== CSS BLOCK ===');
console.log(content.substring(start, end));
