import type { Metadata } from 'next';
import { getSeoMetadata } from '@/lib/seo';
import CategoryLandingGrid from '@/components/CategoryLandingGrid';
import { getLandingItems } from '@/lib/landing';

export async function generateMetadata(): Promise<Metadata> {
  return getSeoMetadata('/conduit-accessories', {
    title: 'Conduit & Accessories | Polycab PVC Conduit Pipes | Mohit Sales Corporation',
    description: 'Authorized distributor of Polycab PVC conduit pipes and accessories in Indore. ISI-marked conduits, bends, junction boxes, and saddles for residential and commercial wiring.',
    openGraph: {
      title: 'Conduit & Accessories | Polycab PVC Conduit Pipes | Mohit Sales Corporation',
      description: 'Authorized distributor of Polycab PVC conduit pipes and accessories in Indore. ISI-marked conduits, bends, junction boxes for residential and commercial wiring.',
      url: 'https://mohitscpl.com/conduit-accessories',
      siteName: 'Mohit Sales Corporation Pvt. Ltd.',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Conduit & Accessories | Polycab PVC Conduit Pipes | Mohit Sales Corporation',
      description: 'Authorized distributor of Polycab PVC conduit pipes and accessories in Indore.',
    },
    alternates: { canonical: 'https://mohitscpl.com/conduit-accessories' },
  });
}

export default async function ConduitAccessoriesPage() {
  const items = await getLandingItems('conduit-accessories');
  return (
    <CategoryLandingGrid
      title="Conduit & Accessories"
      breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Polycab', href: '/polycab' }, { label: 'Conduit & Accessories' }]}
      items={items}
    />
  );
}
