const fs = require('fs');
const path = require('path');

const cssFiles = [
  path.join(__dirname, '..', 'public', 'assets', 'css', 'custom.css'),
  path.join(__dirname, '..', 'public', 'assets', 'css', 'main.css'),
  path.join(__dirname, '..', 'public', 'assets', 'css', 'responsive.css'),
  path.join(__dirname, '..', 'src', 'app', 'globals.css')
];

const queries = ['social_media_sticky', 'sticky_icons', 'Quote', 'Instagram', 'Quote'];

cssFiles.forEach(file => {
  if (!fs.existsSync(file)) {
    console.log(`File not found: ${file}`);
    return;
  }
  
  const content = fs.readFileSync(file, 'utf8');
  console.log(`\n--- Searching inside ${path.basename(file)} ---`);
  
  const lines = content.split('\n');
  lines.forEach((line, index) => {
    queries.forEach(query => {
      if (line.includes(query)) {
        console.log(`Line ${index + 1}: ${line.trim()}`);
      }
    });
  });
});
