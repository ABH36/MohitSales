const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany({
    include: { category: true }
  });

  const slugMap = new Map();
  const duplicates = [];

  for (const prod of products) {
    if (!prod.category) continue;
    const slugParts = prod.slug.split('/');
    const lastPart = slugParts[slugParts.length - 1];
    const targetProductSlug = `${prod.category.slug}/${lastPart}`;
    
    if (slugMap.has(targetProductSlug)) {
      duplicates.push({
        targetProductSlug,
        existing: slugMap.get(targetProductSlug),
        current: { id: prod.id, title: prod.title, slug: prod.slug }
      });
    } else {
      slugMap.set(targetProductSlug, { id: prod.id, title: prod.title, slug: prod.slug });
    }
  }

  console.log(`Found ${duplicates.length} duplicate slugs out of ${products.length} products:`);
  console.log(JSON.stringify(duplicates.slice(0, 10), null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
