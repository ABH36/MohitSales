const http = require('http');

function getUrl(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    }).on('error', reject);
  });
}

async function main() {
  console.log('🔍 Testing local website endpoints...');

  try {
    // 1. Test Navigation API
    console.log('\n1. Fetching Navigation API...');
    const nav = await getUrl('http://localhost:3000/api/public/navigation');
    console.log(`Status: ${nav.statusCode}`);
    if (nav.statusCode === 200) {
      const data = JSON.parse(nav.body);
      console.log('✅ Navigation API responded with 200.');
      const polycab = data.data.find(b => b.slug === 'polycab');
      if (polycab) {
        console.log('✅ Polycab brand found in navigation.');
        console.log('Polycab Categories:');
        polycab.children.forEach(c => {
          console.log(`  - ${c.name} (${c.slug}) [children count: ${c.children.length}]`);
        });
      } else {
        console.error('❌ Polycab brand not found in navigation!');
      }
    } else {
      console.error(`❌ Navigation API returned status ${nav.statusCode}`);
    }

    // 2. Test Building Infrastructure Category Page
    console.log('\n2. Fetching Category: Building Infrastructure...');
    const catPage = await getUrl('http://localhost:3000/polycab/cables-by-application/building-infrastructure');
    console.log(`Status: ${catPage.statusCode}`);
    if (catPage.statusCode === 200) {
      console.log('✅ Building Infrastructure page loaded successfully.');
      if (catPage.body.includes('Building Infrastructure')) {
        console.log('✅ Found "Building Infrastructure" heading on the page.');
      } else {
        console.warn('⚠️ Warning: Heading "Building Infrastructure" not found in response HTML.');
      }
    } else {
      console.error(`❌ Category page returned status ${catPage.statusCode}`);
    }

    // 3. Test Product Page (Polycab Coaxial Cable)
    console.log('\n3. Fetching Product: Polycab Coaxial Cable...');
    const prodPage = await getUrl('http://localhost:3000/polycab/cables-by-application/building-infrastructure/polycab-coaxial-cable');
    console.log(`Status: ${prodPage.statusCode}`);
    if (prodPage.statusCode === 200) {
      console.log('✅ Polycab Coaxial Cable product page loaded successfully.');
      if (prodPage.body.includes('Polycab Coaxial Cable')) {
        console.log('✅ Found "Polycab Coaxial Cable" title on the page.');
      } else {
        console.warn('⚠️ Warning: Product title "Polycab Coaxial Cable" not found in response HTML.');
      }
    } else {
      console.error(`❌ Product page returned status ${prodPage.statusCode}`);
    }

  } catch (err) {
    console.error('❌ Network request failed. Make sure Next.js dev server is running on port 3000.', err.message);
  }
}

main();
