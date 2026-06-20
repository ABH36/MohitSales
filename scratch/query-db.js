const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany({
    where: {
      slug: {
        contains: 'water-heater'
      }
    }
  });
  console.log('--- PRODUCTS IN DB ---');
  console.log(JSON.stringify(products, null, 2));

  const categories = await prisma.category.findMany({
    where: {
      slug: {
        contains: 'water-heater'
      }
    }
  });
  console.log('--- CATEGORIES IN DB ---');
  console.log(JSON.stringify(categories, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
