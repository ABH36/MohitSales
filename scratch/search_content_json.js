const fs = require('fs');

const data = JSON.parse(fs.readFileSync('content-export.json', 'utf-8'));
const matches = data.filter(item => {
  const heading = item.heading || item.title || '';
  return heading.includes('EHV Power') || heading.includes('LV Power') || heading.includes('MV Power');
});

console.log(matches.map(m => ({ path: m.path, heading: m.heading, title: m.title })));
