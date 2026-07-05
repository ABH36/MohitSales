import type { Metadata } from 'next';
import { getSeoMetadata } from '@/lib/seo';
import CategoryLandingGrid, { type LandingItem } from '@/components/CategoryLandingGrid';

export async function generateMetadata(): Promise<Metadata> {
  return getSeoMetadata('/gland', {
    title: 'Cable Glands | Dowells Metal & Nylon Glands | Mohit Sales Corporation',
    description: 'Authorized distributor of Dowells cable glands in Indore. Industrial grade metal and nylon cable glands for safe cable entry, IP rating, and strain relief.',
    openGraph: {
      title: 'Cable Glands | Dowells Metal & Nylon Glands | Mohit Sales Corporation',
      description: 'Authorized distributor of Dowells cable glands in Indore. Industrial grade metal and nylon cable glands for safe cable entry, IP rating, and strain relief.',
      url: 'https://mohitscpl.com/gland',
      siteName: 'Mohit Sales Corporation Pvt. Ltd.',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Cable Glands | Dowells Metal & Nylon Glands | Mohit Sales Corporation',
      description: 'Authorized distributor of Dowells cable glands in Indore.',
    },
    alternates: { canonical: 'https://mohitscpl.com/gland' },
  });
}

const PRODUCTS: LandingItem[] = [
  { title: 'Single Compression Gland', image: 'https://res.cloudinary.com/da2dmtm9b/image/upload/v1783167936/mohit/our_products/gland/1.jpg', link: '/gland/single-compression-gland' },
  { title: 'Double Compression Gland', image: 'https://res.cloudinary.com/da2dmtm9b/image/upload/v1783167937/mohit/our_products/gland/2.jpg', link: '/gland/double-compression-gland' },
  { title: 'Flang Type Gland', image: 'https://res.cloudinary.com/da2dmtm9b/image/upload/v1783166512/mohit/our_products/gland/3.jpg', link: '/gland/flang-type-gland' },
  { title: 'Shrouds', image: 'https://res.cloudinary.com/da2dmtm9b/image/upload/v1783166513/mohit/our_products/gland/4.jpg', link: '/gland/shrouds' },
  { title: 'Earthing Tag', image: 'https://res.cloudinary.com/da2dmtm9b/image/upload/v1783166511/mohit/our_products/gland/5.jpg', link: '/gland/earthing-tag' },
];

export default function GlandPage() {
  return (
    <CategoryLandingGrid
      title="Gland"
      breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Dowells', href: '/dowells' }, { label: 'Gland' }]}
      items={PRODUCTS}
    />
  );
}
