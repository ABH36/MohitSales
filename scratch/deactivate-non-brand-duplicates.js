const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('=== DEACTIVATING NON-BRAND DUPLICATE PRODUCTS ===\n');

  // Find all active products whose slug does not start with polycab/ or dowells/
  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      NOT: {
        OR: [
          { slug: { startsWith: 'polycab/' } },
          { slug: { startsWith: 'dowells/' } }
        ]
      }
    },
    select: {
      id: true,
      title: true,
      slug: true
    }
  });

  console.log(`Found ${products.length} active non-brand products to deactivate.`);

  if (products.length > 0) {
    for (const p of products) {
      console.log(`  - Deactivating: "${p.title}" (slug: ${p.slug})`);
    }

    const result = await prisma.product.updateMany({
      where: {
        id: {
          in: products.map(p => p.id)
        }
      },
      data: {
        isActive: false
      }
    });

    console.log(`\nSuccessfully deactivated ${result.count} products.`);
  } else {
    console.log('\nNo active non-brand products found to deactivate.');
  }

  console.log('\n=== DEACTIVATION COMPLETE ===');
}

main()
  .catch(e => {
    console.error('Error executing cleanup:', e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
