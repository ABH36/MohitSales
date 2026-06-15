const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const generalProds = await prisma.product.findMany({
    where: { category: { name: 'General' } }
  });
  
  const categories = await prisma.category.findMany();
  const catMap = new Map();
  categories.forEach(c => catMap.set(c.slug, c.id));
  
  let updated = 0;
  let notFound = new Set();

  for (const p of generalProds) {
    const parts = p.slug.split('/');
    if (parts.length > 1) {
      const catSlug = parts[parts.length - 2];
      if (catMap.has(catSlug)) {
        await prisma.product.update({
          where: { id: p.id },
          data: { categoryId: catMap.get(catSlug) }
        });
        updated++;
      } else {
        notFound.add(catSlug);
      }
    }
  }
  
  console.log('Updated products:', updated);
  console.log('Category slugs not found in DB:', Array.from(notFound));
}

main().catch(console.error).finally(() => prisma.$disconnect());
