const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Check remaining inactive categories
  const cats = await prisma.category.findMany({ 
    where: { isActive: false }, 
    include: { _count: { select: { products: true } } } 
  });
  console.log('Remaining inactive categories:');
  cats.forEach(c => console.log(`  ${c.slug} - products: ${c._count.products}`));

  // Products in inactive categories
  const prods = await prisma.product.findMany({
    where: { category: { isActive: false } },
    include: { category: true }
  });
  console.log(`\nProducts in inactive cats: ${prods.length}`);
  prods.forEach(pr => console.log(`  - ${pr.title} | ${pr.category?.slug} | isActive: ${pr.isActive}`));

  // Overall stats
  const totalActive = await prisma.product.count({ where: { isActive: true } });
  const totalInactive = await prisma.product.count({ where: { isActive: false } });
  const withImg = await prisma.product.count({ where: { imageSrc: { not: null } } });
  console.log(`\n=== STATS ===`);
  console.log(`Active products: ${totalActive}`);
  console.log(`Inactive products: ${totalInactive}`);
  console.log(`With images: ${withImg}`);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
