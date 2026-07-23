import type { Metadata } from 'next';
import { getSeoMetadata } from '@/lib/seo';
import CategoryLandingGrid, { type LandingItem } from '@/components/CategoryLandingGrid';

export async function generateMetadata(): Promise<Metadata> {
  return getSeoMetadata('/fans', {
    title: 'Fans - Mohit Sales Corporation Pvt. Ltd.',
    description: 'Polycab Fans - Ceiling, Table, Pedestal, Wall, Exhaust, Farrata, Air Circulator Fans - Mohit Sales Corporation Pvt. Ltd.',
  });
}

const PRODUCTS: LandingItem[] = [
  { title: 'Ceiling Fans', image: 'https://res.cloudinary.com/da2dmtm9b/image/upload/v1783167933/mohit/our_products/fans/ceiling_fan.png', link: '/polycab/fans/ceiling-fans' },
  { title: 'Table Fans', image: 'https://res.cloudinary.com/da2dmtm9b/image/upload/v1783167935/mohit/our_products/fans/table-fan.png', link: '/polycab/fans/table-fans' },
  { title: 'Pedestal Fans', image: 'https://res.cloudinary.com/da2dmtm9b/image/upload/v1783167934/mohit/our_products/fans/pedestal-fan.png', link: '/polycab/fans/pedestal-fans' },
  { title: 'Wall Fans', image: 'https://res.cloudinary.com/da2dmtm9b/image/upload/v1783167932/mohit/our_products/fans/Wall-Fan.png', link: '/polycab/fans/wall-fans' },
  { title: 'Exhaust Fans', image: 'https://res.cloudinary.com/da2dmtm9b/image/upload/v1783167929/mohit/our_products/fans/EXHAUST-FAN.png', link: '/polycab/fans/exhaust-fans' },
  { title: 'Farrata Fans', image: 'https://res.cloudinary.com/da2dmtm9b/image/upload/v1783167931/mohit/our_products/fans/Farrata-Fan.png', link: '/polycab/fans/farrata-fans' },
  { title: 'Air Circulator Fans', image: 'https://res.cloudinary.com/da2dmtm9b/image/upload/v1783167928/mohit/our_products/fans/Air-Circulator.png', link: '/polycab/fans/air-circulator-fans' },
];

export default function FansPage() {
  return (
    <CategoryLandingGrid
      title="Fans"
      breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Polycab', href: '/polycab' }, { label: 'Fans' }]}
      items={PRODUCTS}
      brandMark="polycab"
    />
  );
}
