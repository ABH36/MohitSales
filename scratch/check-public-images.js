const fs = require('fs');
const path = require('path');

function getFiles(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const name = path.join(dir, file);
    if (fs.statSync(name).isDirectory()) {
      getFiles(name, files);
    } else {
      files.push(name);
    }
  }
  return files;
}

const publicDir = path.join(process.cwd(), 'public');
const allImages = getFiles(publicDir).filter(f => {
  const ext = path.extname(f).toLowerCase();
  return ['.png', '.jpg', '.jpeg', '.webp'].includes(ext);
});

console.log(`Total image files in public: ${allImages.length}`);

const keywords = ['lv-power-cable', 'mv-power-cable', 'ehv-power-cable', 'instrumentation-cable', 'communication', 'renewable', 'solar', 'gland', 'cable-terminal'];
keywords.forEach(k => {
  const matches = allImages.filter(f => f.toLowerCase().includes(k.toLowerCase()));
  console.log(`- Keyword "${k}": found ${matches.length} images`);
  if (matches.length > 0) {
    console.log(`  * Sample: ${path.relative(publicDir, matches[0])}`);
  }
});
