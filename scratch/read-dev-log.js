const fs = require('fs');
const path = require('path');

const logPath = path.join(process.cwd(), 'dev.log');
if (fs.existsSync(logPath)) {
  const content = fs.readFileSync(logPath, 'utf16le');
  const lines = content.split('\n');
  console.log('Last 50 lines of dev.log:');
  lines.slice(-50).forEach(l => console.log(l));
} else {
  console.log('dev.log not found');
}
