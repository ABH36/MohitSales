const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', 'src', 'app', 'globals.css');
const content = fs.readFileSync(file, 'utf8');
const lines = content.split('\n');

const start = 1110;
const end = 1180;

for (let i = start - 1; i < end; i++) {
  if (lines[i] !== undefined) {
    console.log(`${i + 1}: ${lines[i]}`);
  }
}
