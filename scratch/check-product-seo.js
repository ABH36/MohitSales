const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany({
    where: {
      OR: [
        { NOT: { metaTitle: null } },
        { NOT: { metaDescription: null } }
      ]
    },
    select: { id: true, slug: true, title: true, metaTitle: true, metaDescription: true }
  });

  const categories = await prisma.category.findMany({
    where: {
      OR: [
        { NOT: { description: null } } // Category has no metaTitle/metaDescription directly in schema except description
      ]
    },
    select: { id: true, slug: true, name: true, description: true }
  });

  console.log('Products with meta:');
  console.log(JSON.stringify(products, null, 2));
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
