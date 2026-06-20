const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const workspaceDir = 'C:\\Users\\abhay\\OneDrive\\Desktop\\mohit industruies';
const workspaceNodeModules = path.join(workspaceDir, 'node_modules');

const localNodeModulesDir = 'C:\\Users\\abhay\\.node-modules-mohit';
const localNextDir = 'C:\\Users\\abhay\\.next-mohit';
const localNextNodeModules = path.join(localNextDir, 'node_modules');

try {
  // 1. Clean up local junction inside .next-mohit if it exists
  if (fs.existsSync(localNextNodeModules)) {
    console.log('Removing local next node_modules link...');
    try {
      fs.rmdirSync(localNextNodeModules);
    } catch (e) {
      fs.rmSync(localNextNodeModules, { recursive: true, force: true });
    }
  }

  // 2. Remove workspace node_modules (junction or directory)
  if (fs.existsSync(workspaceNodeModules)) {
    console.log('Removing workspace node_modules directory/junction...');
    const stats = fs.lstatSync(workspaceNodeModules);
    if (stats.isSymbolicLink() || stats.isDirectory()) {
      fs.rmSync(workspaceNodeModules, { recursive: true, force: true });
    }
  }

  // 3. Create/Clean the target outside folder C:\Users\abhay\.node-modules-mohit
  if (fs.existsSync(localNodeModulesDir)) {
    console.log('Cleaning existing local node_modules target directory...');
    fs.rmSync(localNodeModulesDir, { recursive: true, force: true });
  }
  console.log(`Creating target directory: ${localNodeModulesDir}`);
  fs.mkdirSync(localNodeModulesDir, { recursive: true });

  // 4. Create junction link: workspace/node_modules -> localNodeModulesDir
  console.log(`Creating junction link from ${workspaceNodeModules} to ${localNodeModulesDir}`);
  const cmd1 = `mklink /J "${workspaceNodeModules}" "${localNodeModulesDir}"`;
  execSync(cmd1, { stdio: 'inherit' });

  // 5. Create junction link: .next-mohit/node_modules -> localNodeModulesDir
  if (!fs.existsSync(localNextDir)) {
    fs.mkdirSync(localNextDir, { recursive: true });
  }
  console.log(`Creating junction link from ${localNextNodeModules} to ${localNodeModulesDir}`);
  const cmd2 = `mklink /J "${localNextNodeModules}" "${localNodeModulesDir}"`;
  execSync(cmd2, { stdio: 'inherit' });

  console.log('All junctions set up successfully!');

} catch (error) {
  console.error('Error establishing external node_modules configuration:', error);
}
