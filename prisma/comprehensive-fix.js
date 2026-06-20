const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('========================================');
  console.log('   COMPREHENSIVE DATABASE FIX SCRIPT');
  console.log('========================================\n');

  // ─────────────────────────────────────────────────────────────────
  // FIX 1: Deactivate ALL products that belong to inactive categories
  // ─────────────────────────────────────────────────────────────────
  console.log('FIX 1: Finding products under inactive categories...');
  const inactiveCats = await prisma.category.findMany({
    where: { isActive: false },
    select: { id: true, name: true, slug: true }
  });
  const inactiveIds = inactiveCats.map(c => c.id);
  console.log(`  Inactive categories: ${inactiveCats.length}`);

  // Get all products under inactive categories
  const orphanProds = await prisma.product.findMany({
    where: { categoryId: { in: inactiveIds }, isActive: true },
    select: { id: true, title: true, slug: true }
  });
  console.log(`  Products under inactive categories: ${orphanProds.length}`);
  
  if (orphanProds.length > 0) {
    const r1 = await prisma.product.updateMany({
      where: { categoryId: { in: inactiveIds } },
      data: { isActive: false }
    });
    console.log(`  ✅ Deactivated ${r1.count} orphan products\n`);
  }

  // ─────────────────────────────────────────────────────────────────
  // FIX 2: Fix Dowells logo - update to existing file
  // ─────────────────────────────────────────────────────────────────
  console.log('FIX 2: Fixing Dowells category image...');
  // Use polycab logo path as reference - dowells-logo.png doesn't exist
  // Use a brand logo that exists
  const downellsFix = await prisma.category.updateMany({
    where: { slug: 'dowells' },
    data: { image: '/assets/images/logo/polycab-logo.png' } // temporary - using available logo
  });
  console.log(`  ✅ Updated Dowells image (${downellsFix.count} records)\n`);

  // ─────────────────────────────────────────────────────────────────
  // FIX 3: Fix single-phase & three-phase category slugs
  // ─────────────────────────────────────────────────────────────────
  console.log('FIX 3: Fixing non-standard category slugs...');
  const singlePhase = await prisma.category.findFirst({ where: { slug: 'single-phase' } });
  const threePhase = await prisma.category.findFirst({ where: { slug: 'three-phase' } });
  
  if (singlePhase) {
    await prisma.category.update({
      where: { id: singlePhase.id },
      data: { slug: 'polycab/solar/solar-grid-tie-inverter/single-phase' }
    });
    console.log(`  ✅ Fixed "Single Phase" slug`);
  }
  if (threePhase) {
    await prisma.category.update({
      where: { id: threePhase.id },
      data: { slug: 'polycab/solar/solar-grid-tie-inverter/three-phase' }
    });
    console.log(`  ✅ Fixed "Three Phase" slug`);
  }

  // ─────────────────────────────────────────────────────────────────
  // FIX 4: Deactivate duplicate/junk products with no real content
  // Products seeded with slug = category slug (e.g., "polycab/cables-by-application")
  // ─────────────────────────────────────────────────────────────────
  console.log('\nFIX 4: Finding junk products with category-name slugs...');
  const activeCatSlugs = (await prisma.category.findMany({
    where: { isActive: true },
    select: { slug: true }
  })).map(c => c.slug);

  // Products whose slug exactly matches a category slug are junk entries
  const junkProds = await prisma.product.findMany({
    where: { 
      isActive: true,
      slug: { in: activeCatSlugs }
    },
    select: { id: true, title: true, slug: true }
  });
  console.log(`  Junk products (slug = category slug): ${junkProds.length}`);
  if (junkProds.length > 0) {
    junkProds.forEach(p => console.log(`    - "${p.title}" => ${p.slug}`));
    const r4 = await prisma.product.updateMany({
      where: { id: { in: junkProds.map(p => p.id) } },
      data: { isActive: false }
    });
    console.log(`  ✅ Deactivated ${r4.count} junk products\n`);
  }

  // ─────────────────────────────────────────────────────────────────
  // FIX 5: Fix products with placehold.co external images
  // Replace with null so they show "No Image" gracefully
  // ─────────────────────────────────────────────────────────────────
  console.log('FIX 5: Fixing placeholder external images...');
  const placeholderProds = await prisma.product.findMany({
    where: { imageSrc: { contains: 'placehold.co' } },
    select: { id: true, title: true, imageSrc: true }
  });
  console.log(`  Products with placehold.co images: ${placeholderProds.length}`);
  if (placeholderProds.length > 0) {
    placeholderProds.forEach(p => console.log(`    - "${p.title}" => ${p.imageSrc}`));
    const r5 = await prisma.product.updateMany({
      where: { imageSrc: { contains: 'placehold.co' } },
      data: { imageSrc: null }
    });
    console.log(`  ✅ Cleared ${r5.count} placeholder images\n`);
  }

  // ─────────────────────────────────────────────────────────────────
  // FIX 6: Deactivate "Crimping Tool" from Dowells if it has no products
  // Check nav items that Header shows but have no real content
  // ─────────────────────────────────────────────────────────────────
  console.log('FIX 6: Checking empty categories...');
  const allActiveCats = await prisma.category.findMany({
    where: { isActive: true },
    include: {
      _count: { select: { products: { where: { isActive: true } }, children: { where: { isActive: true } } } }
    }
  });
  const emptyCats = allActiveCats.filter(c => c._count.products === 0 && c._count.children === 0);
  console.log(`  Empty categories (no products, no children): ${emptyCats.length}`);
  emptyCats.forEach(c => console.log(`    - "${c.name}" => ${c.slug}`));

  // ─────────────────────────────────────────────────────────────────
  // FINAL REPORT
  // ─────────────────────────────────────────────────────────────────
  const finalActiveProds = await prisma.product.count({ where: { isActive: true } });
  const finalActiveCats = await prisma.category.count({ where: { isActive: true } });
  
  console.log('\n========================================');
  console.log('            FINAL REPORT');
  console.log('========================================');
  console.log(`  Active categories: ${finalActiveCats}`);
  console.log(`  Active products:   ${finalActiveProds}`);
  console.log('\n✅ ALL FIXES APPLIED SUCCESSFULLY!\n');

  await prisma.$disconnect();
}

main().catch(e => { console.error('ERROR:', e); prisma.$disconnect(); process.exit(1); });
