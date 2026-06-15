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

const allFiles = getFiles(path.join(process.cwd(), 'legacy_content'));
const matches = allFiles.filter(f => f.toLowerCase().includes('design-series'));
matches.forEach(m => console.log(`- ${path.relative(process.cwd(), m)}`));
