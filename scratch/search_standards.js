const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const cats = await prisma.category.findMany({
    where: {
      OR: [
        { name: { contains: 'Standard', mode: 'insensitive' } },
        { name: { contains: 'IS', mode: 'insensitive' } }
      ]
    }
  });

  const prods = await prisma.product.findMany({
    where: {
      OR: [
        { title: { contains: 'Standard', mode: 'insensitive' } },
        { title: { contains: 'IS', mode: 'insensitive' } }
      ]
    },
    take: 10
  });

  console.log('Categories found for standards:');
  console.log(cats.map(c => ({ name: c.name, slug: c.slug, id: c.id })));

  console.log('\nSample Products found for standards:');
  console.log(prods.map(p => ({ title: p.title, slug: p.slug })));
}

run().catch(console.error).finally(() => prisma.$disconnect());
