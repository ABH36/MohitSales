'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { cld } from '@/lib/cloudinary';
import type { ExplorerArm, ExplorerNode } from '@/lib/home-explorer';

/**
 * The homepage "Polycab Consumer" / "Polycab Industries" explorer.
 *
 * A row of filter tabs sits above a card grid. The default "All …" tab shows the
 * top-level categories; picking a tab swaps the grid to that category's own
 * ranges — so a visitor can drill from the homepage to any product page without
 * touching the menu. The grid fades as it swaps.
 */

interface Props {
  arm: ExplorerArm;
  /** Section heading, e.g. "Polycab Consumer". */
  heading: string;
  /**
   * Flat mode: no tab row, just a grid of the top-level categories linking
   * straight to their listing pages. Used for Polycab Cables, whose types each
   * hold hundreds of SKUs, so a drill-down would not fit.
   */
  flat?: boolean;
}

const FALLBACK =
  'https://res.cloudinary.com/da2dmtm9b/image/upload/f_auto,q_auto/mohit/logo/msc_logo_without_bg.png';

function Card({ node, eager = false, tabbable = true }: { node: ExplorerNode; eager?: boolean; tabbable?: boolean }) {
  return (
    <Link href={`/${node.slug}`} className="hce-card" tabIndex={tabbable ? undefined : -1}>
      <span className="hce-card-img">
        {/* Marquee cards scroll continuously, so they load eagerly to avoid
            visible pop-in; grid cards stay lazy. */}
        <img src={cld(node.image || FALLBACK)} alt={node.name} loading={eager ? 'eager' : 'lazy'} />
      </span>
      <span className="hce-card-name">
        <span className="hce-card-label">{node.name}</span>
        {/* Revealed on hover so a visitor knows the card is clickable. */}
        <span className="hce-card-explore" aria-hidden="true">Explore</span>
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

  return (
    <section className="hce-section">
      <div className="container">
        <div className="hce-head">
          <span className="rs-section-subtitle has-theme-orange justify-content-start">
            <svg xmlns="http://www.w3.org/2000/svg" width="11" height="15" viewBox="0 0 11 15" fill="none">
              <path d="M3.14286 10L0 15L8.78104e-07 0L3.14286 5V10Z" fill="#1E2E5E"></path>
              <path fillRule="evenodd" clipRule="evenodd" d="M6.28571 10L3.14286 15L3.14286 10L4.71428 7.5L3.14286 5L3.14286 0L6.28571 5L6.28571 10ZM6.28571 10L7.85714 7.5L6.28571 5V0L11 7.5L6.28571 15V10Z" fill="#1E2E5E"></path>
            </svg>
            Our Products
          </span>
          <h2 className="rs-section-title">{heading}</h2>
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
              {cards.map((node) => (
                <Card key={node.slug + node.name} node={node} eager />
              ))}
              <span className="hce-marquee-dup" aria-hidden="true">
                {cards.map((node) => (
                  <Card key={'dup-' + node.slug + node.name} node={node} eager tabbable={false} />
                ))}
              </span>
            </div>
          </div>
        ) : (
          /* key changes on every tab switch so the grid re-mounts and replays
             the fade — that is the "swap" animation. */
          <div className="hce-grid" key={active}>
            {cards.map((node) => (
              <Card key={node.slug + node.name} node={node} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
