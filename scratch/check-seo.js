const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const metas = await prisma.seoMeta.findMany();
  console.log('SeoMeta records:');
  console.log(JSON.stringify(metas, null, 2));
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
