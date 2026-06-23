const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Updating stock for existing active products with stock 0 to 999...');
  
  const result = await prisma.product.updateMany({
    where: {
      stock: 0,
      isActive: true,
    },
    data: {
      stock: 999,
    },
  });
  
  console.log(`Successfully updated ${result.count} products to stock 999.`);
}

main()
  .catch((e) => {
    console.error('Error updating stock:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
