import type { Metadata } from 'next';
import { getSeoMetadata } from '@/lib/seo';
import CategoryLandingGrid, { type LandingItem } from '@/components/CategoryLandingGrid';

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

const PRODUCTS: LandingItem[] = [
  { title: 'Water Heaters', image: 'https://res.cloudinary.com/da2dmtm9b/image/upload/v1783166522/mohit/our_products/home_appliances/1.png', link: '/home-appliances/water-heaters' },
  { title: 'Irons', image: 'https://res.cloudinary.com/da2dmtm9b/image/upload/v1783167944/mohit/our_products/home_appliances/2.png', link: '/home-appliances/irons' },
  { title: 'Coolers', image: 'https://res.cloudinary.com/da2dmtm9b/image/upload/v1783167945/mohit/our_products/home_appliances/3.png', link: '/home-appliances/coolers' },
];

export default function HomeAppliancesPage() {
  return (
    <CategoryLandingGrid
      title="Home Appliances"
      breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Polycab', href: '/polycab' }, { label: 'Home Appliances' }]}
      items={PRODUCTS}
      brandMark="polycab"
    />
  );
}
