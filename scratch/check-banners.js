const fs = require('fs');
const path = require('path');

const desktopBanners = [
  '/assets/images/banner/desktop/cable.png',
  '/assets/images/banner/desktop/polycab.png',
  '/assets/images/banner/desktop/fans.png',
  '/assets/images/banner/desktop/solar_product.png',
  '/assets/images/banner/desktop/switchgear.png',
  '/assets/images/banner/desktop/wire.png',
  '/assets/images/banner/desktop/dowells.png'
];

const mobileBanners = [
  '/assets/images/banner/mobile/cable.png',
  '/assets/images/banner/mobile/polycab_banner.png',
  '/assets/images/banner/mobile/fans.png',
  '/assets/images/banner/mobile/solar_product.png',
  '/assets/images/banner/mobile/switchgear.png',
  '/assets/images/banner/mobile/wire.png',
  '/assets/images/banner/mobile/dowells.png'
];

console.log('Checking desktop banners existence:');
desktopBanners.forEach(b => {
  const p = path.join(process.cwd(), 'public', b);
  console.log(`- ${b}: ${fs.existsSync(p) ? 'EXISTS' : 'MISSING'}`);
});

console.log('\nChecking mobile banners existence:');
mobileBanners.forEach(b => {
  const p = path.join(process.cwd(), 'public', b);
  console.log(`- ${b}: ${fs.existsSync(p) ? 'EXISTS' : 'MISSING'}`);
});
