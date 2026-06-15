const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany({
    include: { category: true }
  });

  const categoryProductCount = {};
  for (const prod of products) {
    const catSlug = prod.category ? prod.category.slug : 'NO_CATEGORY';
    categoryProductCount[catSlug] = (categoryProductCount[catSlug] || 0) + 1;
  }

  console.log('Product count by category slug:');
  console.log(JSON.stringify(categoryProductCount, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
