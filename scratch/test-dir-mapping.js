const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function getPhpFiles(dir, filesList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      getPhpFiles(filePath, filesList);
    } else if (file.endsWith('.php')) {
      filesList.push(filePath);
    }
  }
  return filesList;
}

async function testDirMapping() {
  const baseDir = path.join(process.cwd(), 'legacy_content', 'industries', 'cables-by-application');
  const phpFiles = getPhpFiles(baseDir);
  console.log(`Found ${phpFiles.length} PHP files under legacy_content/industries/cables-by-application`);

  // Build a map of clean filename to subcategory folder
  // e.g. "polycab-02ayy-2-core-1100v-is-694-flat-cable" -> "residential"
  const fileToSubcat = new Map();
  for (const file of phpFiles) {
    const parentFolder = path.basename(path.dirname(file));
    const filename = path.basename(file, '.php');
    fileToSubcat.set(filename.toLowerCase(), parentFolder);
  }

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

  const dbProducts = await prisma.product.findMany({
    include: { category: true }
  });

  let totalResidentialInDb = 0;
  let matched = 0;
  let unmatched = 0;

  for (const dbProduct of dbProducts) {
    if (dbProduct.category && dbProduct.category.slug.endsWith('/residential')) {
      totalResidentialInDb++;

      // Try to match based on the last segment of the slug
      const dbSlugParts = dbProduct.slug.split('/');
      let lastPart = dbSlugParts[dbSlugParts.length - 1].toLowerCase();
      // Remove any numeric suffix added to avoid conflicts, e.g. "-8168"
      lastPart = lastPart.replace(/-\d+$/, '');

      let subcatFolder = fileToSubcat.get(lastPart);
      if (!subcatFolder) {
        // Try fuzzy matching: check if any key in fileToSubcat is a substring or vice versa
        for (const [key, val] of fileToSubcat.entries()) {
          if (lastPart.includes(key) || key.includes(lastPart)) {
            subcatFolder = val;
            break;
          }
        }
      }

      if (subcatFolder) {
        const parentSlug = subcategoryToParent[subcatFolder];
        if (parentSlug) {
          matched++;
          continue;
        }
      }

      unmatched++;
      console.log(`Unmatched: "${dbProduct.slug}" | Title: "${dbProduct.title}"`);
    }
  }

  console.log(`\nTotal products in */residential categories: ${totalResidentialInDb}`);
  console.log(`Matched via directory lookup: ${matched}`);
  console.log(`Unmatched: ${unmatched}`);

  await prisma.$disconnect();
}

testDirMapping();
