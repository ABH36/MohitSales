import type { Metadata } from 'next';
import { getSeoMetadata } from '@/lib/seo';
import CategoryLandingGrid, { type LandingItem } from '@/components/CategoryLandingGrid';

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

const PRODUCTS: LandingItem[] = [
  { title: 'Solar Grid Tie Inverter', image: 'https://res.cloudinary.com/da2dmtm9b/image/upload/v1783167960/mohit/our_products/solar/solar-grid-tie-inverter.png', link: '/solar/solar-grid-tie-inverter' },
  { title: 'DC MCB', image: 'https://res.cloudinary.com/da2dmtm9b/image/upload/v1783166551/mohit/our_products/solar/DC-MCB-2.png', link: '/solar/dc-mcb' },
  { title: 'Solar DC Cable', image: 'https://res.cloudinary.com/da2dmtm9b/image/upload/v1783166523/mohit/our_products/solar/solar-dc-cable.png', link: '/solar/solar-dc-cable' },
  { title: 'Solar Panel', image: 'https://res.cloudinary.com/da2dmtm9b/image/upload/v1783166527/mohit/our_products/solar/Mono_Crystalline.png', link: '/solar/solar-panel' },
];

export default function SolarPage() {
  return (
    <CategoryLandingGrid
      title="Solar"
      breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Polycab', href: '/polycab' }, { label: 'Solar' }]}
      items={PRODUCTS}
    />
  );
}
