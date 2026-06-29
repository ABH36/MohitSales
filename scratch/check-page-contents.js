const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const contents = await prisma.pageContent.findMany({
    select: { id: true, slug: true, legacyPath: true, title: true }
  });
  console.log('PageContent records:');
  console.log(JSON.stringify(contents, null, 2));
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
