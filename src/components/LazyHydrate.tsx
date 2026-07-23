'use client';

import React, { useEffect, useRef, useState } from 'react';

/**
 * Defers React hydration of a below-the-fold island until it nears the
 * viewport, while keeping its server-rendered HTML on screen the whole time.
 *
 * How: on the client's first (hydration) pass this renders the wrapper with
 * `dangerouslySetInnerHTML` — React then adopts the existing server DOM as-is
 * and never walks into the subtree, so none of the island's hydration work
 * (component render, reconciliation, effect setup) happens at load. Once the
 * wrapper scrolls within `rootMargin`, state flips and the children mount for
 * real — the markup they produce is identical to the server HTML, so the swap
 * is invisible; only then do event handlers and effects attach.
 *
 * Trade-offs, accepted deliberately:
 * - Interactive bits inside (tabs, sliders) respond only after hydration; the
 *   generous default margin hydrates them well before a reader reaches them.
 * - Plain links inside still work pre-hydration (they are real <a> tags).
 * - SEO is unaffected — crawlers see the full server HTML.
 *
 * Do NOT wrap: above-the-fold content, portals/popups that must arm on load,
 * or anything whose first paint depends on client JS.
 */
export default function LazyHydrate({
  children,
  rootMargin = '700px 0px',
}: {
  children: React.ReactNode;
  rootMargin?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (hydrated) return;
    const el = ref.current;
    if (!el) return;

    // No observer support → hydrate immediately rather than never.
    if (typeof IntersectionObserver === 'undefined') {
      setHydrated(true);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setHydrated(true);
          io.disconnect();
        }
      },
      { rootMargin }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [hydrated, rootMargin]);

  // Server render: real children, so the HTML ships complete.
  // Client pre-hydration: adopt that HTML untouched (see doc comment).
  if (typeof window !== 'undefined' && !hydrated) {
    return (
      <div
        ref={ref}
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: '' }}
      />
    );
  }

  return <div ref={ref}>{children}</div>;
}
