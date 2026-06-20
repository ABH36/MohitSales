const fs = require('fs');

const data = JSON.parse(fs.readFileSync('content-export.json', 'utf8'));
const match = data.filter(item => item.title.includes('Polycab LV 1.5 Cu IEC 60502-1 0.6/1kV') || item.path.includes('polycab-lv-1-5-cu-iec-60502-1-0-6-1kv'));

console.log(JSON.stringify(match, null, 2));
