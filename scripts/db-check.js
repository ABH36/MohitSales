const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
  // 1. Webmaster settings
  const webmaster = await p.setting.findMany({ where: { key: { startsWith: 'webmaster_' } }, select: { key: true, value: true, group: true, label: true } });
  console.log('=== WEBMASTER SETTINGS ===');
  webmaster.forEach(s => console.log(' ', s.key, '|', s.label, '| value:', JSON.stringify(s.value), '| group:', s.group));

  // 2. SEO group settings
  const seoSettings = await p.setting.findMany({ where: { group: 'seo' }, select: { key: true, label: true, value: true } });
  console.log('\n=== SEO GROUP SETTINGS ===');
  seoSettings.forEach(s => console.log(' ', s.key, '|', s.label, '| has value:', s.value ? 'YES' : 'EMPTY'));

  // 3. Products meta check
  const totalProds = await p.product.count();
  const prodsWithMeta = await p.product.count({ where: { OR: [{ metaTitle: { not: null } }, { metaDescription: { not: null } }, { metaKeywords: { not: null } }] } });
  const emptyStringMeta = await p.product.count({ where: { OR: [{ metaTitle: '' }, { metaDescription: '' }, { metaKeywords: '' }] } });
  console.log('\n=== PRODUCTS META ===');
  console.log('  Total products:', totalProds);
  console.log('  With SEO meta:', prodsWithMeta);
  console.log('  Empty string meta (should be 0):', emptyStringMeta);

  // 4. All table counts
  const counts = {
    User: await p.user.count(),
    Role: await p.role.count(),
    Category: await p.category.count(),
    Product: await p.product.count(),
    Inquiry: await p.inquiry.count(),
    BlogPost: await p.blogPost.count(),
    Media: await p.media.count(),
    Setting: await p.setting.count(),
    SeoMeta: await p.seoMeta.count(),
    Redirect: await p.redirect.count(),
    SchemaMarkup: await p.schemaMarkup.count(),
    SitemapOverride: await p.sitemapOverride.count(),
    CmsSection: await p.cmsSection.count(),
    PageContent: await p.pageContent.count(),
    AdminOtp: await p.adminOtp.count(),
  };
  console.log('\n=== ALL TABLES ===');
  Object.entries(counts).forEach(([name, count]) => console.log(' ', name + ':', count));

  // 5. Duplicate setting keys
  const allKeys = await p.setting.findMany({ select: { key: true } });
  const keyMap = {};
  allKeys.forEach(s => { keyMap[s.key] = (keyMap[s.key] || 0) + 1; });
  const dupes = Object.entries(keyMap).filter(([, c]) => c > 1);
  console.log('\n=== DUPLICATE KEYS ===');
  console.log('  Duplicates:', dupes.length > 0 ? dupes.map(([k,c]) => k + '(' + c + ')').join(', ') : 'NONE (clean)');

  // 6. Stale AdminOtp records
  const staleOtps = await p.adminOtp.count({ where: { expiresAt: { lt: new Date() } } });
  console.log('\n=== STALE OTP RECORDS ===');
  console.log('  Expired OTPs:', staleOtps);

  console.log('\n✅ DB health check complete.');
}

main()
  .catch(e => console.error('DB ERROR:', e.message))
  .finally(() => p.$disconnect());
