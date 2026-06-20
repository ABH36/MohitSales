const fs = require('fs');
const path = require('path');

// Mock getLegacyPath
function getLegacyPath(slugPath) {
  let clean = slugPath.toLowerCase();

  if (clean.startsWith('polycab/cables-by-')) {
    clean = clean.replace('polycab/cables-by-', 'industries/cables-by-');
  } else if (clean.startsWith('polycab/')) {
    clean = clean.substring('polycab/'.length);
  } else if (clean.startsWith('dowells/')) {
    clean = clean.substring('dowells/'.length);
  }
  return clean;
}

async function test() {
  const cloneDir = path.join(process.cwd(), 'legacy_content');
  const slugPath = 'polycab/fans';
  
  // Simulated logic from page.tsx:
  const legacyPath = getLegacyPath(slugPath);
  const phpPath = legacyPath.endsWith('.php') ? legacyPath : `${legacyPath}.php`;
  const fullPath = path.join(cloneDir, phpPath);
  
  const exists = fs.existsSync(fullPath);
  console.log('File path checked:', fullPath);
  console.log('File exists:', exists);
  if (exists) {
    console.log('First 5 lines of file:', fs.readFileSync(fullPath, 'utf8').split('\n').slice(0, 5));
  }
}

test();
