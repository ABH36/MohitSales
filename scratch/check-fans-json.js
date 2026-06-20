const fs = require('fs');
const path = require('path');

const data = JSON.parse(fs.readFileSync(path.join(__dirname, '../content-export.json'), 'utf8'));

const matchExact = data.find(item => item.path === 'fans.php');
console.log('Exact match fans.php:', matchExact ? 'Yes' : 'No');

const matches = data.filter(item => item.path.includes('fans'));
console.log('Matches with "fans":', matches.map(m => m.path));
