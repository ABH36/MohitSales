const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const prods = await prisma.product.findMany({
    where: { category: { slug: 'industries' } }
  });

  const emptyPatternProds = prods.filter(p => {
    const parts = p.slug.split('/');
    return parts.length <= 1;
  });

  console.log(`Found ${emptyPatternProds.length} products with 1-part slug:`);
  for (const p of emptyPatternProds.slice(0, 10)) {
    console.log(`- ${p.title} (${p.slug})`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
