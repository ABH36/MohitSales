const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

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

const categoryNames = {
  'building-infrastructure': 'Building Infrastructure',
  'energy-and-power-grid': 'Energy And Power Grid',
  'exploration-industries': 'Exploration Industries',
  'manufacturing-industries': 'Manufacturing Industries',
  'mobility-infrastructure': 'Mobility Infrastructure',

  'residential': 'Residential',
  'datacenters': 'Datacenters',
  'telecommunication': 'Telecommunication',
  'commercial': 'Commercial',
  'it-industry': 'IT Industry',

  'power-and-network': 'Power & Network',
  'utility': 'Utility',
  'renewable-energy': 'Renewable Energy',
  'service-entrance': 'Service Entrance',

  'oil-gas-and-petrochemical': 'Oil Gas & Petrochemical',
  'mining-drilling-and-tunneling': 'Mining Drilling & Tunneling',

  'automation-and-process-control': 'Automation & Process Control',
  'healthcare': 'Healthcare',
  'food-and-beverages': 'Food & Beverages',
  'water-treatment-and-waste-disposal': 'Water Treatment & Waste Disposal',
  'cement-industry': 'Cement Industry',
  'metal-industry': 'Metal Industry',
  'sugar-industry': 'Sugar Industry',
  'pharmaceutical-industry': 'Pharmaceutical Industry',

  'aerospace-industry': 'Aerospace Industry',
  'defence-and-armaments-industry': 'Defence & Armaments Industry',
  'mass-transit-railways-and-marine': 'Mass Transit (Railways & Marine)'
};

async function main() {
  console.log('🔄 Reorganizing Cables Hierarchy and Reparenting Products...');

  const content = JSON.parse(fs.readFileSync('content-export.json', 'utf8'));

  // 1. Ensure polycab/cables/cables-by-application exists
  let cba = await prisma.category.findUnique({
    where: { slug: 'polycab/cables/cables-by-application' }
  });

  if (!cba) {
    // Look up polycab/cables
    const cables = await prisma.category.findUnique({ where: { slug: 'polycab/cables' } });
    if (!cables) {
      throw new Error('polycab/cables category not found in DB!');
    }
    cba = await prisma.category.create({
      data: {
        slug: 'polycab/cables/cables-by-application',
        name: 'Cables By Application',
        parentId: cables.id,
        isActive: true
      }
    });
    console.log(`Created Cables By Application root category.`);
  }

  const slugToId = new Map();
  slugToId.set('polycab/cables/cables-by-application', cba.id);

  // 2. Create the 5 parent categories under Cables By Application
  const parents = [
    'building-infrastructure',
    'energy-and-power-grid',
    'exploration-industries',
    'manufacturing-industries',
    'mobility-infrastructure'
  ];

  for (const parent of parents) {
    const slug = `polycab/cables/cables-by-application/${parent}`;
    let cat = await prisma.category.findUnique({ where: { slug } });
    if (!cat) {
      cat = await prisma.category.create({
        data: {
          slug,
          name: categoryNames[parent],
          parentId: cba.id,
          isActive: true
        }
      });
      console.log(`Created parent category: ${cat.name} (${slug})`);
    } else {
      // Ensure name is clean
      await prisma.category.update({
        where: { id: cat.id },
        data: { name: categoryNames[parent], parentId: cba.id }
      });
    }
    slugToId.set(slug, cat.id);
  }

  // 3. Create the leaf subcategories
  for (const [subcat, parentSlug] of Object.entries(subcategoryToParent)) {
    const parentId = slugToId.get(parentSlug);
    const slug = `${parentSlug}/${subcat}`;

    let cat = await prisma.category.findUnique({ where: { slug } });
    if (!cat) {
      cat = await prisma.category.create({
        data: {
          slug,
          name: categoryNames[subcat],
          parentId,
          isActive: true
        }
      });
      console.log(`Created subcategory: ${cat.name} under ${parentSlug}`);
    } else {
      await prisma.category.update({
        where: { id: cat.id },
        data: { name: categoryNames[subcat], parentId }
      });
    }
    slugToId.set(slug, cat.id);
  }

  // Pre-load all other category IDs
  const allCats = await prisma.category.findMany();
  for (const c of allCats) {
    slugToId.set(c.slug, c.id);
  }

  // 4. Load products and reparent them
  const dbProducts = await prisma.product.findMany({
    include: { category: true }
  });

  console.log(`Loaded ${dbProducts.length} database products for reparenting...`);

  let movedCount = 0;
  let skippedCount = 0;
  let uniqueViolationsAvoided = 0;

  const processedSlugs = new Set();

  function cleanString(str) {
    return (str || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  }

  for (const dbProduct of dbProducts) {
    // Try to match based on title or slug suffix in content-export.json
    const dbSlugParts = dbProduct.slug.split('/');
    let lastPart = dbSlugParts[dbSlugParts.length - 1].toLowerCase();
    lastPart = lastPart.replace(/-\d+$/, ''); // Remove random suffix

    const dbCleanTitle = cleanString(dbProduct.title);
    const dbCleanSlug = cleanString(lastPart);

    const jsonMatches = content.filter(item => {
      const itemCleanTitle = cleanString(item.title);
      const itemParts = item.path.replace(/\.php$/, '').split('/');
      const itemLastPart = itemParts[itemParts.length - 1];
      const itemCleanSlug = cleanString(itemLastPart);

      const matchesTitle = itemCleanTitle === dbCleanTitle || itemCleanTitle.includes(dbCleanTitle) || dbCleanTitle.includes(itemCleanTitle);
      const matchesSlug = itemCleanSlug === dbCleanSlug || itemCleanSlug.includes(dbCleanSlug) || dbCleanSlug.includes(itemCleanSlug);
      return matchesTitle || matchesSlug;
    });

    let bestMatch = null;
    if (dbProduct.category) {
      const currentCatSlug = dbProduct.category.slug.toLowerCase();
      if (currentCatSlug.includes('cables-by-application')) {
        bestMatch = jsonMatches.find(item => item.path.includes('cables-by-application'));
      } else if (currentCatSlug.includes('cables-by-standards')) {
        bestMatch = jsonMatches.find(item => item.path.includes('cables-by-standards'));
      } else if (currentCatSlug.includes('cables-by-type')) {
        bestMatch = jsonMatches.find(item => item.path.includes('cables-by-type'));
      }
    }

    if (!bestMatch && jsonMatches.length > 0) {
      bestMatch = jsonMatches[0];
    }

    if (bestMatch) {
      const pathParts = bestMatch.path.split('/');
      let targetCatSlug = null;
      let targetProductSlugSuffix = pathParts[pathParts.length - 1].replace(/\.php$/i, '');

      if (pathParts[1] === 'cables-by-application' && pathParts.length >= 4) {
        const subcatFolder = pathParts[2];
        const parentSlug = subcategoryToParent[subcatFolder];
        if (parentSlug) {
          targetCatSlug = `${parentSlug}/${subcatFolder}`;
        }
      } else if (pathParts[1] === 'cables-by-standards' && pathParts.length >= 4) {
        const standardFolder = pathParts[2];
        // E.g. "iec-60502-1" -> standardFolder
        // Check if Indian Standards vs International Standards
        const isIndian = dbProduct.title.toLowerCase().includes('is-') || dbProduct.title.toLowerCase().includes('is ') || bestMatch.path.toLowerCase().includes('/is-') || bestMatch.path.toLowerCase().includes('is/');
        if (isIndian) {
          targetCatSlug = 'polycab/cables/cables-by-standards/indian-standards';
        } else {
          targetCatSlug = 'polycab/cables/cables-by-standards/international-standards';
        }
      } else if (pathParts[1] === 'cables-by-type' && pathParts.length >= 4) {
        const typeFolder = pathParts[2];
        targetCatSlug = `polycab/cables/cables-by-type/${typeFolder}`;
      } else {
        // Map other sections based on path prefix
        const rootSection = pathParts[0];
        if (rootSection === 'cable-terminal' && pathParts.length >= 3) {
          const type = pathParts[1];
          targetCatSlug = `dowells/cable-terminal/${type}`;
        } else if (rootSection === 'gland' && pathParts.length >= 3) {
          const type = pathParts[1];
          targetCatSlug = `dowells/gland/${type}`;
        } else if (rootSection === 'fans' && pathParts.length >= 3) {
          const type = pathParts[1];
          targetCatSlug = `polycab/fans/${type}`;
        } else if (rootSection === 'solar' && pathParts.length >= 3) {
          const type = pathParts[1];
          targetCatSlug = `polycab/solar/${type}`;
        } else if (rootSection === 'conduit-accessories' && pathParts.length >= 3) {
          const type = pathParts[1];
          targetCatSlug = `polycab/conduit-and-accessories/${type}`;
        } else if (rootSection === 'home-appliances' && pathParts.length >= 3) {
          const type = pathParts[1];
          targetCatSlug = `polycab/home-appliances/${type}`;
        }
      }

      if (targetCatSlug) {
        const categoryId = slugToId.get(targetCatSlug);
        if (categoryId) {
          const targetProductSlug = `${targetCatSlug}/${targetProductSlugSuffix}`;

          if (dbProduct.categoryId === categoryId && dbProduct.slug === targetProductSlug) {
            processedSlugs.add(targetProductSlug);
            skippedCount++;
            continue;
          }

          // Check for unique slug constraint conflict in database
          const existingConflict = await prisma.product.findUnique({
            where: { slug: targetProductSlug }
          });

          if (existingConflict && existingConflict.id !== dbProduct.id) {
            await prisma.product.delete({ where: { id: dbProduct.id } });
            uniqueViolationsAvoided++;
            continue;
          }

          if (processedSlugs.has(targetProductSlug)) {
            await prisma.product.delete({ where: { id: dbProduct.id } });
            uniqueViolationsAvoided++;
            continue;
          } else {
            processedSlugs.add(targetProductSlug);
            await prisma.product.update({
              where: { id: dbProduct.id },
              data: {
                categoryId,
                slug: targetProductSlug
              }
            });
            movedCount++;
          }
          continue;
        }
      }
    }

    // Keep track of unprocessed products' slugs
    processedSlugs.add(dbProduct.slug);
    skippedCount++;
  }

  console.log(`✅ Product reorganization: moved/updated: ${movedCount}, skipped/correct: ${skippedCount}, duplicates deleted: ${uniqueViolationsAvoided}`);

  // 5. Clean up redundant empty duplicate residential categories
  console.log('\n🧹 Cleaning up empty categories...');
  const activeCategories = await prisma.category.findMany({
    include: {
      _count: { select: { products: true, children: true } }
    }
  });

  let deletedCatsCount = 0;
  for (const cat of activeCategories) {
    // If it ends with /residential and has no products/children
    if (cat.slug.endsWith('/residential') && cat._count.products === 0 && cat._count.children === 0) {
      // Keep only the correct residential category
      if (cat.slug !== 'polycab/cables/cables-by-application/building-infrastructure/residential') {
        await prisma.category.delete({ where: { id: cat.id } });
        console.log(`🗑️ Deleted redundant empty category: "${cat.slug}"`);
        deletedCatsCount++;
      }
    }
  }
  console.log(`✅ Removed ${deletedCatsCount} empty duplicate categories.`);

  console.log('\n🎉 REORGANIZATION COMPLETE!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
