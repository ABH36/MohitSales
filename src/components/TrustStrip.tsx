import React from 'react';

/**
 * Trust strip — a full-width band of five glassmorphism trust badges sitting
 * directly beneath the About Us section. Pure presentational / server-rendered:
 * the light grid + gradient glow, glass cards and hover lift are all CSS
 * (`.trust-strip*` in globals.css), so there is no hydration cost. Icons use a
 * single accent colour (#FF5A3C) inside a gradient chip. */

interface Badge {
  label: string;
  icon: React.ReactNode;
}

const BADGES: Badge[] = [
  {
    label: 'Authorized Polycab Distributor',
    // shield-check
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    ),
  },
  {
    label: 'Genuine Dowells Products',
    // rosette / certified
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="8" r="6" />
        <path d="M8.21 13.89 7 22l5-3 5 3-1.21-8.12" />
      </svg>
    ),
  },
  {
    label: '27+ Years of Industry Experience',
    // clock / experience
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </svg>
    ),
  },
  {
    label: '5000+ Happy Customers',
    // smiling users
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="8" r="4" />
        <path d="M9.5 9a3 3 0 0 0 5 0" />
        <path d="M4 21a8 8 0 0 1 16 0" />
      </svg>
    ),
  },
  {
    label: 'Fast Delivery Across India',
    // delivery truck
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M1 4h13v11H1z" />
        <path d="M14 8h4l3 3v4h-7" />
        <circle cx="6" cy="18" r="2" />
        <circle cx="17" cy="18" r="2" />
      </svg>
    ),
  },
];

export default function TrustStrip() {
  return (
    <section className="trust-strip" aria-label="Why customers trust us">
      {/* decorative layers — grid + gradient glow */}
      <span className="trust-strip-grid" aria-hidden="true"></span>
      <span className="trust-strip-glow" aria-hidden="true"></span>

      <div className="container">
        <div className="trust-strip-head scroll-reveal" data-delay="0">
          <h2 className="trust-strip-title">Trusted Across India</h2>
          <p className="trust-strip-sub">
            Delivering Genuine Electrical Solutions with Quality, Reliability, and Excellence.
          </p>
        </div>

        <ul className="trust-strip-badges">
          {BADGES.map((b, i) => (
            <li
              key={b.label}
              className="trust-badge scroll-reveal"
              data-delay={`${100 + i * 90}`}
            >
              <span className="trust-badge-icon" aria-hidden="true">{b.icon}</span>
              <span className="trust-badge-label">{b.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
