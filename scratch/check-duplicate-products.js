const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany({
    include: { category: true }
  });

  const slugMap = new Map();
  const toDelete = [];
  const toUpdate = [];

  for (const prod of products) {
    if (!prod.category) continue;
    const slugParts = prod.slug.split('/');
    const lastPart = slugParts[slugParts.length - 1];
    const targetProductSlug = `${prod.category.slug}/${lastPart}`;

    if (slugMap.has(targetProductSlug)) {
      const existing = slugMap.get(targetProductSlug);
      // We have a duplicate. We will mark this one for deletion to deduplicate.
      toDelete.push({
        id: prod.id,
        title: prod.title,
        slug: prod.slug,
        targetProductSlug,
        duplicateOf: existing.id
      });
    } else {
      slugMap.set(targetProductSlug, { id: prod.id, slug: prod.slug });
      if (prod.slug !== targetProductSlug) {
        toUpdate.push({
          id: prod.id,
          title: prod.title,
          oldSlug: prod.slug,
          newSlug: targetProductSlug
        });
      }
    }
  }

  console.log(`Total products: ${products.length}`);
  console.log(`Unique slugs: ${slugMap.size}`);
  console.log(`Duplicates to delete: ${toDelete.length}`);
  console.log(`Products to update: ${toUpdate.length}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
