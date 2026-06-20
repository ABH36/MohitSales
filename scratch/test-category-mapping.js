const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testMapping() {
  const content = JSON.parse(fs.readFileSync('content-export.json', 'utf8'));
  console.log(`Loaded ${content.length} entries from content-export.json`);

  // Map subfolder names to their correct parent category paths
  const subcategoryToParent = {
    // Building Infrastructure
    'residential': 'polycab/cables/cables-by-application/building-infrastructure',
    'datacenters': 'polycab/cables/cables-by-application/building-infrastructure',
    'telecommunication': 'polycab/cables/cables-by-application/building-infrastructure',
    'commercial': 'polycab/cables/cables-by-application/building-infrastructure',
    'it-industry': 'polycab/cables/cables-by-application/building-infrastructure',

    // Energy And Power Grid
    'power-and-network': 'polycab/cables/cables-by-application/energy-and-power-grid',
    'utility': 'polycab/cables/cables-by-application/energy-and-power-grid',
    'renewable-energy': 'polycab/cables/cables-by-application/energy-and-power-grid',
    'service-entrance': 'polycab/cables/cables-by-application/energy-and-power-grid',

    // Exploration Industries
    'oil-gas-and-petrochemical': 'polycab/cables/cables-by-application/exploration-industries',
    'mining-drilling-and-tunneling': 'polycab/cables/cables-by-application/exploration-industries',

    // Manufacturing Industries
    'automation-and-process-control': 'polycab/cables/cables-by-application/manufacturing-industries',
    'healthcare': 'polycab/cables/cables-by-application/manufacturing-industries',
    'food-and-beverages': 'polycab/cables/cables-by-application/manufacturing-industries',
    'water-treatment-and-waste-disposal': 'polycab/cables/cables-by-application/manufacturing-industries',
    'cement-industry': 'polycab/cables/cables-by-application/manufacturing-industries',
    'metal-industry': 'polycab/cables/cables-by-application/manufacturing-industries',
    'sugar-industry': 'polycab/cables/cables-by-application/manufacturing-industries',
    'pharmaceutical-industry': 'polycab/cables/cables-by-application/manufacturing-industries',

    // Mobility Infrastructure
    'aerospace-industry': 'polycab/cables/cables-by-application/mobility-infrastructure',
    'defence-and-armaments-industry': 'polycab/cables/cables-by-application/mobility-infrastructure',
    'mass-transit-railways-and-marine': 'polycab/cables/cables-by-application/mobility-infrastructure'
  };

  const dbProducts = await prisma.product.findMany();
  console.log(`Loaded ${dbProducts.length} products from database`);

  let matched = 0;
  let unmatched = 0;
  const categoriesToCreate = new Set();
  const moves = [];

  for (const dbProduct of dbProducts) {
    // Try to find the product in content-export.json by title or by slug
    let jsonMatch = content.find(item => item.title === dbProduct.title);
    if (!jsonMatch) {
      // Try to match by slug suffix
      const dbSlugParts = dbProduct.slug.split('/');
      const lastPart = dbSlugParts[dbSlugParts.length - 1];
      jsonMatch = content.find(item => {
        const itemParts = item.path.replace(/\.php$/, '').split('/');
        return itemParts[itemParts.length - 1].toLowerCase() === lastPart.toLowerCase();
      });
    }

    if (jsonMatch) {
      const pathParts = jsonMatch.path.split('/');
      // e.g. ["industries", "cables-by-application", "automation-and-process-control", "product.php"]
      if (pathParts.length >= 4 && pathParts[1] === 'cables-by-application') {
        const subcatFolder = pathParts[2];
        const parentSlug = subcategoryToParent[subcatFolder];
        if (parentSlug) {
          const correctCatSlug = `${parentSlug}/${subcatFolder}`;
          categoriesToCreate.add(correctCatSlug);
          moves.push({
            product: dbProduct.title,
            currentSlug: dbProduct.slug,
            targetCatSlug: correctCatSlug,
            newProductSlug: `${correctCatSlug}/${pathParts[3].replace(/\.php$/, '')}`
          });
          matched++;
        } else {
          unmatched++;
        }
      } else {
        unmatched++;
      }
    } else {
      unmatched++;
    }
  }

  console.log(`\nMatched products: ${matched}`);
  console.log(`Unmatched products: ${unmatched}`);
  console.log(`Categories to ensure exist:`, Array.from(categoriesToCreate));
  console.log(`Sample of 10 moves:`, moves.slice(0, 10));

  await prisma.$disconnect();
}

testMapping();
