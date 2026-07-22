'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';

/**
 * The Products menu, as a click-opened panel instead of a hover cascade.
 *
 * The catalogue nests five deep — Polycab → Industries → Cables By Type →
 * Others → Building Wires — and a hover cascade at that depth is genuinely hard
 * to drive: the pointer has to stay inside a chain of panels that overlap their
 * own ancestors, and on a touch or hybrid screen there is no hover at all.
 *
 * This shows two columns at a time and a path across the top. Choosing a branch
 * on the right shifts it into the left column and extends the path, so the depth
 * is unbounded while the panel itself never grows or leaves the viewport. Every
 * step of the path is clickable, which is the way back out.
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

  const renderRow = (item: NavItem, opts: { active?: boolean; onDrill: () => void }) => {
    if (!hasKids(item)) {
      return (
        <Link href={`/${item.slug}`} className="pmm-row pmm-leaf" onClick={close}>
          <span>{item.name}</span>
        </Link>
      );
    }
    return (
      <button
        type="button"
        className={`pmm-row${opts.active ? ' is-active' : ''}`}
        onClick={opts.onDrill}
      >
        <span>{item.name}</span>
        <i className="fa-solid fa-chevron-right" aria-hidden="true"></i>
      </button>
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
              ✕
            </button>
          </div>

          <div className="pmm-body">
            <ul className="pmm-col pmm-col-left">
              {/* Once inside a branch, offer the branch's own page as well as its
                  children — several of them are real listing pages. */}
              {path.length > 0 && path[path.length - 1].slug && (
                <li>
                  <Link href={`/${path[path.length - 1].slug}`} className="pmm-row pmm-all" onClick={close}>
                    All {path[path.length - 1].name}
                  </Link>
                </li>
              )}
              {level.map((item) => (
                <li key={item.id}>
                  {renderRow(item, {
                    active: shown?.id === item.id,
                    onDrill: () => setPreview(item),
                  })}
                </li>
              ))}
            </ul>

            <ul className="pmm-col pmm-col-right">
              {shown ? (
                <>
                  <li className="pmm-col-title">{shown.name}</li>
                  {shown.slug && (
                    <li>
                      <Link href={`/${shown.slug}`} className="pmm-row pmm-all" onClick={close}>
                        All {shown.name}
                      </Link>
                    </li>
                  )}
                  {shown.children.map((child) => (
                    <li key={child.id}>
                      {renderRow(child, {
                        onDrill: () => stepInto(shown, child),
                      })}
                    </li>
                  ))}
                </>
              ) : (
                <li className="pmm-empty">Choose a category on the left.</li>
              )}
            </ul>
          </div>
        </div>
      )}
    </li>
  );
}
