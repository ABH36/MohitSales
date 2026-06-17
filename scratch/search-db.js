const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany({
    where: {
      title: { contains: 'RCCB', mode: 'insensitive' }
    },
    select: { id: true, title: true, slug: true }
  });
  console.log('Matching Products:', JSON.stringify(products, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
