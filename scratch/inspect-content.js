const fs = require('fs');
const path = require('path');

const data = JSON.parse(fs.readFileSync(path.join(__dirname, '../content-export.json'), 'utf8'));
const matches = data.filter(item => {
  return JSON.stringify(item).toLowerCase().includes('freshner ventilation');
});

console.log('Matches length:', matches.length);
console.log('Match paths:', matches.map(m => m.path));
console.log('First match content:', JSON.stringify(matches[0], null, 2));
