const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const subcategoryToParent = {
  // Building Infrastructure
  'residential': 'polycab/cables/cables-by-application/building-infrastructure',
  'datacenters': 'polycab/cables/cables-by-application/building-infrastructure',
  'telecommunication': 'polycab/cables/cables-by-application/building-infrastructure',
  'commercial': 'polycab/cables/cables-by-application/building-infrastructure',
  'it-industry': 'polycab/cables/cables-by-application/building-infrastructure',

  // Energy And Power Grid
  'power-and-network': 'polycab/cables/cables-by-application/energy-and-power-grid',
  'utility': 'polycab/cables/cables-by-application/energy-and-power-grid',
  'renewable-energy': 'polycab/cables/cables-by-application/energy-and-power-grid',
  'service-entrance': 'polycab/cables/cables-by-application/energy-and-power-grid',

  // Exploration Industries
  'oil-gas-and-petrochemical': 'polycab/cables/cables-by-application/exploration-industries',
  'mining-drilling-and-tunneling': 'polycab/cables/cables-by-application/exploration-industries',

  // Manufacturing Industries
  'automation-and-process-control': 'polycab/cables/cables-by-application/manufacturing-industries',
  'healthcare': 'polycab/cables/cables-by-application/manufacturing-industries',
  'food-and-beverages': 'polycab/cables/cables-by-application/manufacturing-industries',
  'water-treatment-and-waste-disposal': 'polycab/cables/cables-by-application/manufacturing-industries',
  'cement-industry': 'polycab/cables/cables-by-application/manufacturing-industries',
  'metal-industry': 'polycab/cables/cables-by-application/manufacturing-industries',
  'sugar-industry': 'polycab/cables/cables-by-application/manufacturing-industries',
  'pharmaceutical-industry': 'polycab/cables/cables-by-application/manufacturing-industries',

  // Mobility Infrastructure
  'aerospace-industry': 'polycab/cables/cables-by-application/mobility-infrastructure',
  'defence-and-armaments-industry': 'polycab/cables/cables-by-application/mobility-infrastructure',
  'mass-transit-railways-and-marine': 'polycab/cables/cables-by-application/mobility-infrastructure'
};

async function main() {
  console.log('🏁 Starting reparenting of orphan products...');

  // --- PART 1: Reparent Cables By Standards ---
  const standardProducts = await prisma.product.findMany({
    where: {
      category: {
        slug: 'industries/cables-by-standards'
      }
    }
  });

  console.log(`Found ${standardProducts.length} products under industries/cables-by-standards.`);
  const internationalCat = await prisma.category.findUnique({
    where: { slug: 'polycab/cables/cables-by-standards/international-standards' }
  });

  if (!internationalCat) {
    throw new Error('Target international standards category not found!');
  }

  for (const p of standardProducts) {
    const slugParts = p.slug.split('/');
    const suffix = slugParts[slugParts.length - 1];
    const newSlug = `polycab/cables/cables-by-standards/international-standards/${suffix}`;

    console.log(`Mapping standard product: "${p.title}" -> ${newSlug}`);

    // Check conflict
    const conflict = await prisma.product.findUnique({
      where: { slug: newSlug }
    });

    if (conflict) {
      console.log(`⚠️ Conflict found: Product with slug "${newSlug}" already exists. Deleting orphan duplicate.`);
      await prisma.product.delete({
        where: { id: p.id }
      });
    } else {
      await prisma.product.update({
        where: { id: p.id },
        data: {
          categoryId: internationalCat.id,
          slug: newSlug
        }
      });
      console.log(`✅ Reparented: "${p.title}"`);
    }
  }

  // --- PART 2: Reparent Cables By Application ---
  const appProducts = await prisma.product.findMany({
    where: {
      category: {
        slug: 'industries/cables-by-application'
      }
    }
  });

  console.log(`Found ${appProducts.length} products under industries/cables-by-application.`);

  for (const p of appProducts) {
    const slugParts = p.slug.split('/');
    const suffix = slugParts[slugParts.length - 1]; // e.g. cement-industry

    const targetParentSlug = subcategoryToParent[suffix];
    if (!targetParentSlug) {
      console.log(`❌ No target parent mapped for suffix: "${suffix}" (Product: "${p.title}")`);
      continue;
    }

    const targetCatSlug = `${targetParentSlug}/${suffix}`;
    const targetCat = await prisma.category.findUnique({
      where: { slug: targetCatSlug }
    });

    if (!targetCat) {
      console.log(`❌ Target category not found in DB: "${targetCatSlug}"`);
      continue;
    }

    const newSlug = `${targetCatSlug}/${suffix}`; // The product's own slug suffix

    console.log(`Mapping application product: "${p.title}" -> ${newSlug}`);

    // Check conflict
    const conflict = await prisma.product.findUnique({
      where: { slug: newSlug }
    });

    if (conflict) {
      console.log(`⚠️ Conflict found: Product with slug "${newSlug}" already exists. Deleting orphan duplicate.`);
      await prisma.product.delete({
        where: { id: p.id }
      });
    } else {
      await prisma.product.update({
        where: { id: p.id },
        data: {
          categoryId: targetCat.id,
          slug: newSlug
        }
      });
      console.log(`✅ Reparented: "${p.title}"`);
    }
  }

  // --- PART 3: Cleanup Now-Empty Inactive Categories ---
  console.log('🧹 Deleting/deactivating old industries/ categories...');
  
  // Let's delete the categories under industries
  const industriesCats = await prisma.category.findMany({
    where: {
      slug: {
        in: [
          'industries/cables-by-standards',
          'industries/cables-by-application',
          'industries'
        ]
      }
    }
  });

  for (const cat of industriesCats) {
    try {
      await prisma.category.delete({
        where: { id: cat.id }
      });
      console.log(`🗑️ Deleted category: ${cat.slug}`);
    } catch (e) {
      console.log(`⚠️ Could not delete ${cat.slug} (might still have relations), deactivating instead.`);
      await prisma.category.update({
        where: { id: cat.id },
        data: { isActive: false }
      });
    }
  }

  console.log('🎉 Reparenting and cleanup complete!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
