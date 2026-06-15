const fs = require('fs');
const path = require('path');

function getFiles(dir, files = []) {
  const fileList = fs.readdirSync(dir);
  for (const file of fileList) {
    const name = path.join(dir, file);
    if (fs.statSync(name).isDirectory()) {
      getFiles(name, files);
    } else {
      if (/\.(png|jpe?g|webp|gif|svg)$/i.test(file)) {
        files.push(name);
      }
    }
  }
  return files;
}

const allImages = getFiles('public');
const filtered = allImages.filter(f => /ehv|lv|mv/i.test(f));
console.log(filtered.map(f => path.relative('.', f)));
