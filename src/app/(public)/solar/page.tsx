import type { Metadata } from 'next';
import { getSeoMetadata } from '@/lib/seo';
import CategoryLandingGrid from '@/components/CategoryLandingGrid';
import { getLandingItems } from '@/lib/landing';

export async function generateMetadata(): Promise<Metadata> {
  return getSeoMetadata('/solar', {
    title: 'Solar Products | Polycab Solar DC Cables & Systems | Mohit Sales Corporation',
    description: 'Authorized distributor of Polycab solar DC cables, solar wires, and solar power accessories in Indore. High-efficiency solar products for residential and commercial installations.',
    openGraph: {
      title: 'Solar Products | Polycab Solar DC Cables & Systems | Mohit Sales Corporation',
      description: 'Authorized distributor of Polycab solar DC cables, solar wires, and solar power accessories in Indore.',
      url: 'https://mohitscpl.com/solar',
      siteName: 'Mohit Sales Corporation Pvt. Ltd.',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Solar Products | Polycab Solar DC Cables & Systems | Mohit Sales Corporation',
      description: 'Authorized distributor of Polycab solar DC cables and solar accessories in Indore.',
    },
    alternates: { canonical: 'https://mohitscpl.com/solar' },
  });
}

export default async function SolarPage() {
  const items = await getLandingItems('solar');
  return (
    <CategoryLandingGrid
      title="Solar"
      breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Polycab', href: '/polycab' }, { label: 'Solar' }]}
      items={items}
    />
  );
}
