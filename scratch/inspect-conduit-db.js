const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany({
    where: {
      slug: {
        contains: 'conduit'
      }
    },
    include: {
      category: true
    }
  });

  console.log('--- PRODUCTS CONTAINING CONDUIT ---');
  console.log(JSON.stringify(products, null, 2));

  const categories = await prisma.category.findMany({
    where: {
      slug: {
        contains: 'conduit'
      }
    }
  });

  console.log('--- CATEGORIES CONTAINING CONDUIT ---');
  console.log(JSON.stringify(categories, null, 2));
}

main().finally(() => prisma.$disconnect());
