const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
  // Fix empty string imageSrc -> null
  const r1 = await p.product.updateMany({ where: { imageSrc: '' }, data: { imageSrc: null } });
  console.log('Fixed empty imageSrc strings:', r1.count);
  
  // Final count
  const withImg = await p.product.count({ where: { isActive: true, imageSrc: { not: null } } });
  const noImg = await p.product.count({ where: { isActive: true, imageSrc: null } });
  console.log('Active products with image:', withImg);
  console.log('Active products no image:', noImg);
  
  await p.$disconnect();
}
main().catch(e => { console.error(e); p.$disconnect(); });
