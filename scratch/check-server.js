const http = require('http');

function checkUrl(url) {
  return new Promise((resolve) => {
    http.get(url, (res) => {
      resolve({
        statusCode: res.statusCode,
        headers: res.headers
      });
    }).on('error', (err) => {
      resolve({
        error: err.message
      });
    });
  });
}

async function main() {
  const resultHome = await checkUrl('http://localhost:3000/');
  console.log('Homepage status:', resultHome);

  const resultLogo = await checkUrl('http://localhost:3000/assets/images/logo/polycab-logo.png');
  console.log('Logo image status:', resultLogo);
}

main();
