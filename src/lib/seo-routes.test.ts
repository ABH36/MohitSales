import { describe, it, expect } from 'vitest';
import { isRedirectedPath } from './seo-routes';

describe('isRedirectedPath', () => {
  it('flags the polycab/cables-by-* subtree (all three sections)', () => {
    expect(isRedirectedPath('polycab/cables-by-application/cement-industry/x')).toBe(true);
    expect(isRedirectedPath('polycab/cables-by-type/lv-power-cable')).toBe(true);
    expect(isRedirectedPath('polycab/cables-by-standards/indian-standards')).toBe(true);
  });

  it('flags the bare polycab/cables-by-* section pages', () => {
    expect(isRedirectedPath('polycab/cables-by-application')).toBe(true);
    expect(isRedirectedPath('polycab/cables-by-type')).toBe(true);
  });

  it('normalises leading slashes and full URLs', () => {
    expect(isRedirectedPath('/polycab/cables-by-standards/x')).toBe(true);
    expect(isRedirectedPath('https://mohitscpl.com/polycab/cables-by-application')).toBe(true);
  });

  it('flags legacy homepage aliases', () => {
    expect(isRedirectedPath('index')).toBe(true);
    expect(isRedirectedPath('/index-old')).toBe(true);
  });

  it('does NOT flag the canonical industries/* pages', () => {
    expect(isRedirectedPath('industries/cables-by-application/building-infrastructure')).toBe(false);
  });

  it('does NOT flag non-redirected polycab pages', () => {
    expect(isRedirectedPath('polycab/fans/table-fans')).toBe(false);
    expect(isRedirectedPath('polycab/home-appliances/coolers')).toBe(false);
  });

  it('does NOT flag unrelated paths', () => {
    expect(isRedirectedPath('fans')).toBe(false);
    expect(isRedirectedPath('')).toBe(false);
    expect(isRedirectedPath('cables-by-application')).toBe(false); // not under polycab/
  });
});
