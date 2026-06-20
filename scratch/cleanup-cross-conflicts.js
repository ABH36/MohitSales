const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('=== STARTING DATABASE CLEANUP FOR CROSS-CONFLCTS ===\n');

  // Load all categories to get their slugs
  const categories = await prisma.category.findMany({
    select: { id: true, slug: true, name: true }
  });
  const catSlugs = categories.map(c => c.slug);
  console.log(`Found ${categories.length} categories in database.`);

  // Find all active products whose slug matches any category slug
  const conflictingProducts = await prisma.product.findMany({
    where: {
      slug: {
        in: catSlugs
      },
      isActive: true
    },
    select: {
      id: true,
      title: true,
      slug: true
    }
  });

  console.log(`Found ${conflictingProducts.length} active conflicting products.`);

  if (conflictingProducts.length > 0) {
    console.log('\nDeactivating the following conflicting products:');
    for (const p of conflictingProducts) {
      console.log(`  - Deactivating Product "${p.title}" (slug: ${p.slug})`);
    }

    const deactivateResult = await prisma.product.updateMany({
      where: {
        id: {
          in: conflictingProducts.map(p => p.id)
        }
      },
      data: {
        isActive: false
      }
    });

    console.log(`\nSuccessfully deactivated ${deactivateResult.count} products.`);
  } else {
    console.log('\nNo active conflicting products found.');
  }

  console.log('\n=== CLEANUP COMPLETED ===');
}

main()
  .catch(e => {
    console.error('Error executing cleanup script:', e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
