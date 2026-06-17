const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: 'Amitsoni860279@gmail.com' },
    select: {
      id: true,
      email: true,
      password: true,
      role: {
        select: { name: true }
      },
      isActive: true
    }
  });
  console.log('User Details:', JSON.stringify(user, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
