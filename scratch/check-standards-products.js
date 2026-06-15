const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const prods = await prisma.product.findMany({
    where: { category: { slug: 'polycab/cables-by-standards' } }
  });
  console.log(`Found ${prods.length} products with category slug 'polycab/cables-by-standards':`);
  for (const p of prods.slice(0, 10)) {
    console.log(`- ${p.title} (${p.slug})`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
