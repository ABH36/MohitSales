const fs = require('fs');
const path = require('path');

const customCssPath = path.join(__dirname, '..', '..', '..', '..', '..', 'OneDrive', 'Desktop', 'mohit industruies', 'public', 'assets', 'css', 'custom.css');
const lines = fs.readFileSync(customCssPath, 'utf8').split('\n');

lines.forEach((line, i) => {
  if (line.includes('.row') && (line.includes('{') || lines[i+1]?.includes('{'))) {
    console.log(`Line ${i + 1}: ${line}`);
    console.log(`Line ${i + 2}: ${lines[i+1]}`);
    console.log(`Line ${i + 3}: ${lines[i+2]}`);
    console.log(`Line ${i + 4}: ${lines[i+3]}`);
    console.log('---');
  }
});
