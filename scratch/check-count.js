const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
p.product.count()
  .then(c => console.log('Count:', c))
  .catch(console.error)
  .finally(() => p.$disconnect());
