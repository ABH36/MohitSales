import type { Metadata } from 'next';
import SchemaInjector from '@/components/SchemaInjector';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Certificates & Authorizations | Mohit Sales Corporation Pvt. Ltd.',
  description: 'View the certificates, authorizations, and dealer credentials of Mohit Sales Corporation Pvt. Ltd. — authorized distributor for Polycab and Dowells in Indore.',
  openGraph: {
    title: 'Certificates & Authorizations | Mohit Sales Corporation Pvt. Ltd.',
    description: 'View the certificates, authorizations, and dealer credentials of Mohit Sales Corporation Pvt. Ltd. — authorized distributor for Polycab and Dowells in Indore.',
    url: 'https://mohit.bdm.co.in/certificates',
    siteName: 'Mohit Sales Corporation Pvt. Ltd.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Certificates & Authorizations | Mohit Sales Corporation Pvt. Ltd.',
    description: 'Authorized distributor certificates for Polycab and Dowells — Mohit Sales Corporation Pvt. Ltd., Indore.',
  },
  alternates: { canonical: 'https://mohit.bdm.co.in/certificates' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SchemaInjector page="/certificates" />
      {children}
    </>
  );
}
