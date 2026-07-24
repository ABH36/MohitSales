'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { cld } from '@/lib/cloudinary';
import type { ExplorerArm, ExplorerNode } from '@/lib/home-explorer';
import { categoryIcon } from '@/lib/category-icons';
import { LayoutGrid, ArrowRight } from 'lucide-react';

/**
 * The homepage "Polycab Consumer / Industries / Dowells" explorers.
 *
 * A row of icon tabs above a card grid. The default "All …" tab shows the
 * top-level categories; picking a tab swaps the grid to that category's own
 * ranges. Cards carry a tinted image stage, a category icon badge and a
 * "View Products →" call-to-action. `flat` renders the auto-scroll marquee
 * (Polycab Cables) instead of tabs.
 */

interface Props {
  arm: ExplorerArm;
  /** Section heading, e.g. "Polycab Consumer" — the words after the first are
      rendered in the red accent, matching the section design. */
  heading: string;
  /** Flat mode: no tabs — a single marquee row (Polycab Cables). */
  flat?: boolean;
}

const FALLBACK =
  'https://res.cloudinary.com/da2dmtm9b/image/upload/f_auto,q_auto/mohit/logo/msc_logo_without_bg.png';

function Card({
  node,
  index,
  eager = false,
  tabbable = true,
}: {
  node: ExplorerNode;
  index: number;
  eager?: boolean;
  tabbable?: boolean;
}) {
  const tint = index % 4;
  return (
    <Link href={`/${node.slug}`} className="hce-card" tabIndex={tabbable ? undefined : -1}>
      <span className={`hce-card-img hce-tint-${tint}`}>
        {/* Marquee cards scroll continuously, so they load eagerly to avoid
            visible pop-in; grid cards stay lazy. */}
        <img src={cld(node.image || FALLBACK)} alt={node.name} loading={eager ? 'eager' : 'lazy'} />
      </span>
      <span className="hce-card-body">
        <span className={`hce-card-badge hce-badge-${tint}`} aria-hidden="true">
          {categoryIcon(node.name)}
        </span>
        <span className="hce-card-name">{node.name}</span>
        <span className="hce-card-cta">
          View Products <ArrowRight aria-hidden="true" />
        </span>
      </span>
    </Link>
  );
}

export default function HomeCategoryExplorer({ arm, heading, flat = false }: Props) {
  // -1 is the default "All …" tab; otherwise the index into arm.categories.
  const [active, setActive] = useState(-1);

  const cards: ExplorerNode[] = useMemo(() => {
    if (flat || active < 0) return arm.categories;
    const cat = arm.categories[active];
    // A category view leads with an "All <category>" card to its own hub, then
    // its ranges.
    const lead: ExplorerNode = { name: `All ${cat.name}`, slug: cat.slug, image: cat.image };
    return [lead, ...(cat.children ?? [])];
  }, [active, arm, flat]);

  const [headFirst, ...headRest] = heading.split(' ');

  return (
    <section className="hce-section">
      <div className="container">
        <div className="hce-head-row">
          <div className="hce-head">
            <span className="rs-section-subtitle has-theme-orange justify-content-start">
              <svg xmlns="http://www.w3.org/2000/svg" width="11" height="15" viewBox="0 0 11 15" fill="none">
                <path d="M3.14286 10L0 15L8.78104e-07 0L3.14286 5V10Z" fill="#1E2E5E"></path>
                <path fillRule="evenodd" clipRule="evenodd" d="M6.28571 10L3.14286 15L3.14286 10L4.71428 7.5L3.14286 5L3.14286 0L6.28571 5L6.28571 10ZM6.28571 10L7.85714 7.5L6.28571 5V0L11 7.5L6.28571 15V10Z" fill="#1E2E5E"></path>
              </svg>
              Our Products
            </span>
            <h2 className="rs-section-title hce-title">
              {headFirst}{' '}
              {headRest.length > 0 && <span className="hce-title-accent">{headRest.join(' ')}</span>}
            </h2>
            <span className="hce-underline" aria-hidden="true"></span>
          </div>
        </div>

        {!flat && (
          <div className="hce-tabs" role="tablist" aria-label={`${heading} categories`}>
            <button
              type="button"
              role="tab"
              aria-selected={active === -1}
              className={`hce-tab${active === -1 ? ' is-active' : ''}`}
              onClick={() => setActive(-1)}
            >
              <LayoutGrid aria-hidden="true" />
              {arm.allLabel}
            </button>
            {arm.categories.map((cat, i) => (
              <button
                key={cat.slug}
                type="button"
                role="tab"
                aria-selected={active === i}
                className={`hce-tab${active === i ? ' is-active' : ''}`}
                onClick={() => setActive(i)}
              >
                {categoryIcon(cat.name)}
                {cat.name}
              </button>
            ))}
          </div>
        )}

        {flat ? (
          /* One continuously scrolling row. The set is duplicated (the copy is
             aria-hidden) so the CSS -50% loop is seamless. */
          <div className="hce-marquee">
            <div className="hce-marquee-track">
              {cards.map((node, i) => (
                <Card key={node.slug + node.name} node={node} index={i} eager />
              ))}
              <span className="hce-marquee-dup" aria-hidden="true">
                {cards.map((node, i) => (
                  <Card key={'dup-' + node.slug + node.name} node={node} index={i} eager tabbable={false} />
                ))}
              </span>
            </div>
          </div>
        ) : (
          /* key changes on every tab switch so the grid re-mounts and replays
             the fade — that is the "swap" animation. */
          <div className="hce-grid" key={active}>
            {cards.map((node, i) => (
              <Card key={node.slug + node.name} node={node} index={i} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
