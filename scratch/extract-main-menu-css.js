const fs = require('fs');
const path = require('path');

const cssPath = path.join(process.cwd(), 'public/assets/css/main.css');
const content = fs.readFileSync(cssPath, 'utf-8');

const start = 199600;
const end = 201600;

console.log('=== CSS BLOCK ===');
console.log(content.substring(start, end));
