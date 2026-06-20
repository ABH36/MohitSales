const sizeOf = require('image-size');
const path = require('path');

const imgPath = path.join(__dirname, '..', 'public', 'assets', 'images', 'industries', 'building-infrastructure', 'residential', 'residential-card', 'polycab-hr-fr-lsh-lf-green-wire-1100v-ac-is-694.png');

try {
  const dimensions = sizeOf(imgPath);
  console.log('Image dimensions:', dimensions);
} catch (err) {
  console.error(err);
}
