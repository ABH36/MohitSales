const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany({
    where: {
      NOT: [
        { features: '[]' },
        { features: null },
        { features: '' }
      ]
    },
    take: 10
  });

  console.log('--- PRODUCTS WITH REAL FEATURES IN DB ---');
  console.log(`Found: ${products.length} products`);
  products.forEach(p => {
    console.log(`Product: ${p.title} | Slug: ${p.slug}`);
    console.log(`Features: ${p.features}`);
    console.log('---');
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
