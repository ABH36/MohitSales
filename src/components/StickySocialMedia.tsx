'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePublicSettings } from '@/components/PublicSettingsContext';

export default function StickySocialMedia() {
  const { getSetting } = usePublicSettings();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 350) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div
      className="social_media_sticky sticky_icons"
      id="sticky-icon"
      style={{
        opacity: isVisible ? 1 : 0,
        visibility: isVisible ? 'visible' : 'hidden',
        transition: 'all 0.3s ease',
      }}
    >
      <a href={getSetting('social_facebook', '#') || '#'} className="Facebook" target="_blank" rel="noopener noreferrer">
        <i className="fab fa-facebook-f icon"></i> Facebook
      </a>
      <a
        href="https://api.whatsapp.com/send?phone=919522952267&text=Hi,%20I%20would%20like%20to%20do%20enquire%20about%20your%20products."
        className="Google"
        target="_blank"
        rel="noopener noreferrer"
      >
        <i className="fab fa-whatsapp icon"></i> WhatsApp
      </a>
      <a href={getSetting('social_instagram', '#') || '#'} className="Instagram" target="_blank" rel="noopener noreferrer">
        <i className="fab fa-instagram icon"></i> Instagram
      </a>
      <a href={getSetting('social_linkedin', '#') || '#'} className="LinkedIn linkedin" target="_blank" rel="noopener noreferrer">
        <i className="fa-brands fa-linkedin-in icon"></i> LinkedIn
      </a>
      <a href="/contact-us#contact-us-form" className="Quote">
        <div className="social_icon" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
          <Image src="/assets/images/icon/sign-document-icon.svg" className="img-fluid inline-block" alt="Quote Icon" width={24} height={24} />
        </div>
        Request a Quote
      </a>
      <Link href="/pricelist" className="Twitter">
        <div className="social_icon" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
          <Image src="/assets/images/icon/price.png" className="img-fluid tweet inline-block" alt="Pricelist" width={24} height={24} />
        </div>
        View Pricelist
      </Link>
    </div>
  );
}
