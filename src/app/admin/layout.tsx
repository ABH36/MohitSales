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
    <div
      dir="ltr"
      id="admin-layout-root"
      style={{
        fontFamily: "'Inter', sans-serif",
        background: '#f0f2f5',
        minHeight: '100vh',
        direction: 'ltr',
        textAlign: 'left',
        // Override body.rtl that's set by root layout for the public site
        all: 'unset' as any,
        display: 'block',
      }}
    >
      {/* Override public site global styles that leak into admin panel */}
      <style>{`
        #admin-layout-root,
        #admin-layout-root * {
          direction: ltr !important;
          text-align: left;
        }
        /* Neutralize public-site bootstrap/main.css button overrides and allow text centering */
        #admin-layout-root button {
          pointer-events: auto !important;
          cursor: pointer !important;
          text-align: center !important;
        }
        #admin-layout-root .text-center {
          text-align: center !important;
        }
        /* Neutralize body.rtl RTL overrides */
        #admin-layout-root .admin-panel {
          direction: ltr !important;
          text-align: left !important;
        }
        /* Ensure mobile hamburger always works on touch screens */
        #admin-layout-root .admin-mobile-toggle {
          pointer-events: auto !important;
          cursor: pointer !important;
          touch-action: manipulation !important;
          -webkit-tap-highlight-color: transparent;
        }
        /* Ensure sidebar overlay is clickable */
        #admin-layout-root .admin-sidebar-overlay {
          pointer-events: auto !important;
          cursor: pointer !important;
        }
      `}</style>
      {/* Google Fonts for Admin */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      
      {children}
    </div>
  );
}
