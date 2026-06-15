const fs = require('fs');
const path = require('path');

function getFiles(dir, files = []) {
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
console.log(`Total files in legacy_content: ${allFiles.length}`);

const cablesBy = allFiles.filter(f => f.toLowerCase().includes('cables-by'));
console.log('cables-by files:');
cablesBy.forEach(f => {
  const stat = fs.statSync(f);
  console.log(`- ${path.relative(process.cwd(), f)} (${stat.size} bytes)`);
});
