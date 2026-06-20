const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // 1. Count active vs inactive products
  const [totalProducts, activeProducts, inactiveProducts, inStockProducts, outOfStockProducts] = await Promise.all([
    prisma.product.count(),
    prisma.product.count({ where: { isActive: true } }),
    prisma.product.count({ where: { isActive: false } }),
    prisma.product.count({ where: { isActive: true, stock: { gt: 0 } } }),
    prisma.product.count({ where: { OR: [{ isActive: false }, { stock: { lte: 0 } }] } }),
  ]);

  console.log('=== PRODUCT STATS ===');
  console.log(`Total products: ${totalProducts}`);
  console.log(`Active products: ${activeProducts}`);
  console.log(`Inactive products: ${inactiveProducts}`);
  console.log(`In-stock + active (visible on site): ${inStockProducts}`);
  console.log(`Out-of-stock or inactive (hidden on site): ${outOfStockProducts}`);

  // 2. Count categories
  const [totalCats, activeCats, inactiveCats] = await Promise.all([
    prisma.category.count(),
    prisma.category.count({ where: { isActive: true } }),
    prisma.category.count({ where: { isActive: false } }),
  ]);

  console.log('\n=== CATEGORY STATS ===');
  console.log(`Total categories: ${totalCats}`);
  console.log(`Active categories: ${activeCats}`);
  console.log(`Inactive categories: ${inactiveCats}`);

  // 3. Check if any inactive categories still have active products
  const inactiveCatsWithActiveProducts = await prisma.category.findMany({
    where: { isActive: false },
    include: { products: { where: { isActive: true } } }
  });
  const problematic = inactiveCatsWithActiveProducts.filter(c => c.products.length > 0);
  if (problematic.length > 0) {
    console.log('\n⚠️ INACTIVE CATEGORIES WITH ACTIVE PRODUCTS:');
    for (const c of problematic) {
      console.log(`  - ${c.name} (${c.slug}): ${c.products.length} active products`);
    }
  } else {
    console.log('\n✅ No inactive categories contain active products.');
  }

  // 4. Products with images
  const withImages = await prisma.product.count({ where: { isActive: true, imageSrc: { not: null } } });
  const withoutImages = await prisma.product.count({ where: { isActive: true, imageSrc: null } });
  console.log(`\n=== IMAGE STATS ===`);
  console.log(`Active products with images: ${withImages}`);
  console.log(`Active products without images: ${withoutImages}`);

  // 5. Check for any remaining industries/ slugs
  const industriesCats = await prisma.category.findMany({
    where: { slug: { startsWith: 'industries' } }
  });
  if (industriesCats.length > 0) {
    console.log('\n⚠️ REMAINING industries/ CATEGORIES:');
    for (const c of industriesCats) {
      console.log(`  - ${c.name} (${c.slug}) isActive: ${c.isActive}`);
    }
  } else {
    console.log('\n✅ No remaining industries/ categories (cleaned up).');
  }

  const industriesProducts = await prisma.product.findMany({
    where: { slug: { startsWith: 'industries/' } }
  });
  if (industriesProducts.length > 0) {
    console.log(`\n⚠️ ${industriesProducts.length} PRODUCTS STILL HAVE industries/ SLUG PREFIX:`);
    for (const p of industriesProducts.slice(0, 5)) {
      console.log(`  - ${p.title} (${p.slug})`);
    }
    if (industriesProducts.length > 5) console.log(`  ... and ${industriesProducts.length - 5} more`);
  } else {
    console.log('✅ No products have industries/ slug prefix.');
  }

  // 6. Check top categories and their product counts
  console.log('\n=== TOP-LEVEL CATEGORY SUMMARY ===');
  const topCats = await prisma.category.findMany({
    where: { parentId: null, isActive: true },
    include: {
      _count: { select: { products: true, children: true } }
    }
  });
  for (const c of topCats) {
    // Count all descendant products recursively
    const allDescendantCats = await prisma.category.findMany({
      where: { slug: { startsWith: c.slug + '/' } }
    });
    const allCatIds = [c.id, ...allDescendantCats.map(d => d.id)];
    const totalDescProducts = await prisma.product.count({
      where: { categoryId: { in: allCatIds }, isActive: true, stock: { gt: 0 } }
    });
    console.log(`📁 ${c.name} (${c.slug}): ${c._count.children} children, ${totalDescProducts} visible products (all levels)`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
