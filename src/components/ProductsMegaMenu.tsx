'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { cld } from '@/lib/cloudinary';
import { categoryIcon } from '@/lib/category-icons';
import { menuImage } from '@/lib/menu-images';
import { Package, ShieldCheck, ChevronRight, LayoutGrid, X } from 'lucide-react';

/**
 * The Products menu, as a click-opened panel instead of a hover cascade.
 *
 * The catalogue nests five deep — Polycab → Industries → Cables By Type →
 * Others → Building Wires — and a hover cascade at that depth is genuinely hard
 * to drive: the pointer has to stay inside a chain of panels that overlap their
 * own ancestors, and on a touch or hybrid screen there is no hover at all.
 *
 * Layout (per the approved mock): a header row with an icon tile, the
 * clickable path and a close button; a "BROWSE …" rail on the left listing the
 * current level with icon tiles (the highlighted one becomes a red pill), a
 * promo + "Trusted Quality" card under it; and the highlighted branch's
 * children as tile rows on the right under a "<name> RANGE" eyebrow. Choosing
 * a branch on the right shifts it into the left rail and extends the path, so
 * the depth is unbounded while the panel never grows or leaves the viewport.
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
  if (n.includes('renewable') || n.includes('solar'))
    return 'Solar panels, inverters and DC gear for clean, dependable power.';
  if (n.includes('polycab'))
    return "India's most trusted electrical brand — explore the complete range.";
  if (n.includes('dowells'))
    return 'Cable terminals, glands and crimping tools trusted across the industry.';
  return 'Explore the complete range.';
}

const PROMO_IMG =
  'https://res.cloudinary.com/da2dmtm9b/image/upload/f_auto,q_auto,w_420/mohit/about/authorized-distributor.png';

export default function ProductsMegaMenu({ tree, label = 'Products' }: Props) {
  const [open, setOpen] = useState(false);
  /** Items chosen so far. The list shown on the left is the last one's children. */
  const [path, setPath] = useState<NavItem[]>([]);
  /** Highlighted item in the left column, whose children fill the right column. */
  const [preview, setPreview] = useState<NavItem | null>(null);

  const wrapRef = useRef<HTMLLIElement | null>(null);

  const close = useCallback(() => {
    setOpen(false);
    setPath([]);
    setPreview(null);
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

  /** Items currently listed on the left. */
  const level = useMemo(
    () => (path.length ? path[path.length - 1].children : tree),
    [path, tree]
  );

  /**
   * The highlight is derived rather than stored-and-reset. A chosen item is kept
   * as long as it belongs to the level on screen; otherwise the first branch of
   * that level stands in, so the right column is never blank on arrival and
   * stepping in does not need to race an effect to keep its selection.
   */
  const shown = useMemo(() => {
    if (preview && level.some((i) => i.id === preview.id)) return preview;
    return level.find(hasKids) ?? null;
  }, [preview, level]);

  /**
   * Step in one level: the highlighted item becomes the new left column and the
   * branch clicked in the right column becomes the new highlight, so what was
   * just clicked is what is shown.
   */
  const stepInto = (parent: NavItem, child: NavItem) => {
    setPath((p) => [...p, parent]);
    setPreview(child);
  };

  /** Jump back to a point on the path; index -1 is the root. */
  const jumpTo = (index: number) => {
    setPath((p) => p.slice(0, index + 1));
  };

  /** The name the left rail browses — the current branch, or the menu root. */
  const browseName = path.length ? path[path.length - 1].name : label;

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
              <button type="button" onClick={() => jumpTo(-1)} className="pmm-crumb">
                {label}
              </button>
              {path.map((p, i) => (
                <React.Fragment key={p.id}>
                  <span className="pmm-sep" aria-hidden="true">›</span>
                  <button type="button" onClick={() => jumpTo(i)} className="pmm-crumb">
                    {p.name}
                  </button>
                </React.Fragment>
              ))}
            </nav>
            <button type="button" className="pmm-close" onClick={close} aria-label="Close products menu">
              <X aria-hidden="true" />
            </button>
          </div>

          <div className="pmm-body">
            <div className="pmm-rail">
              <span className="pmm-eyebrow">Browse {browseName}</span>

              <ul className="pmm-rail-list">
                {/* Once inside a branch, offer the branch's own page as well as
                    its children — several of them are real listing pages. */}
                {path.length > 0 && path[path.length - 1].slug && (
                  <li>
                    <Link href={`/${path[path.length - 1].slug}`} className="pmm-arm pmm-arm-all" onClick={close}>
                      <span className="pmm-arm-icon" aria-hidden="true"><LayoutGrid /></span>
                      <span className="pmm-arm-name">All {path[path.length - 1].name}</span>
                      <ChevronRight className="pmm-chev" aria-hidden="true" />
                    </Link>
                  </li>
                )}
                {level.map((item) =>
                  hasKids(item) ? (
                    <li key={item.id}>
                      <button
                        type="button"
                        className={`pmm-arm${shown?.id === item.id ? ' is-active' : ''}`}
                        onClick={() => setPreview(item)}
                      >
                        <span className="pmm-arm-icon" aria-hidden="true">{categoryIcon(item.name)}</span>
                        <span className="pmm-arm-name">{item.name}</span>
                        <ChevronRight className="pmm-chev" aria-hidden="true" />
                      </button>
                    </li>
                  ) : (
                    <li key={item.id}>
                      <Link href={`/${item.slug}`} className="pmm-arm" onClick={close}>
                        <span className="pmm-arm-icon" aria-hidden="true">{categoryIcon(item.name)}</span>
                        <span className="pmm-arm-name">{item.name}</span>
                        <ChevronRight className="pmm-chev" aria-hidden="true" />
                      </Link>
                    </li>
                  )
                )}
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
              {shown ? (
                <>
                  <span className="pmm-eyebrow">{shown.name} Range</span>
                  <p className="pmm-blurb">{armBlurb(shown.name)}</p>

                  <ul className="pmm-rows">
                    {shown.slug && (
                      <li>
                        <Link href={`/${shown.slug}`} className="pmm-item pmm-item-all" onClick={close}>
                          <span className="pmm-item-tile pmm-tile-0" aria-hidden="true"><LayoutGrid /></span>
                          <span className="pmm-item-name">All {shown.name}</span>
                          <ChevronRight className="pmm-chev" aria-hidden="true" />
                        </Link>
                      </li>
                    )}
                    {shown.children.map((child, i) => {
                      // Real product photo where one exists (see menu-images);
                      // the category icon stands in otherwise.
                      const img = menuImage(child.slug);
                      const tile = (
                        <span className={`pmm-item-tile pmm-tile-${(i + 1) % 4}`} aria-hidden="true">
                          {img ? (
                            <img src={cld(img, 'f_auto,q_auto,w_120')} alt="" loading="lazy" decoding="async" />
                          ) : (
                            categoryIcon(child.name)
                          )}
                        </span>
                      );
                      return hasKids(child) ? (
                        <li key={child.id}>
                          <button
                            type="button"
                            className="pmm-item"
                            onClick={() => stepInto(shown, child)}
                          >
                            {tile}
                            <span className="pmm-item-name">{child.name}</span>
                            <ChevronRight className="pmm-chev" aria-hidden="true" />
                          </button>
                        </li>
                      ) : (
                        <li key={child.id}>
                          <Link href={`/${child.slug}`} className="pmm-item" onClick={close}>
                            {tile}
                            <span className="pmm-item-name">{child.name}</span>
                            <ChevronRight className="pmm-chev" aria-hidden="true" />
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </>
              ) : (
                <p className="pmm-empty">Choose a category on the left.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </li>
  );
}
