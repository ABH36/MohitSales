const fs = require('fs');
const path = require('path');

const images = [
  'public/assets/images/our_products/fans/ceiling_fans/Vital-Plus.png',
  'public/assets/images/our_products/fans/ceiling_fans/Vital-Matt-Black-1.png',
  'public/assets/images/our_products/fans/ceiling_fans/Zoomer-Prime-Choco-Brown-1.png',
  'public/assets/images/our_products/fans/ceiling_fans/Zoomer-DLX_-Luster-Brown.png',
  'public/assets/images/our_products/fans/ceiling_fans/ZOOMER-Bianco-1.png'
];

images.forEach(img => {
  const fullPath = path.join(__dirname, '..', img);
  const exists = fs.existsSync(fullPath);
  console.log(`${img} exists: ${exists}`);
});
