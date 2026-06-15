const fs = require('fs');
const path = require('path');

const cssFiles = [
  path.join(__dirname, '..', 'public', 'assets', 'css', 'custom.css'),
  path.join(__dirname, '..', 'public', 'assets', 'css', 'main.css'),
  path.join(__dirname, '..', 'public', 'assets', 'css', 'responsive.css'),
  path.join(__dirname, '..', 'src', 'app', 'globals.css')
];

cssFiles.forEach(file => {
  if (!fs.existsSync(file)) return;
  const content = fs.readFileSync(file, 'utf8');
  const regex = /\.Instagram\b[^{]*\{([^}]+)\}/gi;
  let match;
  console.log(`\n--- Inspecting ${path.basename(file)} ---`);
  while ((match = regex.exec(content)) !== null) {
    console.log(`Match: ${match[0].trim().replace(/\s+/g, ' ')}`);
  }
});
