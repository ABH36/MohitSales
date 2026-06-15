import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function sanitizeHtml(html: string): string {
  if (!html) return '';
  return html
    // Remove script tags and content
    .replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, '')
    // Remove iframe tags
    .replace(/<iframe[^>]*>([\s\S]*?)<\/iframe>/gi, '')
    // Remove object, embed, and base tags
    .replace(/<object[^>]*>([\s\S]*?)<\/object>/gi, '')
    .replace(/<embed[^>]*>([\s\S]*?)<\/embed>/gi, '')
    .replace(/<base[^>]*>/gi, '')
    // Remove inline event handlers (onload, onerror, etc.) using word boundaries and allowing newlines
    .replace(/\bon[a-zA-Z]+\s*=\s*(["'])([\s\S]*?)\1/gi, '')
    .replace(/\bon[a-zA-Z]+\s*=\s*([^>\s]+)/gi, '')
    // Remove javascript: pseudo-protocol in links (allowing leading spaces and newlines)
    .replace(/href\s*=\s*(["'])\s*javascript:([\s\S]*?)\1/gi, 'href="#"')
    .replace(/href\s*=\s*javascript:([^>\s]+)/gi, 'href="#"')
    // Remove data: URI in links (preventing data-based HTML/script execution)
    .replace(/href\s*=\s*(["'])\s*data:([\s\S]*?)\1/gi, 'href="#"')
    .replace(/href\s*=\s*data:([^>\s]+)/gi, 'href="#"');
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
