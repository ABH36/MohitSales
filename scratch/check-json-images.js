const fs = require('fs');
const path = require('path');

const jsonPath = path.join(process.cwd(), 'content-export.json');
const data = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

const withImage = data.filter(item => item.imageSrc);
console.log(`Total items in content-export.json: ${data.length}`);
console.log(`Items with imageSrc in content-export.json: ${withImage.length}`);

for (const item of withImage.slice(0, 15)) {
  console.log(`- Path: ${item.path} | Title: ${item.title} | Image: ${item.imageSrc}`);
}
