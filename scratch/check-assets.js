const http = require('http');

function checkUrl(url) {
  return new Promise((resolve) => {
    http.get(url, (res) => {
      resolve(res.statusCode);
    }).on('error', (err) => {
      resolve(err.message);
    });
  });
}

async function main() {
  const assets = [
    'http://localhost:3000/assets/images/banner/desktop/cable.png',
    'http://localhost:3000/assets/images/our_products/fans/ceiling_fan.png',
    'http://localhost:3000/assets/images/industries/lv-power-cable/polycab-lv-cu-iec-60502-1-061kv-mc-3-ua.webp',
    'http://localhost:3000/assets/images/switchgears/Polyshield-Logo.png'
  ];

  for (const asset of assets) {
    const status = await checkUrl(asset);
    console.log(`Asset: ${asset} | Status: ${status}`);
  }
}

main();
