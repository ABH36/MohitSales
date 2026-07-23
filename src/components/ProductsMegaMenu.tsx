'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { cld } from '@/lib/cloudinary';
import { categoryIcon } from '@/lib/category-icons';
import { menuImage } from '@/lib/menu-images';
import { Package, ShieldCheck, ChevronRight, X } from 'lucide-react';

/**
 * The Products menu — a click-opened panel, Havells-style flat layout.
 *
 * Earlier versions drilled level by level (pick an arm, then a group, then a
 * range), which meant three clicks and a moving target before a visitor saw a
 * single product link. This shows a whole arm at once instead: the left rail
 * lists the arms (Consumer, Industries, Dowells), and the right side lays the
 * selected arm's groups out as columns — group header (image tile + name,
 * linking to its hub) with every range under it as a plain link. Two levels
 * of the catalogue are always visible, nothing is hidden behind a hover, and
 * any link is at most one click away.
 */

export interface NavItem {
  id: string;
  name: string;
  slug: string;
  children: NavItem[];
}

interface Props {
  tree: NavItem[];
  /** Rendered as the trigger's label. */
  label?: string;
}

const hasKids = (i: NavItem) => Array.isArray(i.children) && i.children.length > 0;

/** One-liner under the right column's eyebrow, per arm. */
function armBlurb(name: string): string {
  const n = name.toLowerCase();
  if (n.includes('consumer'))
    return 'Wide range of high quality electrical products designed for modern homes and spaces.';
  if (n.includes('industr'))
    return 'High performance cables and solutions engineered for demanding industrial applications.';
  if (n.includes('dowells'))
    return 'Cable terminals, glands and crimping tools trusted across the industry.';
  return 'Explore the complete range.';
}

const PROMO_IMG =
  'https://res.cloudinary.com/da2dmtm9b/image/upload/f_auto,q_auto,w_420/mohit/about/authorized-distributor.png';

/** A rail entry: an arm plus the brand it belongs to (for the breadcrumb). */
interface Arm {
  item: NavItem;
  brand: string | null;
}

export default function ProductsMegaMenu({ tree, label = 'Products' }: Props) {
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);

  const wrapRef = useRef<HTMLLIElement | null>(null);

  const close = useCallback(() => {
    setOpen(false);
    setActiveIdx(0);
  }, []);

  // Close on outside click and on Escape — a panel this size is worse than a
  // dropdown if the only way to dismiss it is to find the × again.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) close();
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, close]);

  /**
   * The rail flattens the brand level: a root whose children are themselves
   * grouped (Polycab → Consumer/Industries) contributes those arms; a root
   * with only leaf children (Dowells) is an arm itself. That keeps the rail
   * to a handful of entries no matter how the tree grows.
   */
  const arms: Arm[] = useMemo(
    () =>
      tree.flatMap((root): Arm[] =>
        root.children.some(hasKids)
          ? root.children.map((c) => ({ item: c, brand: root.name }))
          : [{ item: root, brand: null }]
      ),
    [tree]
  );

  const active = arms[Math.min(activeIdx, arms.length - 1)] ?? null;

  /** Column groups for the active arm; loose leaves gather under the arm itself. */
  const { groups, loose } = useMemo(() => {
    if (!active) return { groups: [] as NavItem[], loose: [] as NavItem[] };
    return {
      groups: active.item.children.filter(hasKids),
      loose: active.item.children.filter((c) => !hasKids(c)),
    };
  }, [active]);

  const groupTile = (g: NavItem) => {
    const img = menuImage(g.slug);
    return (
      <span className="pmm-g-tile" aria-hidden="true">
        {img ? (
          <img src={cld(img, 'f_auto,q_auto,w_120')} alt="" loading="lazy" decoding="async" />
        ) : (
          categoryIcon(g.name)
        )}
      </span>
    );
  };

  return (
    <li className="nav-has-sub pmm-wrap" ref={wrapRef}>
      <a
        href="#"
        aria-expanded={open}
        aria-haspopup="true"
        onClick={(e) => {
          e.preventDefault();
          setOpen((o) => !o);
        }}
      >
        {label}
        <svg
          width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
          style={{ marginLeft: '5px', verticalAlign: 'middle',
                   transform: open ? 'rotate(180deg)' : undefined, transition: 'transform .2s ease' }}
          aria-hidden="true"
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </a>

      {open && (
        <div className="pmm-panel" role="dialog" aria-label="Products menu">
          <div className="pmm-head">
            <span className="pmm-head-icon" aria-hidden="true"><Package /></span>
            <nav className="pmm-path" aria-label="Menu path">
              <span className="pmm-crumb">{label}</span>
              {active?.brand && (
                <>
                  <span className="pmm-sep" aria-hidden="true">›</span>
                  <span className="pmm-crumb">{active.brand}</span>
                </>
              )}
              {active && (
                <>
                  <span className="pmm-sep" aria-hidden="true">›</span>
                  <span className="pmm-crumb is-current">{active.item.name}</span>
                </>
              )}
            </nav>
            <button type="button" className="pmm-close" onClick={close} aria-label="Close products menu">
              <X aria-hidden="true" />
            </button>
          </div>

          <div className="pmm-body">
            <div className="pmm-rail">
              <span className="pmm-eyebrow">Browse Products</span>

              <ul className="pmm-rail-list">
                {arms.map((arm, i) => (
                  <li key={arm.item.id}>
                    <button
                      type="button"
                      className={`pmm-arm${i === activeIdx ? ' is-active' : ''}`}
                      onClick={() => setActiveIdx(i)}
                      onMouseEnter={() => setActiveIdx(i)}
                    >
                      <span className="pmm-arm-icon" aria-hidden="true">{categoryIcon(arm.item.name)}</span>
                      <span className="pmm-arm-name">{arm.item.name}</span>
                      <ChevronRight className="pmm-chev" aria-hidden="true" />
                    </button>
                  </li>
                ))}
              </ul>

              <div className="pmm-promo">
                <div className="pmm-promo-stage" aria-hidden="true">
                  <img src={cld(PROMO_IMG)} alt="" loading="lazy" decoding="async" />
                </div>
                <div className="pmm-trust">
                  <span className="pmm-trust-icon" aria-hidden="true"><ShieldCheck /></span>
                  <span>
                    <strong>Trusted Quality</strong>
                    <small>Safe. Reliable. Durable.</small>
                  </span>
                </div>
              </div>
            </div>

            <div className="pmm-main">
              {active && (
                <>
                  <span className="pmm-eyebrow">{active.item.name} Range</span>
                  <p className="pmm-blurb">{armBlurb(active.item.name)}</p>

                  <div className="pmm-groups">
                    {groups.map((g) => (
                      <div key={g.id} className="pmm-group">
                        <Link href={`/${g.slug}`} className="pmm-g-head" onClick={close}>
                          {groupTile(g)}
                          <span className="pmm-g-name">{g.name}</span>
                        </Link>
                        <ul className="pmm-g-list">
                          {g.children.map((child) => (
                            <li key={child.id}>
                              <Link href={`/${child.slug}`} className="pmm-g-link" onClick={close}>
                                {child.name}
                              </Link>
                            </li>
                          ))}
                          <li>
                            <Link href={`/${g.slug}`} className="pmm-g-link pmm-g-all" onClick={close}>
                              View All <ChevronRight aria-hidden="true" />
                            </Link>
                          </li>
                        </ul>
                      </div>
                    ))}

                    {/* Arms with no sub-groups (Dowells) render as one column. */}
                    {loose.length > 0 && (
                      <div className="pmm-group">
                        <Link href={`/${active.item.slug}`} className="pmm-g-head" onClick={close}>
                          {groupTile(active.item)}
                          <span className="pmm-g-name">{active.item.name}</span>
                        </Link>
                        <ul className="pmm-g-list">
                          {loose.map((child) => (
                            <li key={child.id}>
                              <Link href={`/${child.slug}`} className="pmm-g-link" onClick={close}>
                                {child.name}
                              </Link>
                            </li>
                          ))}
                          <li>
                            <Link href={`/${active.item.slug}`} className="pmm-g-link pmm-g-all" onClick={close}>
                              View All <ChevronRight aria-hidden="true" />
                            </Link>
                          </li>
                        </ul>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </li>
  );
}
