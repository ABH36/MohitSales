const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany({
    where: {
      slug: {
        contains: 'fans'
      }
    },
    select: {
      id: true,
      title: true,
      slug: true,
      isActive: true,
      categoryId: true,
      category: {
        select: {
          name: true,
          slug: true
        }
      }
    }
  });
  console.log('--- PRODUCTS CONTAINING "FANS" ---');
  console.log(JSON.stringify(products, null, 2));

  const categories = await prisma.category.findMany({
    where: {
      slug: {
        contains: 'fans'
      }
    },
    select: {
      id: true,
      name: true,
      slug: true,
      isActive: true
    }
  });
  console.log('--- CATEGORIES CONTAINING "FANS" ---');
  console.log(JSON.stringify(categories, null, 2));
}

main().finally(() => prisma.$disconnect());
