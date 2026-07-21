'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

/**
 * Filter/sort bar for the legacy category listings.
 *
 * Those pages ship as stored HTML — /industries/cables-by-application/utility
 * alone renders 183 cards with no way to narrow them. Rather than convert that
 * content (thousands of pages) this reads the cards already in the DOM and
 * toggles their wrappers, so the markup stays untouched and every legacy
 * listing gains the same controls.
 *
 * Facets are derived from the product titles because that is where the useful
 * information actually lives: "Polycab MV Cu BS 7870-4-10 6.35/11kV" carries
 * both its standard and its voltage.
 */

const MIN_CARDS = 8; // below this, controls are noise

/**
 * The legacy export uses three card shapes. `cables-card` covers most listings
 * (210 pages), but `standard-card` carries the standards indexes — one of which
 * lists 51 — and `card_box` the spec-table listings (34 pages).
 */
const CARD_SELECTOR = '.cables-card, .standard-card, .card_box';

/** Title lives in a different node per card shape; last entry is the fallback. */
const TITLE_SELECTORS = ['.cables-name h4', '.standard-text h2', 'h3.product-title', 'h2, h3, h4'];

function readTitle(node: HTMLElement): string {
  for (const sel of TITLE_SELECTORS) {
    const el = node.querySelector(sel);
    const text = el?.textContent?.trim();
    if (text) return text;
  }
  // Spec tables would make textContent enormous, so cap it.
  return (node.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 120);
}

interface Card {
  wrapper: HTMLElement;
  title: string;
  lower: string;
  standard: string | null;
  voltage: string | null;
}

// "IS 694", "BS 7870-4-10", "BSEN 50525-2-31", "IEC 60502-1", "AS-NZS 5000", "UL 44"
const STANDARD_RE = /\b(IS|BS|BSEN|BS\s?EN|IEC|UL|AS[-\s]?NZS|ANSI|ICEA|NEMA)\s?-?\s?(\d[\d\-.\/]*)/i;
// "1100V", "450/750V", "6.35/11kV", "33kV"
const VOLTAGE_RE = /\b(\d+(?:\.\d+)?(?:\/\d+(?:\.\d+)?)?)\s?(kV|V)\b/i;

function normaliseStandard(title: string): string | null {
  const m = title.match(STANDARD_RE);
  if (!m) return null;
  const family = m[1].toUpperCase().replace(/\s/g, '').replace('BSEN', 'BSEN');
  return `${family} ${m[2]}`.trim();
}

function normaliseVoltage(title: string): string | null {
  const m = title.match(VOLTAGE_RE);
  if (!m) return null;
  return `${m[1]}${m[2].toLowerCase() === 'kv' ? 'kV' : 'V'}`;
}

export default function CategoryFilter() {
  const [cards, setCards] = useState<Card[]>([]);
  const [query, setQuery] = useState('');
  const [standard, setStandard] = useState('');
  const [voltage, setVoltage] = useState('');
  const [sort, setSort] = useState<'default' | 'az' | 'za'>('default');
  // Kept so "reset" can restore the page's original card order.
  const originalOrder = useRef<HTMLElement[]>([]);
  const gridRef = useRef<HTMLElement | null>(null);
  // The controls belong directly above the grid, which sits inside the stored
  // HTML — so mount a host there and portal into it rather than rendering at
  // whatever position this component happens to occupy.
  const [host, setHost] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll<HTMLElement>(CARD_SELECTOR));
    if (nodes.length < MIN_CARDS) return;

    const collected: Card[] = [];
    for (const node of nodes) {
      const title = readTitle(node);
      if (!title) continue;
      // The column wrapper is what the grid lays out, so that is what gets hidden.
      const wrapper = (node.closest('[class*="col-"]') as HTMLElement) || node;
      collected.push({
        wrapper,
        title,
        lower: title.toLowerCase(),
        standard: normaliseStandard(title),
        voltage: normaliseVoltage(title),
      });
    }
    if (!collected.length) return;

    const grid = collected[0].wrapper.parentElement;
    gridRef.current = grid;
    originalOrder.current = collected.map((c) => c.wrapper);

    // Insert the host immediately before the grid row.
    let mount: HTMLElement | null = null;
    if (grid?.parentElement) {
      mount = document.createElement('div');
      mount.className = 'category-filter-host';
      grid.parentElement.insertBefore(mount, grid);
      setHost(mount);
    }

    setCards(collected);
    return () => { mount?.remove(); };
  }, []);

  const standards = useMemo(
    () => Array.from(new Set(cards.map((c) => c.standard).filter(Boolean) as string[])).sort(),
    [cards]
  );
  const voltages = useMemo(() => {
    const uniq = Array.from(new Set(cards.map((c) => c.voltage).filter(Boolean) as string[]));
    // Sort numerically, and treat kV as 1000x so 415V sits below 11kV.
    return uniq.sort((a, b) => {
      const val = (v: string) => {
        const n = parseFloat(v);
        return /kv/i.test(v) ? n * 1000 : n;
      };
      return val(a) - val(b);
    });
  }, [cards]);

  const terms = useMemo(
    () => query.trim().toLowerCase().split(/\s+/).filter(Boolean),
    [query]
  );

  const visible = useMemo(
    () =>
      cards.filter(
        (c) =>
          terms.every((t) => c.lower.includes(t)) &&
          (!standard || c.standard === standard) &&
          (!voltage || c.voltage === voltage)
      ),
    [cards, terms, standard, voltage]
  );

  // Apply to the real DOM: hide non-matches, then reorder if a sort is active.
  useEffect(() => {
    if (!cards.length) return;
    const shown = new Set(visible.map((c) => c.wrapper));
    for (const c of cards) c.wrapper.style.display = shown.has(c.wrapper) ? '' : 'none';

    const grid = gridRef.current;
    if (!grid) return;

    if (sort === 'default') {
      for (const el of originalOrder.current) grid.appendChild(el);
      return;
    }
    const sorted = [...visible].sort((a, b) =>
      sort === 'az' ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title)
    );
    for (const c of sorted) grid.appendChild(c.wrapper);
  }, [cards, visible, sort]);

  // Never leave the page filtered if this unmounts.
  useEffect(() => () => { for (const c of cards) c.wrapper.style.display = ''; }, [cards]);

  if (cards.length < MIN_CARDS || !host) return null;

  const active = Boolean(query || standard || voltage || sort !== 'default');

  return createPortal(
    <div className="category-filter">
      <div className="category-filter-row">
        <input
          type="search"
          className="category-filter-search"
          placeholder={`Filter ${cards.length} products…`}
          aria-label="Filter products on this page"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        {standards.length > 1 && (
          <select className="category-filter-select" aria-label="Filter by standard"
            value={standard} onChange={(e) => setStandard(e.target.value)}>
            <option value="">All standards</option>
            {standards.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        )}

        {voltages.length > 1 && (
          <select className="category-filter-select" aria-label="Filter by voltage"
            value={voltage} onChange={(e) => setVoltage(e.target.value)}>
            <option value="">All voltages</option>
            {voltages.map((v) => <option key={v} value={v}>{v}</option>)}
          </select>
        )}

        <select className="category-filter-select" aria-label="Sort products"
          value={sort} onChange={(e) => setSort(e.target.value as typeof sort)}>
          <option value="default">Default order</option>
          <option value="az">Name A–Z</option>
          <option value="za">Name Z–A</option>
        </select>

        {active && (
          <button type="button" className="category-filter-clear"
            onClick={() => { setQuery(''); setStandard(''); setVoltage(''); setSort('default'); }}>
            Clear
          </button>
        )}
      </div>

      <div className="category-filter-count" aria-live="polite">
        {visible.length === cards.length
          ? `Showing all ${cards.length} products`
          : `Showing ${visible.length} of ${cards.length} products`}
        {visible.length === 0 && ' — try a shorter term or clear the filters'}
      </div>
    </div>,
    host
  );
}
