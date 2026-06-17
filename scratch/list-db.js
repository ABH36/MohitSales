const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const count = await prisma.product.count();
  console.log('Total Products in DB:', count);
  const products = await prisma.product.findMany({
    take: 15,
    select: { id: true, title: true, slug: true, stock: true }
  });
  console.log('Sample Products:', JSON.stringify(products, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
