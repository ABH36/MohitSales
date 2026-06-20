const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const categories = await prisma.category.findMany({
    where: {
      slug: {
        contains: 'fans'
      }
    }
  });

  const products = await prisma.product.findMany({
    where: {
      slug: {
        contains: 'fans'
      }
    }
  });

  console.log('--- Categories matching "fans" ---');
  console.log(categories.map(c => ({ id: c.id, name: c.name, slug: c.slug, parentId: c.parentId })));

  console.log('--- Products matching "fans" ---');
  console.log(products.map(p => ({ id: p.id, title: p.title, slug: p.slug, categoryId: p.categoryId })));
}

main().catch(err => {
  console.error(err);
}).finally(() => {
  prisma.$disconnect();
});
