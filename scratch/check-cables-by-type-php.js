const fs = require('fs');
const path = require('path');

const file1 = path.join(process.cwd(), 'legacy_content', 'industries', 'cables-by-type.php');
const file2 = path.join(process.cwd(), 'legacy_content', 'polycab', 'cables-by-type.php');

console.log('File 1:', file1, fs.existsSync(file1) ? `Exists (${fs.statSync(file1).size} bytes)` : 'Does not exist');
console.log('File 2:', file2, fs.existsSync(file2) ? `Exists (${fs.statSync(file2).size} bytes)` : 'Does not exist');
