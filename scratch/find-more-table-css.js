const fs = require('fs');
const path = require('path');

const cssFiles = [
  path.join(__dirname, '../public/css/custom.css'),
  path.join(__dirname, '../public/css/main.css'),
  path.join(__dirname, '../public/css/responsive.css'),
  path.join(__dirname, '../src/app/admin/admin.css'),
  path.join(__dirname, '../src/app/globals.css')
];

cssFiles.forEach(file => {
  if (!fs.existsSync(file)) {
    console.log(`File does not exist: ${file}`);
    return;
  }
  const content = fs.readFileSync(file, 'utf-8');
  
  const regex = /([^{}]+)\{([^{}]+)\}/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    const selector = match[1].trim();
    const rules = match[2].trim();
    
    const selectorWords = selector.split(/[\s,>+~:]+/);
    const hasTableTag = selectorWords.some(word => {
      const cleanWord = word.replace(/[.#]/, '');
      return ['table', 'tr', 'th', 'td', 'thead', 'tbody'].includes(cleanWord.toLowerCase());
    });
    
    if (hasTableTag) {
      console.log(`File: ${path.basename(file)} | Selector: "${selector}"`);
      console.log(`Rules: {\n  ${rules.split('\n').map(l => l.trim()).join('\n  ')}\n}\n`);
    }
  }
});
