import prisma from '@/lib/prisma';

/**
 * Site-wide Organization + WebSite structured data (JSON-LD), server-rendered
 * into every public page so crawlers always have the brand/company context
 * (name, logo, contact, address) regardless of per-page admin schema. Contact
 * details come from the Settings table with safe constant fallbacks; social
 * links are emitted as `sameAs` only when configured.
 */
const SITE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://mohitscpl.com';
const LOGO = 'https://res.cloudinary.com/da2dmtm9b/image/upload/f_auto,q_auto/v1783167908/mohit/logo/msc_logo_without_bg.png';

let cache: { html: string; ts: number } | null = null;
const TTL = 5 * 60 * 1000; // 5 min

async function buildJsonLd(): Promise<string> {
  const keys = [
    'contact_email', 'contact_phone_1', 'contact_phone_2', 'contact_address',
    'social_facebook', 'social_instagram', 'social_linkedin', 'social_youtube',
  ];
  let s: Record<string, string> = {};
  try {
    const rows = await prisma.setting.findMany({ where: { key: { in: keys } }, select: { key: true, value: true } });
    s = Object.fromEntries(rows.map((r) => [r.key, (r.value || '').trim()]));
  } catch {
    s = {};
  }

  const sameAs = ['social_facebook', 'social_instagram', 'social_linkedin', 'social_youtube']
    .map((k) => s[k])
    .filter((v) => v && /^https?:\/\//i.test(v));

  const phones = [s.contact_phone_1, s.contact_phone_2].filter(Boolean);

  const organization: Record<string, unknown> = {
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    name: 'Mohit Sales Corporation Pvt. Ltd.',
    url: SITE_URL,
    logo: LOGO,
    image: LOGO,
    description:
      'Authorized distributor of Polycab India Ltd. and Dowells — wires, cables, terminals, switchgears, and solar products since 1997.',
    foundingDate: '1997',
    ...(sameAs.length ? { sameAs } : {}),
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'sales',
      ...(phones.length ? { telephone: phones[0] } : {}),
      ...(s.contact_email ? { email: s.contact_email } : {}),
      areaServed: 'IN',
      availableLanguage: ['en', 'hi'],
    },
    ...(s.contact_address
      ? {
          address: {
            '@type': 'PostalAddress',
            streetAddress: s.contact_address.replace(/\s*\n\s*/g, ', '),
            addressCountry: 'IN',
          },
        }
      : {}),
  };

  const website = {
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    url: SITE_URL,
    name: 'Mohit Sales Corporation Pvt. Ltd.',
    publisher: { '@id': `${SITE_URL}/#organization` },
  };

  const graph = { '@context': 'https://schema.org', '@graph': [organization, website] };
  return JSON.stringify(graph).replace(/<\/script>/gi, '<\\/script>');
}

export default async function OrganizationSchema() {
  if (!cache || Date.now() - cache.ts > TTL) {
    cache = { html: await buildJsonLd(), ts: Date.now() };
  }
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: cache.html }} />;
}
