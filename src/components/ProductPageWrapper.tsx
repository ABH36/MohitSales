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

      // 1. Intercept tab button clicks
      const tabBtn = target.closest('[data-tab-target]');
      if (tabBtn) {
        e.preventDefault();
        const tabId = tabBtn.getAttribute('data-tab-target');
        if (tabId) {
          // Find the container section or default to document
          const container = tabBtn.closest('.spec-section, .catalogue-section, main') || document;
          
          // Deactivate all tab panels and activate target panel
          container.querySelectorAll('.tab-panel').forEach((panel) => {
            panel.classList.remove('active');
          });
          const targetPanel = container.querySelector(`#${tabId}`);
          if (targetPanel) {
            targetPanel.classList.add('active');
          }
          
          // Deactivate all tab buttons and activate target button
          container.querySelectorAll('[data-tab-target]').forEach((btn) => {
            btn.classList.remove('active');
          });
          tabBtn.classList.add('active');
        }
        return;
      }

      // 2. Intercept anchor link clicks
      const anchor = target.closest('a');
      if (!anchor) return;

      const href = anchor.getAttribute('href');
      if (href) {
        // Which contact-us links become the modal.
        //
        // A `product=` parameter is the reliable signal, and most pages carry it.
        // But some enquiry buttons link to a bare /contact-us — those used to
        // navigate away while the identical button elsewhere opened the modal,
        // so the same action behaved two different ways across the site.
        //
        // Those are matched on the button itself (its label or .enquiry-btn
        // class) rather than the href, so the header/footer "Contact Us" links
        // still navigate normally — they are not enquiry buttons.
        const pointsAtContact = href.includes('contact-us');
        const hasProductParam = href.includes('product=');
        const looksLikeEnquiryCta =
          anchor.classList.contains('enquiry-btn') ||
          /enquir/i.test(anchor.textContent || '');

        const isProductContact = pointsAtContact && (hasProductParam || looksLikeEnquiryCta);
        if (isProductContact) {
          e.preventDefault();
          try {
            // Extract the product query parameter
            const url = new URL(href, window.location.origin);
            // Without an explicit product, fall back to the page's own heading so
            // the enquiry still says which product it is about.
            const prod =
              url.searchParams.get('product') ||
              document.querySelector('.rs-breadcrumb-title')?.textContent?.trim() ||
              document.querySelector('h1')?.textContent?.trim() ||
              '';
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
