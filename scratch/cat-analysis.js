const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Get all categories with product counts
  const allCats = await prisma.category.findMany({
    include: {
      _count: { select: { products: true } },
      parent: true
    },
    orderBy: { slug: 'asc' }
  });

  console.log('\n=== ALL CATEGORIES WITH PRODUCT COUNTS ===');
  allCats.forEach(c => {
    const parentInfo = c.parent ? ` [parent: ${c.parent.slug}]` : ' [ROOT]';
    console.log(`[${c.isActive ? 'ACTIVE' : 'INACTIVE'}] ${c.slug}${parentInfo} => ${c._count.products} products`);
  });

  // Products by category breakdown (only active categories)
  console.log('\n=== ACTIVE CATEGORY PRODUCT COUNTS ===');
  const activeCats = allCats.filter(c => c.isActive);
  for (const cat of activeCats) {
    const activeProds = await prisma.product.count({ where: { categoryId: cat.id, isActive: true } });
    const inactiveProds = await prisma.product.count({ where: { categoryId: cat.id, isActive: false } });
    if (cat._count.products > 0) {
      console.log(`${cat.slug}: ${cat._count.products} total (${activeProds} active, ${inactiveProds} inactive)`);
    }
  }

  // Check products with no image in active categories
  console.log('\n=== ACTIVE PRODUCTS WITHOUT IMAGES ===');
  const noImageActive = await prisma.product.findMany({
    where: {
      isActive: true,
      OR: [{ imageSrc: null }, { imageSrc: '' }]
    },
    include: { category: true },
    take: 20
  });
  console.log(`Total active products without images: ${noImageActive.length} (showing first 20)`);
  noImageActive.forEach(p => {
    console.log(`- ${p.title} | cat: ${p.category?.slug || 'NULL'} | slug: ${p.slug}`);
  });

  // Check slug pattern for products with images
  console.log('\n=== SAMPLE PRODUCTS WITH IMAGES ===');
  const withImageSample = await prisma.product.findMany({
    where: {
      isActive: true,
      imageSrc: { not: null, not: '' }
    },
    take: 10
  });
  withImageSample.forEach(p => {
    console.log(`- ${p.title}`);
    console.log(`  imageSrc: ${p.imageSrc}`);
  });
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
