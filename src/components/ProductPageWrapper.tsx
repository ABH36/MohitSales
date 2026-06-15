'use client';

import React, { useState, useEffect } from 'react';
import EnquiryModal from './EnquiryModal';

interface ProductPageWrapperProps {
  children: React.ReactNode;
}

export default function ProductPageWrapper({ children }: ProductPageWrapperProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [productName, setProductName] = useState('');

  useEffect(() => {
    const handleInterceptClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Traverse up to find the closest anchor link
      const anchor = target.closest('a');
      if (!anchor) return;

      const href = anchor.getAttribute('href');
      if (href) {
        // Intercept URLs containing 'contact-us' that have a 'product' query parameter
        const isProductContact = href.includes('contact-us') && href.includes('product=');
        if (isProductContact) {
          e.preventDefault();
          try {
            // Extract the product query parameter
            const url = new URL(href, window.location.origin);
            const prod = url.searchParams.get('product') || '';
            if (modalOpen) {
              setModalOpen(false);
              setTimeout(() => {
                setProductName(prod);
                setModalOpen(true);
              }, 300);
            } else {
              setProductName(prod);
              setModalOpen(true);
            }
          } catch (err) {
            console.error('[ProductPageWrapper] URL parsing error:', err);
          }
        }
      }
    };

    document.addEventListener('click', handleInterceptClick);
    return () => document.removeEventListener('click', handleInterceptClick);
  }, [modalOpen]);

  return (
    <>
      {children}
      {modalOpen && (
        <EnquiryModal 
          productName={productName} 
          onClose={() => setModalOpen(false)} 
        />
      )}
    </>
  );
}
