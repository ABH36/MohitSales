import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

import * as cheerio from 'cheerio';

export function sanitizeHtml(html: string): string {
  if (!html) return '';
  
  try {
    const $ = cheerio.load(html, null, false);
    
    // 1. Remove all forbidden tags
    const forbiddenTags = ['script', 'iframe', 'object', 'embed', 'base', 'link', 'meta', 'svg', 'math', 'style'];
    $(forbiddenTags.join(',')).remove();
    
    // 2. Clean attributes on all remaining elements
    $('*').each((_, el) => {
      const attribs = (el as any).attribs;
      if (!attribs) return;
      
      const keys = Object.keys(attribs);
      for (const key of keys) {
        // Strip event handlers (e.g. onclick, onload, etc.)
        if (key.toLowerCase().startsWith('on')) {
          $(el).removeAttr(key);
          continue;
        }
        
        // Strip javascript: or data: URIs from href, src, action, formaction
        if (['href', 'src', 'action', 'formaction'].includes(key.toLowerCase())) {
          const val = attribs[key] || '';
          // Clean whitespace and control characters from the value
          const cleanVal = val.replace(/[\s\x00-\x1F\x7F-\x9F]/g, '').toLowerCase();
          
          if (cleanVal.includes('javascript:') || cleanVal.includes('data:')) {
            if (key.toLowerCase() === 'href') {
              $(el).attr(key, '#');
            } else {
              $(el).removeAttr(key);
            }
          }
        }
      }
    });
    
    return $.html();
  } catch (error) {
    console.error('Error sanitizing HTML:', error);
    // Safe fallback: strip tags using basic regex if cheerio fails
    return html.replace(/<[^>]*>/g, '');
  }
}

export function escapeHtml(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}
