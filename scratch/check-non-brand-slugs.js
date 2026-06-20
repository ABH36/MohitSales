const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      NOT: {
        OR: [
          { slug: { startsWith: 'polycab/' } },
          { slug: { startsWith: 'dowells/' } }
        ]
      }
    },
    select: {
      id: true,
      title: true,
      slug: true,
      isActive: true
    }
  });

  console.log('--- ACTIVE PRODUCTS WITHOUT BRAND PREFIX ---');
  console.log(JSON.stringify(products, null, 2));
}

main().finally(() => prisma.$disconnect());
