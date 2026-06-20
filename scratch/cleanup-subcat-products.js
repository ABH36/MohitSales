const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const duplicateSubcats = [
  'Tech Series',
  'Celebration Series',
  'Design Series',
  'Domestic Fans',
  'Industrial Fans'
];

async function main() {
  console.log('Finding clashing subcategory-placeholder products...');
  const clashingProducts = await prisma.product.findMany({
    where: {
      title: {
        in: duplicateSubcats
      }
    }
  });

  console.log(`Found ${clashingProducts.length} clashing subcategory products:`);
  console.log(clashingProducts.map(p => ({ id: p.id, title: p.title, slug: p.slug })));

  if (clashingProducts.length > 0) {
    console.log('Deleting clashing subcategory products...');
    const deleteResult = await prisma.product.deleteMany({
      where: {
        id: {
          in: clashingProducts.map(p => p.id)
        }
      }
    });
    console.log(`Successfully deleted ${deleteResult.count} subcategory products.`);
  } else {
    console.log('No clashing subcategory products found.');
  }
}

main().catch(err => {
  console.error(err);
}).finally(() => {
  prisma.$disconnect();
});
