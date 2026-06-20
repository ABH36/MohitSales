const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testUnmatchedResidential() {
  const content = JSON.parse(fs.readFileSync('content-export.json', 'utf8'));
  const dbProducts = await prisma.product.findMany({
    include: { category: true }
  });

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

  let totalResidentialInDb = 0;
  let unmatchedResidential = 0;

  for (const dbProduct of dbProducts) {
    if (dbProduct.category && dbProduct.category.slug.endsWith('/residential')) {
      totalResidentialInDb++;

      let jsonMatch = content.find(item => item.title === dbProduct.title);
      if (!jsonMatch) {
        const dbSlugParts = dbProduct.slug.split('/');
        const lastPart = dbSlugParts[dbSlugParts.length - 1];
        jsonMatch = content.find(item => {
          const itemParts = item.path.replace(/\.php$/, '').split('/');
          return itemParts[itemParts.length - 1].toLowerCase() === lastPart.toLowerCase();
        });
      }

      let isMapped = false;
      if (jsonMatch) {
        const pathParts = jsonMatch.path.split('/');
        if (pathParts.length >= 4 && pathParts[1] === 'cables-by-application') {
          const subcatFolder = pathParts[2];
          const parentSlug = subcategoryToParent[subcatFolder];
          if (parentSlug) {
            isMapped = true;
          }
        }
      }

      if (!isMapped) {
        unmatchedResidential++;
        console.log(`Unmatched residential DB product: ID: ${dbProduct.id} | Slug: "${dbProduct.slug}" | Title: "${dbProduct.title}" | Category: "${dbProduct.category.slug}"`);
      }
    }
  }

  console.log(`\nTotal products in */residential categories in DB: ${totalResidentialInDb}`);
  console.log(`Unmatched products in */residential categories: ${unmatchedResidential}`);

  await prisma.$disconnect();
}

testUnmatchedResidential();
