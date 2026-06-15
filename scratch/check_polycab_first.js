const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany({
    where: { slug: { contains: 'polycab' } },
    take: 10
  });
  console.log(products.map(p => ({ title: p.title, slug: p.slug, imageSrc: p.imageSrc })));
  await prisma.$disconnect();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
