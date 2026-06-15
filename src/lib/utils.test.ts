import { describe, it, expect } from 'vitest';
import { escapeHtml, sanitizeHtml } from './utils';

describe('escapeHtml utility', () => {
  it('should escape HTML characters correctly', () => {
    const raw = '<div class="test">Hello & Welcome!</div>';
    const expected = '&lt;div class=&quot;test&quot;&gt;Hello &amp; Welcome!&lt;/div&gt;';
    expect(escapeHtml(raw)).toBe(expected);
  });

  it('should escape single quotes', () => {
    const raw = "John's Page";
    const expected = 'John&#x27;s Page';
    expect(escapeHtml(raw)).toBe(expected);
  });

  it('should return empty string for empty input', () => {
    expect(escapeHtml('')).toBe('');
  });
});

describe('sanitizeHtml utility', () => {
  it('should remove script tags and their content', () => {
    const dirty = '<div>Hello <script>alert("XSS")</script> World</div>';
    const clean = '<div>Hello  World</div>';
    expect(sanitizeHtml(dirty)).toBe(clean);
  });

  it('should remove inline event handlers', () => {
    const dirty = '<img src="x" onerror="alert(1)" onload = \'console.log(2)\'>';
    const clean = '<img src="x"  >';
    expect(sanitizeHtml(dirty).trim()).toBe(clean);
  });

  it('should remove javascript URIs', () => {
    const dirty = '<a href="javascript:alert(1)">Click me</a>';
    const clean = '<a href="#">Click me</a>';
    expect(sanitizeHtml(dirty)).toBe(clean);
  });

  it('should preserve safe HTML content', () => {
    const safe = '<div class="cables-card"><h4>Polycab Wires</h4><p>Details here</p></div>';
    expect(sanitizeHtml(safe)).toBe(safe);
  });
});
