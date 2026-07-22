'use client';

import React, { useEffect } from 'react';

export default function NotFound() {
  useEffect(() => {
    // Log the 404 error asynchronously
    const log404 = async () => {
      try {
        await fetch('/api/public/not-found', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            path: window.location.pathname,
            referrer: document.referrer || null,
          }),
        });
      } catch (err) {
        console.error('[404 logger failed]:', err);
      }
    };
    log404();
  }, []);

  return (
    <main className="min-h-screen d-flex align-items-center justify-content-center py-16 px-4" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)' }}>
      <div 
        className="container max-w-lg mx-auto text-center p-8 rounded-2xl shadow-2xl border" 
        style={{ 
          background: 'rgba(255, 255, 255, 0.05)', 
          backdropFilter: 'blur(10px)', 
          borderColor: 'rgba(255, 255, 255, 0.1)',
          animation: 'fadeInUp 0.6s ease-out forwards'
        }}
      >
        {/* Warning Alert Icon & Heading */}
        <div className="mb-6">
          <div className="d-flex justify-content-center mb-4">
            <div 
              className="rounded-full p-4 d-flex align-items-center justify-content-center"
              style={{ 
                background: 'rgba(193, 39, 45, 0.15)',
                border: '2px dashed #F7931E',
                width: '80px',
                height: '80px',
                animation: 'pulse 2s infinite'
              }}
            >
              <i className="fa-solid fa-triangle-exclamation text-4xl" style={{ color: '#F7931E' }}></i>
            </div>
          </div>
          <h2 className="text-3xl font-black text-white mb-3" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Alert: Page Not Found
          </h2>
          <div 
            className="p-4 rounded-xl text-left border mb-6"
            style={{ 
              background: 'rgba(239, 68, 68, 0.1)', 
              borderColor: 'rgba(239, 68, 68, 0.2)',
              color: '#fca5a5'
            }}
          >
            <div className="d-flex gap-3 align-items-center">
              <i className="fa-solid fa-circle-info text-xl" style={{ color: '#ef4444' }}></i>
              <p className="m-0 text-sm font-medium">
                Oops! The path you tried to access does not exist on this server.
              </p>
            </div>
          </div>
        </div>

        {/* Back to Home Button */}
        <div className="d-flex justify-content-center mt-6">
          <a 
            href="/" 
            className="rs-btn has-theme-orange has-icon has-bg py-3 px-8 text-white font-bold rounded-lg transition-all inline-flex items-center gap-3"
            style={{ 
              background: 'linear-gradient(135deg, #F7931E 0%, #d07613 100%)', 
              textDecoration: 'none',
              boxShadow: '0 8px 20px rgba(193, 39, 45, 0.3)'
            }}
          >
            Go to Homepage
            <span className="icon-box">
              <svg className="icon-first w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="currentColor">
                <path d="M31.71,15.29l-10-10L20.29,6.71,28.59,15H0v2H28.59l-8.29,8.29,1.41,1.41,10-10A1,1,0,0,0,31.71,15.29Z"></path>
              </svg>
            </span>
          </a>
        </div>
      </div>

      {/* Animation Styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        /* Hide Header, Footer, CTA, and Floating sticky bar on 404 page */
        header, 
        .rs-header-area, 
        footer, 
        .rs-cta-area, 
        .social_media_sticky, 
        .sticky_icons, 
        .offcanvas-overlay, 
        .fix {
          display: none !important;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
      ` }} />
    </main>
  );
}
