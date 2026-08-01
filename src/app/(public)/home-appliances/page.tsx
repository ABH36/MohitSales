import type { Metadata } from 'next';
import { getSeoMetadata } from '@/lib/seo';
import CategoryLandingGrid from '@/components/CategoryLandingGrid';
import { getLandingItems } from '@/lib/landing';

export async function generateMetadata(): Promise<Metadata> {
  return getSeoMetadata('/home-appliances', {
    title: 'Home Appliances | Polycab Fans, Wires & Switches | Mohit Sales Corporation',
    description: 'Authorized dealer of Polycab home appliances in Indore. Ceiling fans, wires, switches, modular accessories, and electrical fittings for home and office.',
    openGraph: {
      title: 'Home Appliances | Polycab Fans, Wires & Switches | Mohit Sales Corporation',
      description: 'Authorized dealer of Polycab home appliances in Indore. Ceiling fans, wires, switches, modular accessories, and electrical fittings for home and office.',
      url: 'https://mohitscpl.com/home-appliances',
      siteName: 'Mohit Sales Corporation Pvt. Ltd.',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Home Appliances | Polycab Fans, Wires & Switches | Mohit Sales Corporation',
      description: 'Authorized dealer of Polycab home appliances in Indore.',
    },
    alternates: { canonical: 'https://mohitscpl.com/home-appliances' },
  });
}

export default async function HomeAppliancesPage() {
  const items = await getLandingItems('home-appliances');
  return (
    <CategoryLandingGrid
      title="Home Appliances"
      breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Polycab', href: '/polycab' }, { label: 'Home Appliances' }]}
      items={items}
    />
  );
}
