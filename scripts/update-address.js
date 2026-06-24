const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Updating contact settings in the database...');

  const addressValue = `54/2/16 & 54/2/18 Siddharth Farms\nLasudia Mori Dewas Naka\nIndore-452010`;
  const phoneValue = '+91 9522952267';
  const emailValue = 'info@mohitscpl.com';

  await prisma.setting.upsert({
    where: { key: 'contact_address' },
    update: { value: addressValue },
    create: {
      key: 'contact_address',
      value: addressValue,
      type: 'string',
      group: 'contact',
      label: 'Address',
      isPublic: true
    }
  });
  console.log('✓ Updated contact_address');

  await prisma.setting.upsert({
    where: { key: 'contact_phone_1' },
    update: { value: phoneValue },
    create: {
      key: 'contact_phone_1',
      value: phoneValue,
      type: 'string',
      group: 'contact',
      label: 'Phone 1',
      isPublic: true
    }
  });
  console.log('✓ Updated contact_phone_1');

  await prisma.setting.upsert({
    where: { key: 'contact_email' },
    update: { value: emailValue },
    create: {
      key: 'contact_email',
      value: emailValue,
      type: 'string',
      group: 'contact',
      label: 'Contact Email',
      isPublic: true
    }
  });
  console.log('✓ Updated contact_email');

  console.log('All contact settings updated successfully!');
}

main()
  .catch(err => {
    console.error('Error updating contact settings:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
