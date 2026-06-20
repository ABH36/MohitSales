const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const duplicateTitles = [
  'Ceiling Fans',
  'Table Fans',
  'Pedestal Fans',
  'Wall Fans',
  'Exhaust Fans',
  'Farrata Fans',
  'Air Circulator Fans',
  'Air Circulator'
];

async function main() {
  console.log('Finding clashing products in the database...');
  const clashingProducts = await prisma.product.findMany({
    where: {
      title: {
        in: duplicateTitles
      }
    }
  });

  console.log(`Found ${clashingProducts.length} clashing products:`);
  console.log(clashingProducts.map(p => ({ id: p.id, title: p.title, slug: p.slug })));

  if (clashingProducts.length > 0) {
    console.log('Deleting clashing products...');
    const deleteResult = await prisma.product.deleteMany({
      where: {
        id: {
          in: clashingProducts.map(p => p.id)
        }
      }
    });
    console.log(`Successfully deleted ${deleteResult.count} products.`);
  } else {
    console.log('No clashing products found.');
  }
}

main().catch(err => {
  console.error(err);
}).finally(() => {
  prisma.$disconnect();
});
