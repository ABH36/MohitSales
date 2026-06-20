const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    select: { id: true, slug: true, title: true }
  });

  const categories = await prisma.category.findMany({
    where: { isActive: true },
    select: { id: true, slug: true, name: true }
  });

  const catSlugs = new Map(categories.map(c => [c.slug, c]));

  console.log('--- ACTIVE CONFLICTING SLUGS (Active Product Slug == Active Category Slug) ---');
  let count = 0;
  for (const p of products) {
    if (catSlugs.has(p.slug)) {
      const c = catSlugs.get(p.slug);
      console.log(`Conflict: "${p.slug}"`);
      console.log(`  Product : "${p.title}" (id: ${p.id})`);
      console.log(`  Category: "${c.name}" (id: ${c.id})`);
      count++;
    }
  }
  console.log(`Total active-active conflicts found: ${count}`);
}

main().finally(() => prisma.$disconnect());
