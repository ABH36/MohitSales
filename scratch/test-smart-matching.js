const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testSmartMatching() {
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
  let matched = 0;
  let unmatched = 0;

  for (const dbProduct of dbProducts) {
    if (dbProduct.category && dbProduct.category.slug.endsWith('/residential')) {
      totalResidentialInDb++;

      // Find all content matches by title or slug
      const dbSlugParts = dbProduct.slug.split('/');
      let lastPart = dbSlugParts[dbSlugParts.length - 1].toLowerCase();
      lastPart = lastPart.replace(/-\d+$/, ''); // Remove random suffix

      const jsonMatches = content.filter(item => {
        const matchesTitle = item.title === dbProduct.title;
        const itemParts = item.path.replace(/\.php$/, '').split('/');
        const itemLastPart = itemParts[itemParts.length - 1].toLowerCase();
        const matchesSlug = itemLastPart === lastPart || itemLastPart.includes(lastPart) || lastPart.includes(itemLastPart);
        return matchesTitle || matchesSlug;
      });

      // Now filter by high-level area
      let bestMatch = null;
      const currentCatSlug = dbProduct.category.slug.toLowerCase();

      if (currentCatSlug.includes('cables-by-application')) {
        bestMatch = jsonMatches.find(item => item.path.includes('cables-by-application'));
      } else if (currentCatSlug.includes('cables-by-standards')) {
        bestMatch = jsonMatches.find(item => item.path.includes('cables-by-standards'));
      } else if (currentCatSlug.includes('cables-by-type')) {
        bestMatch = jsonMatches.find(item => item.path.includes('cables-by-type'));
      }

      // Fallback to first match if no area-specific match
      if (!bestMatch && jsonMatches.length > 0) {
        bestMatch = jsonMatches[0];
      }

      let isMapped = false;
      if (bestMatch) {
        const pathParts = bestMatch.path.split('/');
        if (pathParts.length >= 4 && pathParts[1] === 'cables-by-application') {
          const subcatFolder = pathParts[2];
          const parentSlug = subcategoryToParent[subcatFolder];
          if (parentSlug) {
            matched++;
            isMapped = true;
          }
        }
      }

      if (!isMapped) {
        unmatched++;
        console.log(`Unmatched residential DB product: ID: ${dbProduct.id} | Slug: "${dbProduct.slug}" | Title: "${dbProduct.title}" | Matches Count: ${jsonMatches.length}`);
      }
    }
  }

  console.log(`\nTotal products in */residential categories in DB: ${totalResidentialInDb}`);
  console.log(`Matched via smart matching: ${matched}`);
  console.log(`Unmatched: ${unmatched}`);

  await prisma.$disconnect();
}

testSmartMatching();
