const fs = require('fs');
const html = fs.readFileSync('legacy_content/industries/cables-by-application/mobility-infrastructure.php', 'utf-8');
const lastColIndex = html.lastIndexOf('<div class="col-lg-4">');
console.log('Last col-lg-4 index:', lastColIndex);
const afterLastCol = html.substring(lastColIndex, lastColIndex + 1000);
console.log('Content after:', afterLastCol);
