const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const workspaceNodeModules = 'C:\\Users\\abhay\\OneDrive\\Desktop\\mohit industruies\\node_modules';
const localTargetDir = 'C:\\Users\\abhay\\.next-mohit';
const localNodeModules = path.join(localTargetDir, 'node_modules');

try {
  // Ensure the target local folder exists
  if (!fs.existsSync(localTargetDir)) {
    fs.mkdirSync(localTargetDir, { recursive: true });
  }

  // If local node_modules already exists, remove it
  if (fs.existsSync(localNodeModules)) {
    console.log('Removing existing local node_modules link...');
    const stats = fs.lstatSync(localNodeModules);
    if (stats.isSymbolicLink() || stats.isDirectory()) {
      fs.rmSync(localNodeModules, { recursive: true, force: true });
    }
  }

  // Create junction point from C:\Users\abhay\.next-mohit\node_modules -> C:\Users\abhay\OneDrive\Desktop\mohit industruies\node_modules
  console.log(`Creating junction link from ${localNodeModules} to ${workspaceNodeModules}`);
  const cmd = `mklink /J "${localNodeModules}" "${workspaceNodeModules}"`;
  execSync(cmd, { stdio: 'inherit' });
  console.log('node_modules junction established successfully!');

} catch (error) {
  console.error('Error establishing node_modules junction:', error);
}
