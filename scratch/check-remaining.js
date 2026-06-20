const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const inactiveCats = await prisma.category.findMany({
    where: { isActive: false },
    include: {
      products: {
        where: { isActive: true }
      },
      _count: {
        select: { products: true, children: true }
      }
    }
  });

  console.log('Inactive categories with active products:');
  for (const cat of inactiveCats) {
    if (cat.products.length > 0) {
      console.log(`- Cat: ${cat.name} (${cat.slug}), ID: ${cat.id}`);
      console.log(`  Active products count: ${cat.products.length}`);
      for (const p of cat.products) {
        console.log(`    * ${p.title} (${p.slug})`);
      }
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
