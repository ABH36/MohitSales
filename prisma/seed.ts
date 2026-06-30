/**
 * Prisma Seed File — Mohit Industries
 * =====================================
 * Populates the database with initial data:
 * - Roles & Permissions
 * - Admin User
 * - Product Categories
 * - Site Settings
 * - Sample Blog Categories
 *
 * Run: npx ts-node prisma/seed.ts
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...\n');

  // ─── 1. PERMISSIONS ──────────────────────────────────────
  console.log('📋 Creating permissions...');
  const permissions = await Promise.all([
    prisma.permission.upsert({
      where: { name: 'MANAGE_USERS' },
      update: {},
      create: { name: 'MANAGE_USERS' },
    }),
    prisma.permission.upsert({
      where: { name: 'MANAGE_PRODUCTS' },
      update: {},
      create: { name: 'MANAGE_PRODUCTS' },
    }),
    prisma.permission.upsert({
      where: { name: 'MANAGE_CATEGORIES' },
      update: {},
      create: { name: 'MANAGE_CATEGORIES' },
    }),
    prisma.permission.upsert({
      where: { name: 'MANAGE_BLOG' },
      update: {},
      create: { name: 'MANAGE_BLOG' },
    }),
    prisma.permission.upsert({
      where: { name: 'MANAGE_MEDIA' },
      update: {},
      create: { name: 'MANAGE_MEDIA' },
    }),
    prisma.permission.upsert({
      where: { name: 'MANAGE_SETTINGS' },
      update: {},
      create: { name: 'MANAGE_SETTINGS' },
    }),
    prisma.permission.upsert({
      where: { name: 'VIEW_INQUIRIES' },
      update: {},
      create: { name: 'VIEW_INQUIRIES' },
    }),
    prisma.permission.upsert({
      where: { name: 'READ_ONLY' },
      update: {},
      create: { name: 'READ_ONLY' },
    }),
  ]);
  console.log(`   ✓ ${permissions.length} permissions created\n`);

  // ─── 2. ROLES ────────────────────────────────────────────
  console.log('👥 Creating roles...');

  const adminRole = await prisma.role.upsert({
    where: { name: 'ADMIN' },
    update: {
      permissions: { set: permissions.map(p => ({ id: p.id })) },
    },
    create: {
      name: 'ADMIN',
      description: 'Full access — can manage all content, users, and settings',
      permissions: { connect: permissions.map(p => ({ id: p.id })) },
    },
  });

  const editorRole = await prisma.role.upsert({
    where: { name: 'EDITOR' },
    update: {},
    create: {
      name: 'EDITOR',
      description: 'Can manage products, blog, and media — cannot manage users or settings',
      permissions: {
        connect: permissions
          .filter(p => ['MANAGE_PRODUCTS', 'MANAGE_CATEGORIES', 'MANAGE_BLOG', 'MANAGE_MEDIA', 'VIEW_INQUIRIES'].includes(p.name))
          .map(p => ({ id: p.id })),
      },
    },
  });

  const viewerRole = await prisma.role.upsert({
    where: { name: 'VIEWER' },
    update: {},
    create: {
      name: 'VIEWER',
      description: 'Read-only access to admin panel',
      permissions: {
        connect: permissions
          .filter(p => p.name === 'READ_ONLY')
          .map(p => ({ id: p.id })),
      },
    },
  });
  console.log('   ✓ Roles: ADMIN, EDITOR, VIEWER created\n');

  // ─── 3. ADMIN USER ───────────────────────────────────────
  console.log('👤 Creating admin user...');
  const hashedPassword = await bcrypt.hash('Admin@2024!', 12);

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@mohitscpl.com' },
    update: {},
    create: {
      email: 'admin@mohitscpl.com',
      password: hashedPassword,
      name: 'Admin',
      roleId: adminRole.id,
      isActive: true,
    },
  });
  console.log(`   ✓ Admin user: admin@mohitscpl.com (Password: Admin@2024!)\n`);

  // ─── 4. PRODUCT CATEGORIES ───────────────────────────────
  console.log('📦 Creating product categories...');

  // Top-level categories
  const polycabCat = await prisma.category.upsert({
    where: { slug: 'polycab' },
    update: {},
    create: {
      slug: 'polycab',
      name: 'Polycab',
      description: 'Authorised Polycab products — cables, switchgears, fans, solar, conduits, home appliances',
      image: '/assets/images/logo/polycab-logo.png',
      sortOrder: 1,
    },
  });

  const dowellsCat = await prisma.category.upsert({
    where: { slug: 'dowells' },
    update: {},
    create: {
      slug: 'dowells',
      name: 'Dowells',
      description: 'Authorised Dowells products — cable terminals, glands, crimping tools',
      image: '/assets/images/logo/dowells-logo.png',
      sortOrder: 2,
    },
  });

  // Polycab Sub-categories
  const cablesCat = await prisma.category.upsert({
    where: { slug: 'polycab-cables' },
    update: {},
    create: {
      slug: 'polycab-cables',
      name: 'Cables',
      parentId: polycabCat.id,
      description: 'LV, MV, HV, EHV Power Cables, Instrumentation, Control, Fire Resistant Cables',
      sortOrder: 1,
    },
  });

  await prisma.category.upsert({
    where: { slug: 'polycab-switchgears' },
    update: {},
    create: {
      slug: 'polycab-switchgears',
      name: 'Switchgears',
      parentId: polycabCat.id,
      description: 'MCB, RCCB, RCBO, Distribution Boards, Isolators',
      sortOrder: 2,
    },
  });

  await prisma.category.upsert({
    where: { slug: 'polycab-fans' },
    update: {},
    create: {
      slug: 'polycab-fans',
      name: 'Fans',
      parentId: polycabCat.id,
      description: 'Ceiling Fans, Wall Fans, Exhaust Fans, Designer Fans',
      sortOrder: 3,
    },
  });

  await prisma.category.upsert({
    where: { slug: 'polycab-solar' },
    update: {},
    create: {
      slug: 'polycab-solar',
      name: 'Solar',
      parentId: polycabCat.id,
      description: 'Solar Panels, Inverters, Charge Controllers',
      sortOrder: 4,
    },
  });

  await prisma.category.upsert({
    where: { slug: 'polycab-conduits' },
    update: {},
    create: {
      slug: 'polycab-conduits',
      name: 'Conduit & Accessories',
      parentId: polycabCat.id,
      description: 'PVC Conduits, Rigid Conduits, Flexible Conduits, Junction Boxes',
      sortOrder: 5,
    },
  });

  await prisma.category.upsert({
    where: { slug: 'polycab-home-appliances' },
    update: {},
    create: {
      slug: 'polycab-home-appliances',
      name: 'Home Appliances',
      parentId: polycabCat.id,
      description: 'Water Heaters, Mixers, Irons, Room Heaters',
      sortOrder: 6,
    },
  });

  // Dowells Sub-categories
  await prisma.category.upsert({
    where: { slug: 'dowells-cable-terminal' },
    update: {},
    create: {
      slug: 'dowells-cable-terminal',
      name: 'Cable Terminals',
      parentId: dowellsCat.id,
      description: 'Aluminium, Bimetallic, Copper Cable Terminals',
      sortOrder: 1,
    },
  });

  await prisma.category.upsert({
    where: { slug: 'dowells-gland' },
    update: {},
    create: {
      slug: 'dowells-gland',
      name: 'Cable Glands',
      parentId: dowellsCat.id,
      description: 'Single, Double, Brass, Nylon Cable Glands',
      sortOrder: 2,
    },
  });

  await prisma.category.upsert({
    where: { slug: 'dowells-crimping-tool' },
    update: {},
    create: {
      slug: 'dowells-crimping-tool',
      name: 'Crimping Tools',
      parentId: dowellsCat.id,
      description: 'Manual and Hydraulic Crimping Tools',
      sortOrder: 3,
    },
  });

  console.log('   ✓ Product categories seeded (Polycab + Dowells hierarchy)\n');

  // ─── 4b. CATEGORY CLEANUP — remove junk/duplicate/typo categories ───
  console.log('🧹 Cleaning up junk categories...');

  const validTopSlugs = ['polycab', 'dowells'];
  const allTopLevel = await prisma.category.findMany({
    where: { parentId: null },
    select: { id: true, slug: true, name: true },
  });

  let deactivated = 0;
  for (const cat of allTopLevel) {
    if (!validTopSlugs.includes(cat.slug)) {
      await prisma.category.update({
        where: { id: cat.id },
        data: { isActive: false },
      });
      deactivated++;
      console.log(`   ✗ Deactivated top-level junk: "${cat.name}" (${cat.slug})`);
    }
  }

  const duplicatePatterns = [
    '%infrasturcture%',
    '%infrasture%',
    '%exporation%',
  ];
  for (const pattern of duplicatePatterns) {
    const dupes = await prisma.category.findMany({
      where: { name: { contains: pattern.replace(/%/g, ''), mode: 'insensitive' } },
    });
    for (const d of dupes) {
      await prisma.category.update({
        where: { id: d.id },
        data: { isActive: false },
      });
      deactivated++;
      console.log(`   ✗ Deactivated typo category: "${d.name}"`);
    }
  }

  // Deactivate children of "direct-link" categories (Fans, Solar, Switchgears, etc.)
  // These categories link directly to their page — their sub-items are page cards, NOT nav children
  const directLinkSlugs = [
    'polycab-switchgears', 'polycab/switchgears',
    'polycab-fans', 'polycab/fans',
    'polycab-solar', 'polycab/solar',
    'polycab-conduits', 'polycab/conduit-and-accessories',
    'polycab-home-appliances', 'polycab/home-appliances',
    'dowells-cable-terminal', 'dowells/cable-terminal',
    'dowells-gland', 'dowells/gland',
    'dowells-crimping-tool', 'dowells/crimping-tool',
  ];

  for (const slug of directLinkSlugs) {
    const parent = await prisma.category.findUnique({ where: { slug }, select: { id: true, name: true } });
    if (parent) {
      const children = await prisma.category.findMany({
        where: { parentId: parent.id, isActive: true },
        select: { id: true, name: true },
      });
      for (const child of children) {
        await prisma.category.update({
          where: { id: child.id },
          data: { isActive: false },
        });
        deactivated++;
        console.log(`   ✗ Deactivated nav-child of "${parent.name}": "${child.name}"`);
      }
    }
  }

  console.log(`   ✓ Cleanup done — ${deactivated} junk categories deactivated\n`);

  // ─── 5. BLOG CATEGORIES ──────────────────────────────────
  console.log('📝 Creating blog categories...');

  await prisma.blogCategory.upsert({
    where: { slug: 'industry-news' },
    update: {},
    create: {
      slug: 'industry-news',
      name: 'Industry News',
      description: 'Latest news from the electrical industry',
      sortOrder: 1,
    },
  });

  await prisma.blogCategory.upsert({
    where: { slug: 'product-updates' },
    update: {},
    create: {
      slug: 'product-updates',
      name: 'Product Updates',
      description: 'New product launches and updates from Polycab & Dowells',
      sortOrder: 2,
    },
  });

  await prisma.blogCategory.upsert({
    where: { slug: 'technical-guides' },
    update: {},
    create: {
      slug: 'technical-guides',
      name: 'Technical Guides',
      description: 'How-to guides, installation tips, and technical resources',
      sortOrder: 3,
    },
  });

  await prisma.blogCategory.upsert({
    where: { slug: 'company-news' },
    update: {},
    create: {
      slug: 'company-news',
      name: 'Company News',
      description: 'Updates from Mohit Sales Corporation',
      sortOrder: 4,
    },
  });

  console.log('   ✓ Blog categories seeded\n');

  // ─── 6. SITE SETTINGS ────────────────────────────────────
  console.log('⚙️  Creating site settings...');

  const settingsData = [
    // General
    { key: 'site_name', value: 'Mohit Sales Corporation Pvt. Ltd.', type: 'string', group: 'general', label: 'Site Name', isPublic: true },
    { key: 'site_tagline', value: 'Authorised Distributor of Polycab & Dowells', type: 'string', group: 'general', label: 'Site Tagline', isPublic: true },
    { key: 'founded_year', value: '1997', type: 'string', group: 'general', label: 'Founded Year', isPublic: true },
    { key: 'experience_years', value: '27+', type: 'string', group: 'general', label: 'Years of Experience', isPublic: true },
    { key: 'gst_number', value: '27AADCM4372Q1Z6', type: 'string', group: 'general', label: 'GST Number', isPublic: false },

    // Contact
    { key: 'contact_email', value: 'info@mohitscpl.com', type: 'string', group: 'contact', label: 'Contact Email', isPublic: true },
    { key: 'contact_phone_1', value: '+91 9522952267', type: 'string', group: 'contact', label: 'Phone 1', isPublic: true },
    { key: 'contact_phone_2', value: '', type: 'string', group: 'contact', label: 'Phone 2', isPublic: true },
    { key: 'contact_address', value: '54/2/16 & 54/2/18 Siddharth Farms\nLasudia Mori Dewas Naka\nIndore-452010', type: 'string', group: 'contact', label: 'Address', isPublic: true },
    { key: 'google_maps_embed', value: '', type: 'string', group: 'contact', label: 'Google Maps Embed URL', isPublic: true },

    // Social
    { key: 'social_facebook', value: '', type: 'string', group: 'social', label: 'Facebook URL', isPublic: true },
    { key: 'social_instagram', value: '', type: 'string', group: 'social', label: 'Instagram URL', isPublic: true },
    { key: 'social_linkedin', value: '', type: 'string', group: 'social', label: 'LinkedIn URL', isPublic: true },
    { key: 'social_youtube', value: '', type: 'string', group: 'social', label: 'YouTube URL', isPublic: true },
    { key: 'whatsapp_number', value: '+919522952267', type: 'string', group: 'social', label: 'WhatsApp Number', isPublic: true },

    // SEO
    { key: 'seo_title', value: 'Mohit Sales Corporation Pvt. Ltd. | Authorized Polycab & Dowells Distributor', type: 'string', group: 'seo', label: 'Default SEO Title', isPublic: true },
    { key: 'seo_description', value: 'Authorized distributor of Polycab India Ltd. and Dowells. Premium quality cables, switchgears, fans, solar products since 1997.', type: 'string', group: 'seo', label: 'Default Meta Description', isPublic: true },
    { key: 'seo_keywords', value: 'polycab, dowells, cables, switchgear, fans, solar, Indore, authorised distributor', type: 'string', group: 'seo', label: 'Meta Keywords', isPublic: true },
    { key: 'google_analytics_id', value: '', type: 'string', group: 'seo', label: 'Google Analytics ID', isPublic: false },
    { key: 'webmaster_google', value: '', type: 'string', group: 'seo', label: 'Google Search Console Verification', isPublic: false, description: 'Google site verification code (content value only, not full meta tag)' },
    { key: 'webmaster_bing', value: '', type: 'string', group: 'seo', label: 'Bing Webmaster Verification', isPublic: false, description: 'Bing site verification code' },
    { key: 'webmaster_baidu', value: '', type: 'string', group: 'seo', label: 'Baidu Webmaster Verification', isPublic: false, description: 'Baidu site verification code' },
    { key: 'webmaster_yandex', value: '', type: 'string', group: 'seo', label: 'Yandex Webmaster Verification', isPublic: false, description: 'Yandex site verification code' },

    // Appearance
    { key: 'logo_url', value: '/assets/images/logo/logo.png', type: 'string', group: 'appearance', label: 'Logo URL', isPublic: true },
    { key: 'favicon_url', value: '/assets/images/favicon/favicon.png', type: 'string', group: 'appearance', label: 'Favicon URL', isPublic: true },
    { key: 'primary_color', value: '#1E2E5E', type: 'string', group: 'appearance', label: 'Primary Color', isPublic: true },
    { key: 'accent_color', value: '#F7931E', type: 'string', group: 'appearance', label: 'Accent Color', isPublic: true },

    // Features
    { key: 'maintenance_mode', value: 'false', type: 'boolean', group: 'general', label: 'Maintenance Mode', isPublic: false },
    { key: 'allow_inquiries', value: 'true', type: 'boolean', group: 'general', label: 'Allow Inquiries', isPublic: false },
    { key: 'allow_feedback', value: 'true', type: 'boolean', group: 'general', label: 'Allow Feedback', isPublic: false },
  ];

  for (const setting of settingsData) {
    const existing = await prisma.setting.findUnique({ where: { key: setting.key } });
    if (existing) {
      // Overwrite dummy values if they match old defaults
      if (
        (setting.key === 'contact_address' && existing.value === 'Mumbai, Maharashtra, India') ||
        (setting.key === 'contact_phone_1' && existing.value === '+91-22-2632-1234') ||
        (setting.key === 'contact_phone_2' && existing.value === '+91-98765-43210') ||
        (setting.key === 'whatsapp_number' && existing.value === '+919876543210') ||
        (setting.key === 'seo_keywords' && existing.value.includes('Mumbai'))
      ) {
        await prisma.setting.update({
          where: { key: setting.key },
          data: { value: setting.value },
        });
      }
    } else {
      await prisma.setting.create({
        data: setting,
      });
    }
  }
  console.log(`   ✓ ${settingsData.length} site settings seeded\n`);

  // ─── SUMMARY ─────────────────────────────────────────────
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ Database seeded successfully!\n');
  console.log('📊 Summary:');
  console.log(`   • Permissions  : ${permissions.length}`);
  console.log(`   • Roles        : 3 (ADMIN, EDITOR, VIEWER)`);
  console.log(`   • Admin user   : admin@mohitscpl.com`);
  console.log(`   • Categories   : 11 (Polycab + Dowells hierarchy)`);
  console.log(`   • Blog cats    : 4`);
  console.log(`   • Settings     : ${settingsData.length}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('🔑 Admin Login:');
  console.log('   Email    : admin@mohitscpl.com');
  console.log('   Password : Admin@2024!');
  console.log('\n⚠️  IMPORTANT: Change the admin password after first login!\n');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
