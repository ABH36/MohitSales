import { schemaLayout } from '@/components/PageSchema';
import { getSeoMetadata } from '@/lib/seo';
import type { Metadata } from 'next';

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  return getSeoMetadata('/certificates', {
  title: 'Certificates & Authorizations | Mohit Sales Corporation Pvt. Ltd.',
  description: 'View the certificates, authorizations, and dealer credentials of Mohit Sales Corporation Pvt. Ltd. — authorized distributor for Polycab and Dowells in Indore.',
  openGraph: {
    title: 'Certificates & Authorizations | Mohit Sales Corporation Pvt. Ltd.',
    description: 'View the certificates, authorizations, and dealer credentials of Mohit Sales Corporation Pvt. Ltd. — authorized distributor for Polycab and Dowells in Indore.',
    url: 'https://mohitscpl.com/certificates',
    siteName: 'Mohit Sales Corporation Pvt. Ltd.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Certificates & Authorizations | Mohit Sales Corporation Pvt. Ltd.',
    description: 'Authorized distributor certificates for Polycab and Dowells — Mohit Sales Corporation Pvt. Ltd., Indore.',
  },
  alternates: { canonical: 'https://mohitscpl.com/certificates' },
});
};

export default schemaLayout('/certificates');
