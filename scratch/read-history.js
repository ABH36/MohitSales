const fs = require('fs');
const path = 'C:\\Users\\abhay\\AppData\\Roaming\\Microsoft\\Windows\\PowerShell\\PSReadLine\\ConsoleHost_history.txt';

try {
  if (fs.existsSync(path)) {
    const lines = fs.readFileSync(path, 'utf8').split('\n');
    console.log(lines.slice(-1000).join('\n'));
  } else {
    console.log('History file does not exist');
  }
} catch (e) {
  console.error(e);
}
