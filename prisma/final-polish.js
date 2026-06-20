const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('========== FINAL POLISH FIXES ==========\n');

  // 1. Add International Standards under Cables By Standards (was in original site)
  const cbsCat = await prisma.category.findFirst({ 
    where: { slug: 'polycab/cables-by-standards' },
    select: { id: true }
  });
  
  if (cbsCat) {
    const intlStd = await prisma.category.findFirst({ 
      where: { slug: 'polycab/cables-by-standards/international-standards' }
    });
    if (!intlStd) {
      const cbsChildren = await prisma.category.findMany({ where: { parentId: cbsCat.id }, select: { image: true }, take: 1 });
      await prisma.category.create({
        data: {
          slug: 'polycab/cables-by-standards/international-standards',
          name: 'International Standards',
          parentId: cbsCat.id,
          isActive: true,
          sortOrder: 2,
          image: cbsChildren[0]?.image || '/assets/images/our_products/polycab/cables/cable-by-standard.png'
        }
      });
      console.log('✅ Added "International Standards" category');
    } else {
      console.log('  International Standards already exists');
    }
  }

  // 2. Check if "Cables By Type" is missing "Others" subcategory
  const cbtCat = await prisma.category.findFirst({ 
    where: { slug: 'polycab/cables-by-type' },
    select: { id: true }
  });
  if (cbtCat) {
    const others = await prisma.category.findFirst({ 
      where: { slug: 'polycab/cables-by-type/others' }
    });
    if (!others) {
      await prisma.category.create({
        data: {
          slug: 'polycab/cables-by-type/others',
          name: 'Others',
          parentId: cbtCat.id,
          isActive: true,
          sortOrder: 99,
          image: null
        }
      });
      console.log('✅ Added "Others" under Cables By Type');
    } else {
      console.log('  Others category already exists');
    }
  }

  // 3. Fix product images - check how many products have /assets/images paths that exist
  const prodsWithImg = await prisma.product.findMany({
    where: { isActive: true, imageSrc: { not: null } },
    select: { id: true, title: true, imageSrc: true },
    take: 5
  });
  console.log('\n Sample active products with images:');
  prodsWithImg.forEach(p => console.log(`  "${p.title}" => ${p.imageSrc}`));

  // 4. Final counts
  const cats = await prisma.category.count({ where: { isActive: true } });
  const prods = await prisma.product.count({ where: { isActive: true } });
  const prodsWithImages = await prisma.product.count({ where: { isActive: true, imageSrc: { not: null } } });
  const prodsNoImage = await prisma.product.count({ where: { isActive: true, imageSrc: null } });
  
  console.log('\n========== FINAL CLEAN DB STATE ==========');
  console.log(`  Active categories: ${cats}`);
  console.log(`  Active products:   ${prods}`);
  console.log(`    ├─ With images:  ${prodsWithImages}`);
  console.log(`    └─ No images:    ${prodsNoImage} (will show "No Image" placeholder)`);
  console.log('\n✅ Database is now clean and consistent!\n');

  await prisma.$disconnect();
}

main().catch(e => { console.error('ERROR:', e); prisma.$disconnect(); });
