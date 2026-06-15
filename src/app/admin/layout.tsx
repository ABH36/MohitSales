import type { Metadata } from 'next';
import './admin.css';

export const metadata: Metadata = {
  title: 'Admin Panel — Mohit Sales Corporation',
  description: 'Mohit Industries Admin Dashboard',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: '#f0f2f5', minHeight: '100vh' }}>
      {/* 
        Google Fonts injected here for Admin. 
        We don't use <html> or <body> because Root Layout already has them.
      */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      
      {children}
    </div>
  );
}
