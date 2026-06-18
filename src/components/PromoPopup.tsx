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

export default function PromoPopup() {
  const [mounted, setMounted] = useState(false);
  const [config, setConfig] = useState<PromoConfig | null>(null);
  const [visible, setVisible] = useState(false);
  const [dismissUntilToday, setDismissUntilToday] = useState(false);

  useEffect(() => {
    setMounted(true);

    // 1. Check if dismissed for 24 hours
    const now = Date.now();
    const dismissedUntil = localStorage.getItem('dismissed_promo_until');
    if (dismissedUntil && now < parseInt(dismissedUntil, 10)) {
      return;
    }

    // 2. Fetch the promotion config from public API
    fetch('/api/public/cms/homepage/promo_popup')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data?.content) {
          const content: PromoConfig = data.data.content;
          if (content.showPopup) {
            setConfig(content);
            // 3. Trigger delay timer
            const delayMs = (content.displayDelay ?? 2) * 1000;
            const timer = setTimeout(() => {
              setVisible(true);
            }, delayMs);
            return () => clearTimeout(timer);
          }
        }
      })
      .catch((err) => console.error('[PromoPopup Fetch Error]', err));
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
          background: rgba(15, 23, 42, 0.6);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          padding: 20px;
          animation: promoFadeIn 0.3s ease-out forwards;
        }
        .promo-modal-card {
          position: relative;
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.4);
          box-shadow: 0 30px 60px -15px rgba(0, 0, 0, 0.3);
          border-radius: 24px;
          overflow: hidden;
          width: 100%;
          font-family: 'Inter', system-ui, sans-serif;
          animation: promoScaleUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          color: #1e293b;
        }
        .promo-close-btn {
          position: absolute;
          top: 16px;
          right: 16px;
          z-index: 10;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: rgba(15, 23, 42, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 16px;
          font-weight: bold;
          color: #1e293b;
          transition: all 0.2s;
        }
        .promo-close-btn:hover {
          background: rgba(15, 23, 42, 0.15);
          transform: scale(1.1);
        }
        .promo-cta-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 12px 28px;
          border-radius: 12px;
          font-weight: 700;
          font-size: 14.5px;
          text-decoration: none;
          color: #fff !important;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 8px 20px -6px rgba(0, 0, 0, 0.2);
          cursor: pointer;
          border: none;
        }
        .promo-cta-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 24px -6px rgba(0, 0, 0, 0.3);
        }
        .promo-dismiss-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          color: #64748b;
          cursor: pointer;
          user-select: none;
          transition: color 0.2s;
        }
        .promo-dismiss-label:hover {
          color: #334155;
        }
      `}} />

      <div className="promo-overlay">
        {/* Template Layout 1: Standard (Vertical) */}
        {config.template === 'standard' && (
          <div className="promo-modal-card" style={{ maxWidth: '480px' }}>
            <button className="promo-close-btn" onClick={handleClose}>✕</button>
            {config.imageUrl && (
              <div style={{
                width: '100%',
                height: '220px',
                backgroundImage: `url('${config.imageUrl}')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                borderBottom: `4px solid ${themeHex}`
              }} />
            )}
            <div style={{ padding: '32px 28px 24px 28px', textAlign: 'center' }}>
              <div style={{
                display: 'inline-flex',
                fontSize: '28px',
                marginBottom: '14px',
                background: `${themeHex}1A`,
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                {getPopupTypeEmoji()}
              </div>
              <h4 style={{ margin: '0 0 6px 0', fontSize: '22px', fontWeight: 850, color: '#0f172a' }}>{config.title}</h4>
              {config.subtitle && (
                <p style={{ margin: '0 0 16px 0', fontSize: '14px', fontWeight: 700, color: themeHex }}>{config.subtitle}</p>
              )}
              {config.description && (
                <p style={{ margin: '0 0 24px 0', fontSize: '13.5px', color: '#475569', lineHeight: '1.6' }}>{config.description}</p>
              )}
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
                <a
                  href={config.linkUrl || '#'}
                  onClick={!config.linkUrl ? handleClose : undefined}
                  className="promo-cta-btn"
                  style={{ background: themeHex }}
                >
                  {config.buttonText || 'View Details'}
                </a>
                
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
                <a
                  href={config.linkUrl || '#'}
                  onClick={!config.linkUrl ? handleClose : undefined}
                  className="promo-cta-btn"
                  style={{ background: themeHex }}
                >
                  {config.buttonText || 'View Details'}
                </a>
                
                <label className="promo-dismiss-label">
                  <input
                    type="checkbox"
                    checked={dismissUntilToday}
                    onChange={(e) => setDismissUntilToday(e.target.checked)}
                    style={{ accentColor: themeHex }}
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
                  href={config.linkUrl || '#'}
                  onClick={!config.linkUrl ? handleClose : undefined}
                  className="promo-cta-btn"
                  style={{ background: '#fff', color: '#0f172a !important', fontWeight: 800 }}
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
                <a
                  href={config.linkUrl || '#'}
                  onClick={!config.linkUrl ? handleClose : undefined}
                  className="promo-cta-btn"
                  style={{ background: themeHex }}
                >
                  {config.buttonText || 'OK'}
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
              <div dangerouslySetInnerHTML={{ __html: config.customHtml }} />
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
