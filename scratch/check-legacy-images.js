const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const prisma = new PrismaClient();

async function main() {
  // Load content export
  const content = JSON.parse(fs.readFileSync('content-export.json', 'utf8'));
  
  // Build slug map
  const bySlug = new Map();
  const byTitle = new Map();
  content.forEach(item => {
    if (item.path) {
      const slug = item.path.replace(/\.php$/, '').toLowerCase();
      bySlug.set(slug, item);
    }
    if (item.title) byTitle.set(item.title.trim().toLowerCase(), item);
    if (item.heading) byTitle.set(item.heading.trim().toLowerCase(), item);
  });
  
  // Check for "cables-by-type/others" products in legacy
  console.log('=== Legacy items for cables-by-type/others ===');
  const othersItems = content.filter(i => i.path && i.path.includes('cables-by-type'));
  console.log(`Found ${othersItems.length} legacy items with cables-by-type in path`);
  othersItems.slice(0, 10).forEach(i => {
    console.log(`  path: ${i.path}, imageSrc: ${i.imageSrc || 'NONE'}`);
  });

  // Check for "cables-by-standards" in legacy
  console.log('\n=== Legacy items for indian-standards ===');
  const stdItems = content.filter(i => i.path && i.path.includes('indian-standards'));
  console.log(`Found ${stdItems.length} legacy items with indian-standards in path`);
  stdItems.slice(0, 5).forEach(i => {
    console.log(`  path: ${i.path}, imageSrc: ${i.imageSrc || 'NONE'}, title: ${i.title || i.heading}`);
  });

  // Get all inactive products that have NO image and check if legacy has image
  const inactiveNoImg = await prisma.product.findMany({
    where: { isActive: false, OR: [{ imageSrc: null }, { imageSrc: '' }] },
    take: 20
  });
  
  console.log(`\n=== Inactive products WITHOUT image - checking legacy ===`);
  let foundInLegacy = 0;
  for (const prod of inactiveNoImg) {
    // Try to find by slug
    const legacyItem = bySlug.get(prod.slug.toLowerCase()) || byTitle.get(prod.title.trim().toLowerCase());
    if (legacyItem && legacyItem.imageSrc) {
      foundInLegacy++;
      console.log(`  FOUND: ${prod.title} => ${legacyItem.imageSrc}`);
    }
  }
  console.log(`Found ${foundInLegacy}/${inactiveNoImg.length} with legacy images`);

  // Look at a few "others" products to see their legacy
  const othersProds = await prisma.product.findMany({
    where: { categoryId: (await prisma.category.findUnique({ where: { slug: 'polycab/cables/cables-by-type/others' } }))?.id },
    take: 10
  });
  
  console.log('\n=== Sample Others category products ===');
  for (const prod of othersProds) {
    const legItem = bySlug.get(prod.slug.toLowerCase()) || byTitle.get(prod.title.trim().toLowerCase());
    console.log(`  ${prod.title} | imageSrc: ${prod.imageSrc || 'NONE'} | legacy: ${legItem ? (legItem.imageSrc || 'found but no img') : 'NOT IN LEGACY'}`);
  }
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
