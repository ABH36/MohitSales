const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, '../public/assets/css/custom.css');
const content = fs.readFileSync(cssPath, 'utf8');

const regex = /[^{}]*card_box[^{}]*\{[^{}]*\}/g;
let match;
while ((match = regex.exec(content)) !== null) {
  console.log('Match found:', match[0]);
}

// Also check for specs-table
const regexTable = /[^{}]*specs-table[^{}]*\{[^{}]*\}/g;
while ((match = regexTable.exec(content)) !== null) {
  console.log('Table Match found:', match[0]);
}
