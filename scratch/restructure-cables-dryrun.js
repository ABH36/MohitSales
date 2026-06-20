const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('=== DRY RUN: RESTURCTURING CABLES ===');

  const cablesRoot = await prisma.category.findUnique({
    where: { slug: 'polycab/cables' }
  });

  if (!cablesRoot) {
    console.log('Error: polycab/cables not found in DB');
    return;
  }

  const polycabRoot = await prisma.category.findUnique({
    where: { slug: 'polycab' }
  });

  if (!polycabRoot) {
    console.log('Error: polycab root not found in DB');
    return;
  }

  // Find descendant categories
  const descendantCats = await prisma.category.findMany({
    where: { slug: { startsWith: 'polycab/cables/' } }
  });

  console.log(`\nCategories to be updated: ${descendantCats.length}`);
  for (const c of descendantCats) {
    const targetSlug = c.slug.replace('polycab/cables/', 'polycab/');
    console.log(`  - Category: "${c.name}"`);
    console.log(`    Current: "${c.slug}"`);
    console.log(`    Target:  "${targetSlug}"`);
    if (c.parentId === cablesRoot.id) {
      console.log(`    Parent:  "polycab/cables" -> "polycab"`);
    }
  }

  // Find products to be updated
  const products = await prisma.product.findMany({
    where: { slug: { startsWith: 'polycab/cables/' } }
  });

  console.log(`\nProducts to be updated: ${products.length}`);
  let conflicts = 0;
  for (const p of products.slice(0, 10)) {
    const targetSlug = p.slug.replace('polycab/cables/', 'polycab/');
    // Check if target slug already exists in DB
    const existing = await prisma.product.findFirst({
      where: { slug: targetSlug, id: { not: p.id } }
    });
    if (existing) {
      console.log(`  ⚠️ CONFLICT for product: "${p.title}"`);
      console.log(`    Target slug "${targetSlug}" already occupied by product ID "${existing.id}" ("${existing.title}")`);
      conflicts++;
    }
  }
  if (products.length > 10) {
    console.log(`  ... and ${products.length - 10} more products ...`);
    // Check all products for conflicts
    for (let i = 10; i < products.length; i++) {
      const p = products[i];
      const targetSlug = p.slug.replace('polycab/cables/', 'polycab/');
      const existing = await prisma.product.findFirst({
        where: { slug: targetSlug, id: { not: p.id } }
      });
      if (existing) {
        conflicts++;
      }
    }
  }

  console.log(`\nTotal potential product slug conflicts: ${conflicts}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
