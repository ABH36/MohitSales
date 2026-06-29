async function check(url) {
  const res = await fetch(url);
  const timing = res.headers.get('server-timing');
  console.log(url.split('/').pop(), '->', timing);
}

async function main() {
  const urls = [
    'https://res.cloudinary.com/da2dmtm9b/image/upload/v1782455312/mohit-assets/assets/images/banner/mobile/cable.webp',
    'https://res.cloudinary.com/da2dmtm9b/image/upload/v1782455314/mohit-assets/assets/images/banner/mobile/polycab_banner.webp',
    'https://res.cloudinary.com/da2dmtm9b/image/upload/v1782455313/mohit-assets/assets/images/banner/mobile/fans.webp'
  ];
  for (const url of urls) {
    await check(url);
  }
}
main();
