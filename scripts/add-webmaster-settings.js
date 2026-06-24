const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const WEBMASTER_SETTINGS = [
  { key: 'webmaster_google', value: '', type: 'string', group: 'seo', label: 'Google Search Console Verification', description: 'Google site verification code (content value only, not full meta tag)', isPublic: false },
  { key: 'webmaster_bing', value: '', type: 'string', group: 'seo', label: 'Bing Webmaster Verification', description: 'Bing site verification code', isPublic: false },
  { key: 'webmaster_baidu', value: '', type: 'string', group: 'seo', label: 'Baidu Webmaster Verification', description: 'Baidu site verification code', isPublic: false },
  { key: 'webmaster_yandex', value: '', type: 'string', group: 'seo', label: 'Yandex Webmaster Verification', description: 'Yandex site verification code', isPublic: false },
];

async function main() {
  for (const setting of WEBMASTER_SETTINGS) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    });
    console.log(`✓ ${setting.key}`);
  }
  console.log('\nWebmaster settings added successfully.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
