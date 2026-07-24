'use client';

import { useState, useEffect } from 'react';

interface PromoConfig {
  showPopup: boolean;
  template: 'standard' | 'split' | 'banner' | 'text_only' | 'custom_html';
  popupType: 'festival' | 'discount' | 'new_product' | 'custom';
  title: string;
  subtitle: string;
  description: string;
  imageUrl: string;
  linkUrl: string;
  buttonText: string;
  displayDelay: number;
  themeColor: string;
  customHtml?: string;
}

function sanitizeClientHtml(html: string): string {
  if (typeof window === 'undefined') return '';
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // 1. Remove dangerous tags
    const dangerousTags = ['script', 'iframe', 'object', 'embed', 'link', 'meta', 'base', 'style', 'svg', 'math'];
    dangerousTags.forEach(tag => {
      const elements = doc.getElementsByTagName(tag);
      while (elements.length > 0) {
        elements[0].parentNode?.removeChild(elements[0]);
      }
    });

    // 2. Remove all attributes that start with 'on' or contain javascript:/data: URLs
    const allElements = doc.getElementsByTagName('*');
    for (let i = 0; i < allElements.length; i++) {
      const el = allElements[i];
      const attrs = Array.from(el.attributes);
      attrs.forEach(attr => {
        const name = attr.name.toLowerCase();
        if (name.startsWith('on')) {
          el.removeAttribute(attr.name);
        } else if (['href', 'src', 'action', 'formaction'].includes(name)) {
          const val = attr.value.replace(/[\s\x00-\x1F\x7F-\x9F]/g, '').toLowerCase();
          if (val.includes('javascript:') || val.includes('data:')) {
            if (name === 'href') {
              el.setAttribute(attr.name, '#');
            } else {
              el.removeAttribute(attr.name);
            }
          }
        }
      });
    }

    return doc.body.innerHTML;
  } catch (error) {
    console.error('Client sanitization error:', error);
    return '';
  }
}

export default function PromoPopup() {
  const [mounted, setMounted] = useState(false);
  const [config, setConfig] = useState<PromoConfig | null>(null);
  const [visible, setVisible] = useState(false);
  const [dismissUntilToday, setDismissUntilToday] = useState(false);

  useEffect(() => {
    setMounted(true);
    let active = true;
    let timerId: NodeJS.Timeout | null = null;

    // 1. Check if dismissed for 24 hours
    const now = Date.now();
    const dismissedUntil = typeof window !== 'undefined' ? localStorage.getItem('dismissed_promo_until') : null;
    if (dismissedUntil && now < parseInt(dismissedUntil, 10)) {
      return;
    }

    // 2. Fetch the promotion config from public API
    fetch('/api/public/cms/homepage/promo_popup')
      .then((res) => res.json())
      .then((data) => {
        if (!active) return;
        if (data.success && data.data?.content) {
          const content: PromoConfig = data.data.content;
          if (content.showPopup) {
            setConfig(content);
            // 3. Trigger delay timer
            const delayMs = (content.displayDelay ?? 2) * 1000;
            timerId = setTimeout(() => {
              if (active) {
                setVisible(true);
              }
            }, delayMs);
          }
        }
      })
      .catch((err) => console.error('[PromoPopup Fetch Error]', err));

    return () => {
      active = false;
      if (timerId) {
        clearTimeout(timerId);
      }
    };
  }, []);

  if (!mounted || !config || !visible) return null;

  const handleClose = () => {
    if (dismissUntilToday) {
      // Set dismissal for 24 hours
      const tomorrow = Date.now() + 24 * 60 * 60 * 1000;
      localStorage.setItem('dismissed_promo_until', tomorrow.toString());
    }
    setVisible(false);
  };

  // The CTA must always lead somewhere. When no link is configured, an
  // "Inquire Now" button belongs on the contact page — the previous fallback
  // was href="#", which just jumped to the top and dismissed. Clicking always
  // closes the popup so it doesn't linger over the destination.
  const ctaHref = config.linkUrl || '/contact-us';
  const handleCtaClick = () => setVisible(false);

  const getPopupTypeEmoji = () => {
    switch (config.popupType) {
      case 'festival': return '🎆';
      case 'discount': return '🏷️';
      case 'new_product': return '🆕';
      default: return '📢';
    }
  };

  const themeHex = config.themeColor || '#f97316';

  // CSS and Render depending on layout templates
  return (
    <>
      {/* Dynamic Keyframe Animation Embed */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes promoFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes promoScaleUp {
          from { opacity: 0; transform: scale(0.9) translateY(20px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .promo-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 99999;
          display: flex;
          align-items: center;
          justify-content: center;
          /* Navy-tinted scrim, matching the site's brand backdrop. */
          background: rgba(18, 26, 47, 0.55);
          backdrop-filter: blur(7px);
          -webkit-backdrop-filter: blur(7px);
          padding: 20px;
          animation: promoFadeIn 0.3s ease-out forwards;
        }
        .promo-modal-card {
          position: relative;
          background: #ffffff;
          border: 1px solid #e6ebf4;
          /* Layered brand shadows — tight ambient + soft navy key. */
          box-shadow: 0 4px 14px rgba(30, 46, 94, 0.08), 0 30px 70px -20px rgba(30, 46, 94, 0.35);
          border-radius: 22px;
          overflow: hidden;
          width: 100%;
          font-family: 'Outfit', system-ui, sans-serif;
          animation: promoScaleUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          color: #1f2b46;
        }
        .promo-close-btn {
          position: absolute;
          top: 16px;
          right: 16px;
          z-index: 10;
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: #ffffff;
          border: 1px solid #eef1f6;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 16px;
          color: #4a5468;
          box-shadow: 0 2px 6px rgba(30, 46, 94, 0.08), 0 8px 20px rgba(30, 46, 94, 0.1);
          transition: color 0.2s ease, transform 0.25s ease, box-shadow 0.2s ease;
        }
        .promo-close-btn:hover {
          color: var(--brand-red, #c1272d);
          transform: rotate(90deg);
          box-shadow: 0 4px 10px rgba(30, 46, 94, 0.12), 0 12px 26px rgba(30, 46, 94, 0.14);
        }
        .promo-cta-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          justify-content: center;
          padding: 13px 30px;
          border-radius: 10px;
          font-family: 'Outfit', system-ui, sans-serif;
          font-weight: 700;
          font-size: 15px;
          letter-spacing: 0.2px;
          text-decoration: none;
          color: #fff !important;
          /* Site CTA gradient (red-light → brand red). */
          background: linear-gradient(135deg, #e8434a 0%, #c1272d 100%);
          transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.3s ease;
          box-shadow: 0 6px 16px rgba(193, 39, 45, 0.28);
          cursor: pointer;
          border: none;
        }
        .promo-cta-btn svg { transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1); }
        .promo-cta-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 24px rgba(193, 39, 45, 0.34);
        }
        .promo-cta-btn:hover svg { transform: translateX(4px); }
        .promo-dismiss-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12.5px;
          font-weight: 500;
          color: #61708f;
          cursor: pointer;
          user-select: none;
          transition: color 0.2s;
        }
        .promo-dismiss-label:hover {
          color: var(--brand-navy, #1e2e5e);
        }
      `}} />

      <div className="promo-overlay">
        {/* Template Layout 1: Standard (Vertical) */}
        {config.template === 'standard' && (
          <div className="promo-modal-card" style={{ maxWidth: '460px' }}>
            <button className="promo-close-btn" onClick={handleClose} aria-label="Close">✕</button>
            {config.imageUrl && (
              <div style={{
                width: '100%',
                height: '210px',
                backgroundImage: `url('${config.imageUrl}')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                borderBottom: '4px solid #c1272d'
              }} />
            )}
            <div style={{ padding: '38px 32px 28px', textAlign: 'center' }}>
              <div style={{
                display: 'inline-flex',
                fontSize: '30px',
                marginBottom: '18px',
                background: 'radial-gradient(circle at 50% 40%, #fde5e8 0%, #fdeef0 70%)',
                width: '66px',
                height: '66px',
                borderRadius: '50%',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 6px 16px rgba(193, 39, 45, 0.14)',
              }}>
                {getPopupTypeEmoji()}
              </div>
              <h4 style={{ margin: '0 0 10px 0', fontSize: '26px', fontWeight: 800, color: '#1e2e5e', lineHeight: 1.2 }}>{config.title}</h4>
              {config.subtitle && (
                <p style={{
                  margin: '0 0 16px 0', fontSize: '12.5px', fontWeight: 700, color: '#c1272d',
                  textTransform: 'uppercase', letterSpacing: '1.4px',
                }}>{config.subtitle}</p>
              )}
              {config.description && (
                <p style={{ margin: '0 auto 26px', maxWidth: '340px', fontSize: '14.5px', color: '#61708f', lineHeight: '1.65' }}>{config.description}</p>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', alignItems: 'center' }}>
                <a href={ctaHref} onClick={handleCtaClick} className="promo-cta-btn">
                  {config.buttonText || 'Inquire Now'}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                  </svg>
                </a>

                <label className="promo-dismiss-label">
                  <input
                    type="checkbox"
                    checked={dismissUntilToday}
                    onChange={(e) => setDismissUntilToday(e.target.checked)}
                    style={{ accentColor: '#c1272d' }}
                  />
                  Don't show this again today
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Template Layout 2: Split (Horizontal) */}
        {config.template === 'split' && (
          <div className="promo-modal-card" style={{ maxWidth: '680px', display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>
            <button className="promo-close-btn" onClick={handleClose}>✕</button>
            {config.imageUrl ? (
              <div style={{
                flex: '1 1 300px',
                minHeight: '320px',
                backgroundImage: `url('${config.imageUrl}')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                position: 'relative'
              }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: `linear-gradient(90deg, rgba(0,0,0,0) 50%, rgba(255,255,255,0.05) 100%)` }} />
              </div>
            ) : null}
            <div style={{ flex: '1 1 320px', padding: '40px 32px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1.5px', color: themeHex, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                {getPopupTypeEmoji()} Special Alert
              </span>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '24px', fontWeight: 850, color: '#0f172a' }}>{config.title}</h4>
              {config.subtitle && (
                <p style={{ margin: '0 0 16px 0', fontSize: '14px', fontWeight: 700, color: themeHex }}>{config.subtitle}</p>
              )}
              {config.description && (
                <p style={{ margin: '0 0 28px 0', fontSize: '13.5px', color: '#475569', lineHeight: '1.6' }}>{config.description}</p>
              )}
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
                <a href={ctaHref} onClick={handleCtaClick} className="promo-cta-btn">
                  {config.buttonText || 'Inquire Now'}
                </a>

                <label className="promo-dismiss-label">
                  <input
                    type="checkbox"
                    checked={dismissUntilToday}
                    onChange={(e) => setDismissUntilToday(e.target.checked)}
                    style={{ accentColor: '#c1272d' }}
                  />
                  Don't show again today
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Template Layout 3: Banner Background */}
        {config.template === 'banner' && (
          <div className="promo-modal-card" style={{
            maxWidth: '560px',
            minHeight: '380px',
            backgroundImage: config.imageUrl ? `linear-gradient(180deg, rgba(15, 23, 42, 0.5) 0%, rgba(15, 23, 42, 0.9) 100%), url('${config.imageUrl}')` : `linear-gradient(135deg, ${themeHex}dd, #0f172a 100%)`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            padding: '40px 36px',
            boxSizing: 'border-box'
          }}>
            <button className="promo-close-btn" onClick={handleClose} style={{ background: 'rgba(255, 255, 255, 0.2)', color: '#fff' }}>✕</button>
            <div style={{ color: '#fff' }}>
              <div style={{ display: 'inline-flex', fontSize: '22px', marginBottom: '12px', background: 'rgba(255,255,255,0.15)', padding: '6px 14px', borderRadius: '20px', fontWeight: 'bold' }}>
                {getPopupTypeEmoji()} {config.subtitle || 'Promo'}
              </div>
              <h4 style={{ margin: '0 0 10px 0', fontSize: '26px', fontWeight: 850 }}>{config.title}</h4>
              {config.description && (
                <p style={{ margin: '0 0 28px 0', fontSize: '14px', color: 'rgba(255,255,255,0.85)', lineHeight: '1.6' }}>{config.description}</p>
              )}
              
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap', borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: '20px' }}>
                <a
                  href={ctaHref}
                  onClick={handleCtaClick}
                  className="promo-cta-btn"
                  style={{ background: '#fff', color: '#1e2e5e', fontWeight: 800, boxShadow: '0 6px 16px rgba(0,0,0,0.25)' }}
                >
                  {config.buttonText || 'Discover More'}
                </a>
                
                <label className="promo-dismiss-label" style={{ color: 'rgba(255,255,255,0.7)' }}>
                  <input
                    type="checkbox"
                    checked={dismissUntilToday}
                    onChange={(e) => setDismissUntilToday(e.target.checked)}
                    style={{ accentColor: '#fff' }}
                  />
                  Dismiss for 24 hours
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Template Layout 4: Text-Only / Minimalist */}
        {config.template === 'text_only' && (
          <div className="promo-modal-card" style={{ maxWidth: '440px', borderLeft: `8px solid ${themeHex}` }}>
            <button className="promo-close-btn" onClick={handleClose}>✕</button>
            <div style={{ padding: '36px 32px' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', color: themeHex, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                {getPopupTypeEmoji()} Announcement
              </span>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '20px', fontWeight: 800, color: '#0f172a' }}>{config.title}</h4>
              {config.subtitle && (
                <p style={{ margin: '0 0 14px 0', fontSize: '13px', fontWeight: 700, color: '#64748b' }}>{config.subtitle}</p>
              )}
              {config.description && (
                <p style={{ margin: '0 0 24px 0', fontSize: '13.5px', color: '#475569', lineHeight: '1.6' }}>{config.description}</p>
              )}
              
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap', borderTop: '1px solid #e2e8f0', paddingTop: '18px' }}>
                <a href={ctaHref} onClick={handleCtaClick} className="promo-cta-btn">
                  {config.buttonText || 'Inquire Now'}
                </a>
                
                <label className="promo-dismiss-label">
                  <input
                    type="checkbox"
                    checked={dismissUntilToday}
                    onChange={(e) => setDismissUntilToday(e.target.checked)}
                    style={{ accentColor: themeHex }}
                  />
                  Dismiss
                </label>
              </div>
            </div>
          </div>
        )}
        {/* Template Layout 5: Custom HTML */}
        {config.template === 'custom_html' && (
          <div className="promo-modal-card" style={{ maxWidth: '600px', overflow: 'hidden' }}>
            <button className="promo-close-btn" onClick={handleClose}>✕</button>
            {config.customHtml ? (
              <div dangerouslySetInnerHTML={{ __html: sanitizeClientHtml(config.customHtml) }} />
            ) : (
              <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                No custom HTML code configured.
              </div>
            )}
            
            {/* Standard Dismissal bar for custom layouts */}
            <div style={{
              background: '#f8fafc',
              borderTop: '1px solid #edf2f7',
              padding: '12px 24px',
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'center',
              boxSizing: 'border-box'
            }}>
              <label className="promo-dismiss-label">
                <input
                  type="checkbox"
                  checked={dismissUntilToday}
                  onChange={(e) => setDismissUntilToday(e.target.checked)}
                  style={{ accentColor: themeHex }}
                />
                Don't show this again today
              </label>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
