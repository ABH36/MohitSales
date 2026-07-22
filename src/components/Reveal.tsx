'use client';

import React, { useEffect, useRef } from 'react';

/**
 * Fades a block up as it scrolls into view.
 *
 * The hiding is applied by JavaScript, never by the stylesheet: the markup
 * renders visible and this component adds `reveal-armed` on mount, which is the
 * class the opacity rule hangs off. So if the script fails or is blocked the
 * page reads exactly as it would have — the one failure mode a scroll animation
 * must not have is leaving the content invisible.
 *
 * Anything already on screen when this mounts is marked visible without ever
 * being armed, so above-the-fold content cannot flash out and back in.
 */
interface Props {
  children: React.ReactNode;
  /** Stagger, in seconds, for siblings revealed together. */
  delay?: number;
  className?: string;
}

export default function Reveal({ children, delay = 0, className = '' }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Users who asked for less motion get the content, not the animation.
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    // Without an observer nothing would ever un-hide this, so never hide it.
    if (typeof IntersectionObserver === 'undefined') return;

    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      el.classList.add('reveal-armed', 'is-visible');
      return;
    }

    el.classList.add('reveal-armed');
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target); // reveal once, not on every pass
        }
      },
      { rootMargin: '0px 0px -60px 0px', threshold: 0.05 }
    );
    io.observe(el);

    /**
     * Backstop: anything still hidden after a few seconds is shown regardless.
     *
     * A scroll-triggered reveal only fires for something that scrolls. Anything
     * that renders the page without scrolling it — a crawler, a print, a
     * full-page screenshot — would otherwise keep this content at opacity 0 and
     * treat it as hidden. Nothing on the page is worth that risk, and a reader
     * who never scrolls this far never sees the difference.
     */
    const failsafe = window.setTimeout(() => el.classList.add('is-visible'), 3000);

    return () => {
      io.disconnect();
      window.clearTimeout(failsafe);
    };
  }, []);

  return (
    <div
      ref={ref}
      className={`reveal ${className}`.trim()}
      style={delay ? { transitionDelay: `${delay}s` } : undefined}
    >
      {children}
    </div>
  );
}
