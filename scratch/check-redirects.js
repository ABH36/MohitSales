const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const redirects = await prisma.redirect.findMany();
  console.log('Redirect records:');
  console.log(JSON.stringify(redirects, null, 2));
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
