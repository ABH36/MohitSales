import type { Metadata } from 'next';
import { getSeoMetadata } from '@/lib/seo';
import CategoryLandingGrid from '@/components/CategoryLandingGrid';
import { getLandingItems } from '@/lib/landing';

export async function generateMetadata(): Promise<Metadata> {
  return getSeoMetadata('/gland', {
    title: 'Cable Glands | Dowells Metal & Nylon Glands | Mohit Sales Corporation',
    description: 'Authorized distributor of Dowells cable glands in Indore. Industrial grade metal and nylon cable glands for safe cable entry, IP rating, and strain relief.',
    openGraph: {
      title: 'Cable Glands | Dowells Metal & Nylon Glands | Mohit Sales Corporation',
      description: 'Authorized distributor of Dowells cable glands in Indore. Industrial grade metal and nylon cable glands for safe cable entry, IP rating, and strain relief.',
      url: 'https://mohitscpl.com/gland',
      siteName: 'Mohit Sales Corporation Pvt. Ltd.',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Cable Glands | Dowells Metal & Nylon Glands | Mohit Sales Corporation',
      description: 'Authorized distributor of Dowells cable glands in Indore.',
    },
    alternates: { canonical: 'https://mohitscpl.com/gland' },
  });
}

export default async function GlandPage() {
  const items = await getLandingItems('gland');
  return (
    <CategoryLandingGrid
      title="Gland"
      breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Dowells', href: '/dowells' }, { label: 'Gland' }]}
      items={items}
    />
  );
}
