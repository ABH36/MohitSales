const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const slugPath = 'industries/cables-by-standards/indian-standards';
  
  const dbCategory = await prisma.category.findUnique({
    where: { slug: slugPath },
    include: { products: true }
  });

  console.log('Query result with direct slugPath:');
  console.log('dbCategory found:', !!dbCategory);
  if (dbCategory) {
    console.log(`Products count: ${dbCategory.products.length}`);
  }

  // Check if there is any mapping or redirect happening
  const allCats = await prisma.category.findMany({
    select: { slug: true }
  });
  console.log('\nAll Category Slugs in DB:');
  allCats.forEach(c => console.log(`- ${c.slug}`));
}

main().catch(console.error).finally(() => prisma.$disconnect());
