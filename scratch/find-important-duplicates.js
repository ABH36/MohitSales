const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany({
    include: { category: true }
  });

  const slugMap = new Map();
  const importantDups = [];

  for (const prod of products) {
    if (!prod.category) continue;
    const slugParts = prod.slug.split('/');
    const lastPart = slugParts[slugParts.length - 1];
    const targetProductSlug = `${prod.category.slug}/${lastPart}`;

    if (slugMap.has(targetProductSlug)) {
      const existing = slugMap.get(targetProductSlug);
      // Check if either is modified
      const isExistingModified = existing.updatedAt.getTime() !== existing.createdAt.getTime() || existing.imageSrc || existing.stock > 0 || !existing.isActive;
      const isCurrentModified = prod.updatedAt.getTime() !== prod.createdAt.getTime() || prod.imageSrc || prod.stock > 0 || !prod.isActive;
      
      if (isExistingModified || isCurrentModified) {
        importantDups.push({
          targetProductSlug,
          existing: { id: existing.id, title: existing.title, updatedAt: existing.updatedAt, imageSrc: existing.imageSrc },
          current: { id: prod.id, title: prod.title, updatedAt: prod.updatedAt, imageSrc: prod.imageSrc }
        });
      }
    } else {
      slugMap.set(targetProductSlug, prod);
    }
  }

  console.log(`Found ${importantDups.length} duplicates with modifications/assets:`);
  console.log(JSON.stringify(importantDups.slice(0, 10), null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
