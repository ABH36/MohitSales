const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const ids = ['fbc173f4-2d12-4832-b371-89f940831788', 'b4e6bd81-0678-40aa-8895-c357aef27fc6'];
  const prods = await prisma.product.findMany({
    where: { id: { in: ids } },
    include: { category: true }
  });

  console.log(JSON.stringify(prods, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
