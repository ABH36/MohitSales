const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const workspaceDir = 'C:\\Users\\abhay\\OneDrive\\Desktop\\mohit industruies';
const localTargetDir = 'C:\\Users\\abhay\\.next-mohit';
const nextDir = path.join(workspaceDir, '.next');

try {
  // 1. Delete existing .next directory
  if (fs.existsSync(nextDir)) {
    console.log('Removing existing .next directory...');
    // If it's a junction, we should unlink it or rmdir it
    const stats = fs.lstatSync(nextDir);
    if (stats.isSymbolicLink() || stats.isDirectory()) {
      fs.rmSync(nextDir, { recursive: true, force: true });
    }
  }

  // 2. Create the target local folder outside OneDrive
  if (!fs.existsSync(localTargetDir)) {
    console.log(`Creating target directory: ${localTargetDir}`);
    fs.mkdirSync(localTargetDir, { recursive: true });
  }

  // 3. Create junction point
  console.log(`Creating junction link from ${nextDir} to ${localTargetDir}`);
  // In Windows Command Prompt: mklink /J "source" "target"
  const cmd = `mklink /J "${nextDir}" "${localTargetDir}"`;
  execSync(cmd, { stdio: 'inherit' });
  console.log('Junction created successfully!');

} catch (error) {
  console.error('Error establishing junction:', error);
}
