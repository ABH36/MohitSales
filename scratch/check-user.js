const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('--- User Check ---');
  try {
    const users = await prisma.user.findMany({
      include: { role: true }
    });
    for (const u of users) {
      console.log(`User: ${u.email}`);
      console.log(`Role: ${u.role?.name}`);
      console.log(`twoFactorEnabled: ${u.twoFactorEnabled}`);
      console.log(`isActive: ${u.isActive}`);
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
