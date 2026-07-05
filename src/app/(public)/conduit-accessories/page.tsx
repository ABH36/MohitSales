import type { Metadata } from 'next';
import { getSeoMetadata } from '@/lib/seo';
import CategoryLandingGrid, { type LandingItem } from '@/components/CategoryLandingGrid';

export async function generateMetadata(): Promise<Metadata> {
  return getSeoMetadata('/conduit-accessories', {
    title: 'Conduit & Accessories | Polycab PVC Conduit Pipes | Mohit Sales Corporation',
    description: 'Authorized distributor of Polycab PVC conduit pipes and accessories in Indore. ISI-marked conduits, bends, junction boxes, and saddles for residential and commercial wiring.',
    openGraph: {
      title: 'Conduit & Accessories | Polycab PVC Conduit Pipes | Mohit Sales Corporation',
      description: 'Authorized distributor of Polycab PVC conduit pipes and accessories in Indore. ISI-marked conduits, bends, junction boxes for residential and commercial wiring.',
      url: 'https://mohit.bdm.co.in/conduit-accessories',
      siteName: 'Mohit Sales Corporation Pvt. Ltd.',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Conduit & Accessories | Polycab PVC Conduit Pipes | Mohit Sales Corporation',
      description: 'Authorized distributor of Polycab PVC conduit pipes and accessories in Indore.',
    },
    alternates: { canonical: 'https://mohit.bdm.co.in/conduit-accessories' },
  });
}

const PRODUCTS: LandingItem[] = [
  { title: 'UPVC Conduit', image: 'https://res.cloudinary.com/da2dmtm9b/image/upload/v1783167913/mohit/our_products/conduit_accessories/CONDUITS.png', link: '/conduit-accessories/upvc-conduit' },
  { title: 'Concealed Box', image: 'https://res.cloudinary.com/da2dmtm9b/image/upload/v1783167914/mohit/our_products/conduit_accessories/Concealed-Box.png', link: '/conduit-accessories/concealed-box' },
];

export default function ConduitAccessoriesPage() {
  return (
    <CategoryLandingGrid
      title="Conduit & Accessories"
      breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Polycab', href: '/polycab' }, { label: 'Conduit & Accessories' }]}
      items={PRODUCTS}
    />
  );
}
