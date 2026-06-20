const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Find and deactivate "General" category and all its children
  const generalCat = await prisma.category.findFirst({
    where: { slug: 'general' },
    select: { id: true, name: true, slug: true }
  });
  
  if (generalCat) {
    console.log(`Found "General" category: id=${generalCat.id}`);
    
    // Deactivate General and all categories under it
    const result = await prisma.category.updateMany({
      where: {
        OR: [
          { id: generalCat.id },
          { slug: { startsWith: 'general/' } },
          // Also deactivate any children via parentId
          { parentId: generalCat.id }
        ]
      },
      data: { isActive: false }
    });
    console.log(`✅ Deactivated ${result.count} "General" related categories`);
  } else {
    console.log('No "General" category found');
  }

  // Also check for "out of stock" display - check products with stock=0
  const outOfStock = await prisma.product.count({ where: { stock: 0 } });
  const inStock = await prisma.product.count({ where: { stock: { gt: 0 } } });
  const nullStock = await prisma.product.count({ where: { stock: null } });
  console.log(`\nProduct stock status: 0-stock=${outOfStock}, in-stock=${inStock}, null-stock=${nullStock}`);

  // Final active roots
  const roots = await prisma.category.findMany({
    where: { parentId: null, isActive: true },
    select: { id: true, name: true, slug: true },
    orderBy: { sortOrder: 'asc' }
  });
  
  console.log('\n=== FINAL ACTIVE ROOT CATEGORIES ===');
  roots.forEach(r => console.log(`  ✓ "${r.name}" (${r.slug})`));

  await prisma.$disconnect();
}

main().catch(e => { console.error('ERROR:', e); prisma.$disconnect(); });
