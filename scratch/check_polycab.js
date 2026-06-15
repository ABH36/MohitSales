const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany({
    where: { slug: { contains: 'polycab' } }
  });
  console.log(products.map(p => ({ id: p.id, title: p.title, slug: p.slug, imageSrc: p.imageSrc })));
  await prisma.$disconnect();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
