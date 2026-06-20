const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany({
    select: { id: true, slug: true, title: true, isActive: true, description: true, features: true, imageSrc: true }
  });

  const categories = await prisma.category.findMany({
    select: { id: true, slug: true, name: true, isActive: true }
  });

  const catSlugs = new Map(categories.map(c => [c.slug, c]));

  console.log('--- DETAILED CONFLICTING PRODUCTS ---');
  for (const p of products) {
    if (catSlugs.has(p.slug)) {
      const c = catSlugs.get(p.slug);
      console.log(`\nSlug: ${p.slug}`);
      console.log(`  Product:`);
      console.log(`    Id         : ${p.id}`);
      console.log(`    Title      : ${p.title}`);
      console.log(`    isActive   : ${p.isActive}`);
      console.log(`    Has Desc   : ${!!p.description}`);
      console.log(`    Has Feats  : ${!!p.features}`);
      console.log(`    Image      : ${p.imageSrc}`);
      if (p.features && p.features.length < 200) {
        console.log(`    Feats content: ${p.features}`);
      }
      console.log(`  Category:`);
      console.log(`    Id         : ${c.id}`);
      console.log(`    Name       : ${c.name}`);
      console.log(`    isActive   : ${c.isActive}`);
    }
  }
}

main().finally(() => prisma.$disconnect());
