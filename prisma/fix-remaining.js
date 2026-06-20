const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('========== FIXING REMAINING ISSUES ==========\n');

  // Fix 1: Dowells logo - use actual dowells image
  const r1 = await prisma.category.updateMany({
    where: { slug: 'dowells' },
    data: { image: '/assets/images/our_products/dowells/cable_terminal_dowells.png' }
  });
  console.log(`✅ Dowells logo fixed (${r1.count})`);

  // Fix 2: Update Crimping Tool category image (it exists in our_products/dowells)
  const crimpingCat = await prisma.category.findFirst({ where: { slug: 'dowells/crimping-tool' } });
  if (crimpingCat) {
    await prisma.category.update({
      where: { id: crimpingCat.id },
      data: { image: '/assets/images/our_products/dowells/crimping_tool_dowells.png' }
    });
    console.log(`✅ Crimping Tool image fixed`);
  } else {
    console.log(`  Crimping Tool category not found in DB`);
  }

  // Fix 3: Show current nav structure cleanly
  const cats = await prisma.category.findMany({
    where: { isActive: true },
    select: { id: true, name: true, slug: true, parentId: true, image: true },
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }]
  });

  // Check which categories from the original site navigation are MISSING in DB
  const expectedSlugs = [
    // Polycab
    'polycab',
    'polycab/cables-by-application',
    'polycab/cables-by-standards', 
    'polycab/cables-by-type',
    'polycab/switchgears',
    'polycab/fans',
    'polycab/solar',
    'polycab/conduit-and-accessories',
    'polycab/home-appliances',
    // Dowells
    'dowells',
    'dowells/cable-terminal',
    'dowells/gland',
    'dowells/crimping-tool',
  ];

  const existingSlugs = cats.map(c => c.slug);
  const missingSlugs = expectedSlugs.filter(s => !existingSlugs.includes(s));
  console.log(`\n========== MISSING EXPECTED CATEGORIES ==========`);
  if (missingSlugs.length === 0) {
    console.log('  ✅ All expected categories exist in DB!');
  } else {
    missingSlugs.forEach(s => console.log(`  MISSING: ${s}`));
  }

  // Fix 4: Add Crimping Tool to Dowells if missing
  if (missingSlugs.includes('dowells/crimping-tool')) {
    const downellsCat = cats.find(c => c.slug === 'dowells');
    if (downellsCat) {
      await prisma.category.create({
        data: {
          id: 'dowells-crimping-tool-id',
          slug: 'dowells/crimping-tool',
          name: 'Crimping Tool',
          parentId: downellsCat.id,
          isActive: true,
          sortOrder: 3,
          image: '/assets/images/our_products/dowells/crimping_tool_dowells.png'
        }
      });
      console.log(`  ✅ Created Crimping Tool category`);
    }
  }

  // Final active products count properly
  const activeProds = await prisma.product.count({ where: { isActive: true } });
  const activeCats = await prisma.category.count({ where: { isActive: true } });
  
  // Show all active categories in tree
  const finalCats = await prisma.category.findMany({
    where: { isActive: true },
    select: { id: true, name: true, slug: true, parentId: true },
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }]
  });
  
  const roots = finalCats.filter(c => !c.parentId);
  console.log('\n========== FINAL CLEAN CATEGORY TREE ==========');
  function printTree(parentId, depth) {
    const children = finalCats.filter(c => c.parentId === parentId);
    children.forEach(c => {
      const indent = '  '.repeat(depth);
      const prodCount = ''; // skip for speed
      console.log(`${indent}├─ "${c.name}" (/${c.slug})`);
      printTree(c.id, depth + 1);
    });
  }
  roots.forEach(r => {
    console.log(`\n[ROOT] "${r.name}" (/${r.slug})`);
    printTree(r.id, 1);
  });

  console.log(`\n========== SUMMARY ==========`);
  console.log(`  Active categories: ${activeCats}`);
  console.log(`  Active products:   ${activeProds}`);
  console.log('\n✅ ALL DONE!\n');

  await prisma.$disconnect();
}

main().catch(e => { console.error('ERROR:', e); prisma.$disconnect(); });
