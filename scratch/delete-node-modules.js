const fs = require('fs');
const path = require('path');

const projectNodeModules = 'C:\\Users\\abhay\\OneDrive\\Desktop\\mohit industruies\\node_modules';
const localJunctionDir = 'C:\\Users\\abhay\\.next-mohit';
const localNodeModules = path.join(localJunctionDir, 'node_modules');

try {
  // 1. Remove node_modules junction inside .next-mohit first to make sure no link issues exist
  if (fs.existsSync(localNodeModules)) {
    console.log('Removing local node_modules junction link...');
    // Since it's a junction, we can rmdir it safely
    fs.rmdirSync(localNodeModules);
  }

  // 2. Remove the project's node_modules folder entirely
  if (fs.existsSync(projectNodeModules)) {
    console.log('Removing project node_modules folder...');
    fs.rmSync(projectNodeModules, { recursive: true, force: true });
  }

  console.log('Clean completed.');
} catch (error) {
  console.error('Error during cleanup:', error);
}
