import type { Metadata } from 'next';
import { getSeoMetadata } from '@/lib/seo';
import CategoryLandingGrid from '@/components/CategoryLandingGrid';
import { getLandingItems } from '@/lib/landing';

export async function generateMetadata(): Promise<Metadata> {
  return getSeoMetadata('/fans', {
    title: 'Fans - Mohit Sales Corporation Pvt. Ltd.',
    description: 'Polycab Fans - Ceiling, Table, Pedestal, Wall, Exhaust, Farrata, Air Circulator Fans - Mohit Sales Corporation Pvt. Ltd.',
  });
}

export default async function FansPage() {
  // Child list is DB-driven (derived from the fan products/pages under /fans),
  // so admin catalogue changes appear here automatically — no hardcoded array.
  const items = await getLandingItems('fans');
  return (
    <CategoryLandingGrid
      title="Fans"
      breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Polycab', href: '/polycab' }, { label: 'Fans' }]}
      items={items}
    />
  );
}
