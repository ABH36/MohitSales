const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany({
    select: { id: true, slug: true, title: true, isActive: true }
  });

  const categories = await prisma.category.findMany({
    select: { id: true, slug: true, name: true, isActive: true }
  });

  const catSlugs = new Map(categories.map(c => [c.slug, c]));

  console.log('--- CONFLICTING SLUGS (Product Slug == Category Slug) ---');
  let count = 0;
  for (const p of products) {
    if (catSlugs.has(p.slug)) {
      const c = catSlugs.get(p.slug);
      console.log(`Conflict found on slug: "${p.slug}"`);
      console.log(`  Product : "${p.title}" (id: ${p.id}, isActive: ${p.isActive})`);
      console.log(`  Category: "${c.name}" (id: ${c.id}, isActive: ${c.isActive})`);
      count++;
    }
  }
  console.log(`Total conflicts found: ${count}`);
}

main().finally(() => prisma.$disconnect());
