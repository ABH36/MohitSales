import type { Metadata } from 'next';
import { getSeoMetadata } from '@/lib/seo';
import CategoryLandingGrid, { type LandingItem } from '@/components/CategoryLandingGrid';

export async function generateMetadata(): Promise<Metadata> {
  return getSeoMetadata('/cable-terminal', {
    title: 'Cable Terminals | Dowells Cable Lugs & Connectors | Mohit Sales Corporation',
    description: 'Authorized dealer of Dowells cable terminals, lugs, and connectors in Indore. Premium copper and aluminium cable terminals for industrial and commercial applications.',
    openGraph: {
      title: 'Cable Terminals | Dowells Cable Lugs & Connectors | Mohit Sales Corporation',
      description: 'Authorized dealer of Dowells cable terminals, lugs, and connectors in Indore. Premium copper and aluminium cable terminals for industrial and commercial applications.',
      url: 'https://mohitscpl.com/cable-terminal',
      siteName: 'Mohit Sales Corporation Pvt. Ltd.',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Cable Terminals | Dowells Cable Lugs & Connectors | Mohit Sales Corporation',
      description: 'Authorized dealer of Dowells cable terminals, lugs, and connectors in Indore.',
    },
    alternates: { canonical: 'https://mohitscpl.com/cable-terminal' },
  });
}

const PRODUCTS: LandingItem[] = [
  { title: 'Aluminium', image: 'https://res.cloudinary.com/da2dmtm9b/image/upload/v1783167916/mohit/our_products/dowells/cable_terminal/1.jpg', link: '/cable-terminal/aluminium' },
  { title: 'Bimetallic', image: 'https://res.cloudinary.com/da2dmtm9b/image/upload/v1783167917/mohit/our_products/dowells/cable_terminal/2.jpg', link: '/cable-terminal/bimetallic' },
  { title: 'Copper', image: 'https://res.cloudinary.com/da2dmtm9b/image/upload/v1783167918/mohit/our_products/dowells/cable_terminal/3.jpg', link: '/cable-terminal/copper' },
];

export default function CableTerminalPage() {
  return (
    <CategoryLandingGrid
      title="Cable Terminal"
      breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Dowells', href: '/dowells' }, { label: 'Cable Terminal' }]}
      items={PRODUCTS}
      brandMark="dowells"
    />
  );
}
