import type { Metadata } from 'next';
import SchemaInjector from '@/components/SchemaInjector';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Contact Us | Mohit Sales Corporation Pvt. Ltd. — Indore',
  description: 'Get in touch with Mohit Sales Corporation Pvt. Ltd. in Indore. Contact our team for Polycab and Dowells product inquiries, pricing, and bulk orders. Visit us at 206 Rajiv Gandhi Market, Indore.',
  openGraph: {
    title: 'Contact Us | Mohit Sales Corporation Pvt. Ltd. — Indore',
    description: 'Get in touch with Mohit Sales Corporation Pvt. Ltd. in Indore for Polycab and Dowells product inquiries, pricing, and bulk orders.',
    url: 'https://mohitscpl.com/contact-us',
    siteName: 'Mohit Sales Corporation Pvt. Ltd.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact Us | Mohit Sales Corporation Pvt. Ltd. — Indore',
    description: 'Contact Mohit Sales Corporation Pvt. Ltd. in Indore for Polycab and Dowells product inquiries.',
  },
  alternates: { canonical: 'https://mohitscpl.com/contact-us' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SchemaInjector page="/contact-us" />
      {children}
    </>
  );
}
