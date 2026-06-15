const fs = require('fs');
const path = require('path');

const customCssPath = path.join(process.cwd(), 'public', 'assets', 'css', 'custom.css');
const globalsCssPath = path.join(process.cwd(), 'src', 'app', 'globals.css');

function searchCssClasses(cssPath, classes) {
  if (!fs.existsSync(cssPath)) {
    console.log(`File not found: ${cssPath}`);
    return;
  }
  console.log(`\nSearching in ${path.basename(cssPath)}:`);
  const content = fs.readFileSync(cssPath, 'utf-8');
  
  classes.forEach(cls => {
    // Regex to match a CSS rule block like .classname { ... }
    // Handles nested blocks or general rules
    const escapedCls = cls.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`(?:^|\\s|,)${escapedCls}\\s*\\{[^\\}]*\\}`, 'g');
    const matches = content.match(regex);
    
    console.log(`- Class "${cls}": found ${matches ? matches.length : 0} rules`);
    if (matches) {
      matches.forEach(m => console.log(`  * ${m.trim().replace(/\s+/g, ' ')}`));
    }
  });
}

searchCssClasses(customCssPath, ['.card_box', '.product-card', '.cables-card', '.enquiry-btn', '.product-img', '.product-content', '.product-features']);
searchCssClasses(globalsCssPath, ['.card_box', '.product-card', '.cables-card', '.enquiry-btn', '.product-img', '.product-content', '.product-features']);
