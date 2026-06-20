const fs = require('fs');
const path = require('path');

const targetDir = 'C:\\Users\\abhay\\.next-mohit';

if (fs.existsSync(targetDir)) {
  console.log(`Safely cleaning contents of ${targetDir} (leaving node_modules intact)...`);
  const files = fs.readdirSync(targetDir);
  for (const file of files) {
    if (file === 'node_modules') {
      continue;
    }
    const filePath = path.join(targetDir, file);
    try {
      fs.rmSync(filePath, { recursive: true, force: true });
      console.log(`Deleted: ${file}`);
    } catch (err) {
      console.error(`Error deleting ${file}:`, err.message);
    }
  }
  console.log('Safe clean complete.');
} else {
  console.log('Target directory does not exist.');
}
