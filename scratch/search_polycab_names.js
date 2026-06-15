const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany({
    where: {
      OR: [
        { title: { contains: 'EHV Power' } },
        { title: { contains: 'LV Power' } },
        { title: { contains: 'MV Power' } }
      ]
    }
  });
  console.log(products.map(p => ({ id: p.id, title: p.title, slug: p.slug, imageSrc: p.imageSrc })));
  await prisma.$disconnect();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
