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
  if (!fs.existsSync(file)) {
    console.log(`File does not exist: ${file}`);
    return;
  }
  console.log(`\n================ Inspecting ${path.basename(file)} ================`);
  const content = fs.readFileSync(file, 'utf-8');
  
  // Parse blocks: match anything inside { } along with its selectors
  const regex = /([^{}]+)\{([^{}]+)\}/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    const selector = match[1].trim();
    const rules = match[2].trim();
    const rulesLower = rules.toLowerCase();
    const selectorLower = selector.toLowerCase();
    
    // Check if the rules hide or modify layout of table parts, search box, or buttons
    if (rulesLower.includes('display') && (rulesLower.includes('none') || rulesLower.includes('block') || rulesLower.includes('flex'))) {
      if (
        selectorLower.includes('table') || 
        selectorLower.includes('th') || 
        selectorLower.includes('td') || 
        selectorLower.includes('tr') || 
        selectorLower.includes('thead') || 
        selectorLower.includes('tbody') || 
        selectorLower.includes('search') || 
        selectorLower.includes('btn') ||
        selectorLower.includes('admin')
      ) {
        console.log(`Selector: "${selector}"`);
        console.log(`Rules: {\n  ${rules.split('\n').map(l => l.trim()).join('\n  ')}\n}`);
      }
    }
  }
});
