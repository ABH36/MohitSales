import type { Metadata } from 'next';
import { getSeoMetadata } from '@/lib/seo';
import CategoryLandingGrid, { type LandingItem } from '@/components/CategoryLandingGrid';

export async function generateMetadata(): Promise<Metadata> {
  return getSeoMetadata('/dowells', {
    title: 'Dowells - Mohit Sales Corporation Pvt. Ltd.',
    description: 'Dowells Cable Terminals, Glands, and Crimping Tools - Mohit Sales Corporation Pvt. Ltd.',
  });
}

const PRODUCTS: LandingItem[] = [
  { title: 'Cable Terminal', image: 'https://res.cloudinary.com/da2dmtm9b/image/upload/v1783167919/mohit/our_products/dowells/cable_terminal_dowells.png', link: '/cable-terminal' },
  { title: 'Gland', image: 'https://res.cloudinary.com/da2dmtm9b/image/upload/v1783167927/mohit/our_products/dowells/gland_dowells.png', link: '/gland' },
  { title: 'Crimping Tool', image: 'https://res.cloudinary.com/da2dmtm9b/image/upload/v1783167925/mohit/our_products/dowells/crimping_tool_dowells.png', link: '/crimping-tool' },
];

export default function DowellsPage() {
  return (
    <CategoryLandingGrid
      title="Dowells"
      breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Dowells' }]}
      items={PRODUCTS}
      brandMark="dowells"
    />
  );
}
