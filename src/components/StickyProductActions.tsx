'use client';

import React, { useEffect, useRef, useState } from 'react';

/**
 * Bottom action bar for product pages on small screens.
 *
 * The enquiry and datasheet buttons sit below the description and feature list,
 * which on a phone is around two and a half screens down — a buyer who wants a
 * datasheet has to scroll past everything to find it. This repeats those two
 * actions in a fixed bar, and hides itself whenever the real buttons are in
 * view so the actions are never duplicated on screen.
 *
 * Desktop is left alone: the page is short enough there that both buttons are
 * reachable without scrolling far, and a fixed bar would only cover content.
 *
 * The enquiry link deliberately points at the same /contact-us?product= URL as
 * the in-page button, so ProductPageWrapper intercepts it into the enquiry
 * modal and the two entry points behave identically.
 */

interface Props {
  productTitle: string;
  datasheetLink?: string | null;
}

export default function StickyProductActions({ productTitle, datasheetLink }: Props) {
  const [visible, setVisible] = useState(false);
  const barRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const target = document.querySelector('.enquiry-btn-container');
    if (!target) return;

    // Show only once the real buttons have scrolled out of view.
    const io = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { rootMargin: '0px 0px -80px 0px' }
    );
    io.observe(target);
    return () => io.disconnect();
  }, []);

  // The bar floats over the page end, so pad the body by its height to keep the
  // footer reachable rather than permanently half-covered.
  useEffect(() => {
    const h = visible ? barRef.current?.offsetHeight ?? 0 : 0;
    document.body.style.paddingBottom = h ? `${h}px` : '';
    return () => { document.body.style.paddingBottom = ''; };
  }, [visible]);

  return (
    <div
      ref={barRef}
      className={`sticky-product-actions${visible ? ' is-visible' : ''}`}
      // Hidden from assistive tech while off-screen: the same two actions are
      // already in the document and announcing them twice is just noise.
      aria-hidden={!visible}
    >
      <a
        className="spa-btn spa-enquiry"
        href={`/contact-us?product=${encodeURIComponent(productTitle)}`}
        tabIndex={visible ? 0 : -1}
      >
        Send Enquiry
      </a>
      {datasheetLink && (
        <a
          className="spa-btn spa-download"
          href={datasheetLink}
          target="_blank"
          rel="noopener noreferrer"
          tabIndex={visible ? 0 : -1}
        >
          Datasheet
        </a>
      )}
    </div>
  );
}
