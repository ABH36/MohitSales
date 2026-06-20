const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany({
    where: {
      category: {
        slug: 'polycab/cables/cables-by-application/manufacturing-industries/residential'
      }
    },
    include: { category: true }
  });

  console.log(`Remaining products under manufacturing-industries/residential: ${products.length}`);
  products.forEach(p => {
    console.log({
      id: p.id,
      title: p.title,
      slug: p.slug
    });
  });

  await prisma.$disconnect();
}

main();
