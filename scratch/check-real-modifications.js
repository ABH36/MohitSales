const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany({
    include: { category: true }
  });

  const slugMap = new Map();
  const realDups = [];

  for (const prod of products) {
    if (!prod.category) continue;
    const slugParts = prod.slug.split('/');
    const lastPart = slugParts[slugParts.length - 1];
    const targetProductSlug = `${prod.category.slug}/${lastPart}`;

    if (slugMap.has(targetProductSlug)) {
      const existing = slugMap.get(targetProductSlug);
      // Check for real modifications (stock, image, or active status)
      const hasRealMod = prod.imageSrc || prod.stock > 0 || !prod.isActive ||
                          existing.imageSrc || existing.stock > 0 || !existing.isActive;
      if (hasRealMod) {
        realDups.push({
          targetProductSlug,
          existing: { id: existing.id, title: existing.title, imageSrc: existing.imageSrc, stock: existing.stock, isActive: existing.isActive },
          current: { id: prod.id, title: prod.title, imageSrc: prod.imageSrc, stock: prod.stock, isActive: prod.isActive }
        });
      }
    } else {
      slugMap.set(targetProductSlug, prod);
    }
  }

  console.log(`Found ${realDups.length} duplicates with real modifications:`);
  console.log(JSON.stringify(realDups, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
