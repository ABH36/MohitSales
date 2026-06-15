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
const targets = ['lv-power-cable', 'mv-power-cable', 'ehv-power-cable', 'instrumentation-cable', 'communication-and-data-cable', 'renewable-energy'];

console.log('Checking legacy files:');
targets.forEach(t => {
  const matches = allFiles.filter(f => f.toLowerCase().includes(t.toLowerCase() + '.php'));
  console.log(`- ${t}: found ${matches.length} matches`);
  matches.forEach(m => {
    const stat = fs.statSync(m);
    console.log(`  * ${path.relative(process.cwd(), m)} (${stat.size} bytes)`);
  });
});
