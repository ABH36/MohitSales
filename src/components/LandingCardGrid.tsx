import React from 'react';
import Link from 'next/link';
import { cld } from '@/lib/cloudinary';
import { categoryIcon } from '@/lib/category-icons';
import { ArrowRight } from 'lucide-react';

const FALLBACK =
  'https://res.cloudinary.com/da2dmtm9b/image/upload/f_auto,q_auto/mohit/logo/msc_logo_without_bg.png';

export interface LandingCard {
  title: string;
  image: string | null;
  link: string;
  /** Pre-computed call-to-action text, e.g. "View Products (12)". */
  cta: string;
}

/**
 * The shared `.hce-card` grid used by every landing page — both the static
 * brand/category pages (CategoryLandingGrid) and the DB-derived hub landings
 * (renderHubLanding). Only the card markup lives here; each caller keeps its
 * own breadcrumb banner + heading + CTA wording.
 */
export default function LandingCardGrid({
  cards,
  className = '',
}: {
  cards: LandingCard[];
  className?: string;
}) {
  return (
    <div className={`hce-grid${className ? ` ${className}` : ''}`}>
      {cards.map((c, idx) => (
        <Link key={idx} href={c.link} className="hce-card">
          <span className={`hce-card-img hce-tint-${idx % 4}`}>
            <img
              src={cld(c.image || FALLBACK, 'f_auto,q_auto,w_600')}
              alt={c.title}
              loading="lazy"
              decoding="async"
            />
          </span>
          <span className="hce-card-body">
            <span className={`hce-card-badge hce-badge-${idx % 4}`} aria-hidden="true">
              {categoryIcon(c.title)}
            </span>
            <span className="hce-card-name">{c.title}</span>
            <span className="hce-card-cta">
              {c.cta} <ArrowRight aria-hidden="true" />
            </span>
          </span>
        </Link>
      ))}
    </div>
  );
}
