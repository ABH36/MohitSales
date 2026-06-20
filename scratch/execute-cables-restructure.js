const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🏁 Starting database restructuring for Cables...');

  const cablesRoot = await prisma.category.findUnique({
    where: { slug: 'polycab/cables' }
  });

  if (!cablesRoot) {
    console.error('❌ Error: polycab/cables not found in DB!');
    return;
  }

  const polycabRoot = await prisma.category.findUnique({
    where: { slug: 'polycab' }
  });

  if (!polycabRoot) {
    console.error('❌ Error: polycab root not found in DB!');
    return;
  }

  console.log(`Polycab ID: ${polycabRoot.id}`);
  console.log(`Cables ID: ${cablesRoot.id}`);

  // 1. Fetch all categories under polycab/cables/
  const descendantCats = await prisma.category.findMany({
    where: { slug: { startsWith: 'polycab/cables/' } }
  });
  console.log(`Found ${descendantCats.length} categories to update.`);

  // 2. Update category slugs and parents
  for (const c of descendantCats) {
    const targetSlug = c.slug.replace('polycab/cables/', 'polycab/');
    const newParentId = c.parentId === cablesRoot.id ? polycabRoot.id : c.parentId;

    console.log(`Updating Category: "${c.name}"`);
    console.log(`  Slug: "${c.slug}" -> "${targetSlug}"`);
    if (c.parentId === cablesRoot.id) {
      console.log(`  Parent: cables -> polycab`);
    }

    await prisma.category.update({
      where: { id: c.id },
      data: {
        slug: targetSlug,
        parentId: newParentId
      }
    });
  }
  console.log('✅ Updated all categories.');

  // 3. Fetch all products with polycab/cables/ slug
  const products = await prisma.product.findMany({
    where: { slug: { startsWith: 'polycab/cables/' } }
  });
  console.log(`Found ${products.length} products to update.`);

  // 4. Update product slugs
  let updatedCount = 0;
  for (const p of products) {
    const targetSlug = p.slug.replace('polycab/cables/', 'polycab/');
    
    // Safety check for conflict
    const conflict = await prisma.product.findFirst({
      where: { slug: targetSlug, id: { not: p.id } }
    });

    if (conflict) {
      console.log(`⚠️ Conflict: Product with slug "${targetSlug}" already exists. Deleting orphan duplicate.`);
      await prisma.product.delete({
        where: { id: p.id }
      });
    } else {
      await prisma.product.update({
        where: { id: p.id },
        data: { slug: targetSlug }
      });
      updatedCount++;
    }
  }
  console.log(`✅ Updated ${updatedCount} products, resolved conflicts.`);

  // 5. Delete the polycab/cables category
  console.log('Deleting polycab/cables category...');
  await prisma.category.delete({
    where: { id: cablesRoot.id }
  });
  console.log('✅ Deleted cables root category.');

  console.log('🎉 RESTURCTURING COMPLETED SUCCESSFULLY!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
