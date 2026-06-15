const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');
const path = require('path');

async function main() {
  const jsonPath = path.join(process.cwd(), 'content-export.json');
  if (!fs.existsSync(jsonPath)) {
    console.error('content-export.json not found!');
    return;
  }
  const dataList = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

  const prods = await prisma.product.findMany({
    where: { category: { slug: 'industries' } }
  });

  console.log(`Analyzing ${prods.length} products associated with industries category...`);

  // Get categories we want to map to
  const cba = await prisma.category.findFirst({ where: { slug: 'polycab/cables-by-application' } });
  const cbs = await prisma.category.findFirst({ where: { slug: 'polycab/cables-by-standards' } });
  const cbt = await prisma.category.findFirst({ where: { slug: 'polycab/cables-by-type' } });

  // Get target categories under cables-by-application
  const catBuilding = await prisma.category.findFirst({ where: { slug: 'polycab/cables-by-application/building-infrastructure' } });
  const catEnergy = await prisma.category.findFirst({ where: { slug: 'polycab/cables-by-application/energy-and-power-grid' } });
  const catExploration = await prisma.category.findFirst({ where: { slug: 'polycab/cables-by-application/exploration-industries' } });
  const catManufacturing = await prisma.category.findFirst({ where: { slug: 'polycab/cables-by-application/manufacturing-industries' } });
  const catMobility = await prisma.category.findFirst({ where: { slug: 'polycab/cables-by-application/mobility-infrastructure' } });

  // Get target categories under cables-by-standards
  const catIndian = await prisma.category.findFirst({ where: { slug: 'polycab/cables-by-standards/indian-standards' } });
  const catInternational = await prisma.category.findFirst({ where: { slug: 'polycab/cables-by-standards/international-standards' } });

  // Get target categories under cables-by-type
  const catTypeOthers = await prisma.category.findFirst({ where: { slug: 'polycab/cables-by-type/others' } });

  const mappingStats = {};

  for (const p of prods) {
    let match = dataList.find(item => item.title === p.title || item.heading === p.title);
    if (!match) {
      const slugParts = p.slug.split('/');
      const lastPart = slugParts[slugParts.length - 1];
      match = dataList.find(item => {
        const itemParts = item.path.replace(/\.php$/, '').split('/');
        return itemParts[itemParts.length - 1].toLowerCase() === lastPart.toLowerCase();
      });
    }

    if (!match) {
      console.log(`No match for: ${p.title} (${p.slug})`);
      continue;
    }

    const originalPath = match.path.toLowerCase();
    let targetCategoryName = 'UNMAPPED';
    let targetCategoryId = null;

    if (originalPath.includes('cables-by-standards')) {
      const isIndian = p.title.toLowerCase().includes('is-') || p.title.toLowerCase().includes('is ') || originalPath.includes('/is-') || originalPath.includes('is/');
      if (isIndian && catIndian) {
        targetCategoryName = 'Indian Standards (IS)';
        targetCategoryId = catIndian.id;
      } else if (catInternational) {
        targetCategoryName = 'International Standards';
        targetCategoryId = catInternational.id;
      }
    } else if (originalPath.includes('cables-by-type')) {
      // Find subcategory under cables-by-type
      // For now, map to Others or try to match type slug parts
      const parts = originalPath.split('/');
      const typeIdx = parts.indexOf('cables-by-type');
      if (typeIdx !== -1 && typeIdx + 1 < parts.length) {
        const subcatSlug = parts[typeIdx + 1].replace(/\.php$/, '');
        // Search in database for subcategory with slug polycab/cables-by-type/subcatSlug
        const dbSubcat = await prisma.category.findFirst({
          where: { slug: `polycab/cables-by-type/${subcatSlug}` }
        });
        if (dbSubcat) {
          targetCategoryName = `Cables By Type: ${dbSubcat.name}`;
          targetCategoryId = dbSubcat.id;
        } else if (catTypeOthers) {
          targetCategoryName = 'Cables By Type: Others';
          targetCategoryId = catTypeOthers.id;
        }
      } else if (catTypeOthers) {
        targetCategoryName = 'Cables By Type: Others';
        targetCategoryId = catTypeOthers.id;
      }
    } else if (originalPath.includes('cables-by-application')) {
      // Map based on old sector names
      if (originalPath.includes('commercial') || originalPath.includes('building') || originalPath.includes('residential') || originalPath.includes('hospital')) {
        targetCategoryName = 'Building Infrastructure';
        targetCategoryId = catBuilding ? catBuilding.id : null;
      } else if (originalPath.includes('power-generation') || originalPath.includes('energy-and-power-grid') || originalPath.includes('grid')) {
        targetCategoryName = 'Energy And Power Grid';
        targetCategoryId = catEnergy ? catEnergy.id : null;
      } else if (originalPath.includes('exploration') || originalPath.includes('mining') || originalPath.includes('oil-gas')) {
        targetCategoryName = 'Exploration Industries';
        targetCategoryId = catExploration ? catExploration.id : null;
      } else if (originalPath.includes('cement') || originalPath.includes('steel') || originalPath.includes('automation') || 
                 originalPath.includes('chemical') || originalPath.includes('glass') || originalPath.includes('food') || 
                 originalPath.includes('heavy-engineering') || originalPath.includes('textile') || originalPath.includes('paper') || 
                 originalPath.includes('water-') || originalPath.includes('packaging')) {
        targetCategoryName = 'Manufacturing Industries';
        targetCategoryId = catManufacturing ? catManufacturing.id : null;
      } else if (originalPath.includes('mobility') || originalPath.includes('defence') || originalPath.includes('aerospace') || 
                 originalPath.includes('railway') || originalPath.includes('marine') || originalPath.includes('ports') || 
                 originalPath.includes('telecommunication') || originalPath.includes('transit')) {
        targetCategoryName = 'Mobility Infrastructure';
        targetCategoryId = catMobility ? catMobility.id : null;
      } else {
        // Fallback to manufacturing if unknown
        targetCategoryName = 'Manufacturing Industries (Fallback)';
        targetCategoryId = catManufacturing ? catManufacturing.id : null;
      }
    }

    mappingStats[targetCategoryName] = (mappingStats[targetCategoryName] || 0) + 1;
  }

  console.log('Mapping statistics for 396 products:');
  console.log(JSON.stringify(mappingStats, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
