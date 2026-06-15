const fs = require('fs');
const path = require('path');

const desktopBanners = [
  'public/assets/images/banner/desktop/cable.png',
  'public/assets/images/banner/desktop/polycab.png',
  'public/assets/images/banner/desktop/fans.png',
  'public/assets/images/banner/desktop/solar_product.png',
  'public/assets/images/banner/desktop/switchgear.png',
  'public/assets/images/banner/desktop/wire.png',
  'public/assets/images/banner/desktop/dowells.png'
];

desktopBanners.forEach(b => {
  if (fs.existsSync(b)) {
    const stat = fs.statSync(b);
    console.log(`${b}: ${(stat.size / 1024 / 1024).toFixed(2)} MB`);
  } else {
    console.log(`${b}: Not found`);
  }
});
