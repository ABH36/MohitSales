const fs = require('fs');
const path = require('path');

const cssFiles = [
  path.join(__dirname, '../src/app/admin/admin.css'),
  path.join(__dirname, '../src/app/globals.css'),
  path.join(__dirname, '../public/assets/css/main.css'),
  path.join(__dirname, '../public/assets/css/custom.css'),
  path.join(__dirname, '../public/assets/css/responsive.css')
];

cssFiles.forEach(file => {
  if (!fs.existsSync(file)) return;
  const content = fs.readFileSync(file, 'utf-8');
  
  // Use a regex to find selectors like table, tr, th, td, etc.
  const regex = /([^{}]+)\{([^{}]+)\}/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    const selector = match[1].trim();
    const rules = match[2].trim();
    
    // Check if selector contains general tags: table, tr, th, td, thead, tbody (but not as part of a custom class unless it's a tag selector)
    // We match table, tr, th, td, thead, tbody as separate words or tags
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
