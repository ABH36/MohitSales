const fs = require('fs');
const path = require('path');

const data = JSON.parse(fs.readFileSync('content-export.json', 'utf-8'));
console.log('Total entries:', data.length);

const samples = data.filter(item => item.path && item.path.includes('manufacturing-industries'));
console.log(`Found ${samples.length} items in manufacturing-industries. Samples:`);
samples.slice(0, 10).forEach(m => {
  console.log(`- Path: "${m.path}" | Breadcrumbs: ${JSON.stringify(m.breadcrumbs)}`);
});
