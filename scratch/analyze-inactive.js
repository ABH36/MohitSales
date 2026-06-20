const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const prisma = new PrismaClient();

async function main() {
  // Load content export
  const content = JSON.parse(fs.readFileSync('content-export.json', 'utf8'));
  console.log(`Loaded ${content.length} items from content-export.json`);
  
  // Build lookup maps from content-export.json
  // 1) By slug (from path without .php)
  const bySlug = new Map();
  // 2) By title (normalized)
  const byTitle = new Map();
  
  content.forEach(item => {
    if (item.path) {
      const slug = item.path.replace(/\.php$/, '').toLowerCase();
      bySlug.set(slug, item);
    }
    if (item.title) {
      byTitle.set(item.title.trim().toLowerCase(), item);
    }
    if (item.heading) {
      byTitle.set(item.heading.trim().toLowerCase(), item);
    }
  });
  
  console.log(`Index built: ${bySlug.size} by slug, ${byTitle.size} by title`);
  
  // Find inactive products to check if they have images in content-export.json
  const inactiveProds = await prisma.product.findMany({
    where: { isActive: false },
    include: { category: true },
    orderBy: { slug: 'asc' }
  });
  
  console.log(`\nTotal inactive products: ${inactiveProds.length}`);
  
  let canActivate = 0;
  let hasImage = 0;
  let hasLegacyImage = 0;
  const genericTitles = new Set(['Renewable Energy', 'Others', 'Special Cable', 'Rubber Cable', 'Building Infrastructure', 'Manufacturing Industries', 'Exploration Industries', 'Mobility Infrastructure', 'Energy and Power Grid', 'Cables By Application', 'Cables By Type', 'Cables By Standards', 'International Standards', 'Indian Standards', 'Communication & Data Cable', 'EHV Power Cable', 'LV Power Cable', 'MV Power Cable', 'Instrumentation Cable']);
  
  const activateCandidates = [];
  
  for (const prod of inactiveProds) {
    if (genericTitles.has(prod.title)) continue;
    
    // Check if it has valid content
    const slug = prod.slug.toLowerCase();
    const legacyItem = bySlug.get(slug) || byTitle.get(prod.title.trim().toLowerCase());
    
    const imageToUse = prod.imageSrc || (legacyItem && legacyItem.imageSrc ? legacyItem.imageSrc : null);
    
    canActivate++;
    if (prod.imageSrc) hasImage++;
    if (legacyItem && legacyItem.imageSrc && !prod.imageSrc) hasLegacyImage++;
    
    activateCandidates.push({
      id: prod.id,
      slug: prod.slug,
      title: prod.title,
      currentImage: prod.imageSrc,
      legacyImage: legacyItem ? legacyItem.imageSrc : null,
      imageToUse
    });
  }
  
  console.log(`\nProducts that CAN be activated: ${canActivate}`);
  console.log(`  - Already have image: ${hasImage}`);
  console.log(`  - Can get image from legacy JSON: ${hasLegacyImage}`);
  
  // Sample some that can be activated
  console.log('\nFirst 20 activation candidates:');
  activateCandidates.slice(0, 20).forEach(p => {
    console.log(`  [${p.imageToUse ? 'HAS_IMG' : 'NO_IMG'}] ${p.title} | ${p.slug}`);
  });
  
  // Show breakdown by category
  console.log('\nBreakdown by category (inactive products by cat):');
  const byCat = {};
  for (const prod of inactiveProds) {
    const catSlug = prod.category ? prod.category.slug : 'NO_CAT';
    if (!byCat[catSlug]) byCat[catSlug] = { total: 0, generic: 0, activatable: 0 };
    byCat[catSlug].total++;
    if (genericTitles.has(prod.title)) {
      byCat[catSlug].generic++;
    } else {
      byCat[catSlug].activatable++;
    }
  }
  
  Object.entries(byCat).sort((a, b) => b[1].total - a[1].total).forEach(([cat, counts]) => {
    console.log(`  ${cat}: total=${counts.total}, generic=${counts.generic}, activatable=${counts.activatable}`);
  });
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
