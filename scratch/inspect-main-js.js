const fs = require('fs');
const path = require('path');

const mainJsPath = path.join(__dirname, '../public/assets/js/main.js');
if (!fs.existsSync(mainJsPath)) {
  console.log('main.js does not exist');
  process.exit(0);
}

const content = fs.readFileSync(mainJsPath, 'utf-8');
const lines = content.split('\n');

const keywords = ['table', 'thead', 'tbody', 'tr', 'th', 'td', 'input', 'button', 'search', 'remove', 'hide', 'empty', 'detach', 'html('];

lines.forEach((line, index) => {
  const lower = line.toLowerCase();
  const matched = keywords.filter(kw => lower.includes(kw));
  if (matched.length > 0) {
    console.log(`Line ${index + 1} matches [${matched.join(', ')}]: ${line.trim().slice(0, 120)}`);
  }
});
