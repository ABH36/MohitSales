const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const productCount = await prisma.product.count();
  const categoryCount = await prisma.category.count();
  const userCount = await prisma.user.count();
  const mediaCount = await prisma.media.count();
  
  console.log('--- DATABASE STATUS ---');
  console.log('Products count:', productCount);
  console.log('Categories count:', categoryCount);
  console.log('Users count:', userCount);
  console.log('Media count:', mediaCount);
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
