import { LRUCache } from 'lru-cache';

interface RateLimiterOptions {
  windowMs: number;
  max: number;
}

export class RateLimiter {
  private cache: LRUCache<string, number[]>;
  private max: number;
  private windowMs: number;

  constructor(options: RateLimiterOptions) {
    this.max = options.max;
    this.windowMs = options.windowMs;
    this.cache = new LRUCache<string, number[]>({
      max: 5000, // Limit cache to 5000 unique IP keys
      ttl: options.windowMs, // Evict keys automatically after windowMs of inactivity
    });
  }

  /**
   * Checks if an IP has exceeded the limit in the sliding window.
   * Returns true if rate-limited (blocked), false otherwise.
   */
  limit(ip: string): boolean {
    const now = Date.now();
    let timestamps = this.cache.get(ip) || [];

    // Filter out timestamps outside the sliding window
    timestamps = timestamps.filter(t => now - t < this.windowMs);
    
    if (timestamps.length >= this.max) {
      this.cache.set(ip, timestamps); // Update with clean list and keep in cache
      return true;
    }

    // Add current request timestamp
    timestamps.push(now);
    this.cache.set(ip, timestamps);
    return false;
  }
}

// Separate rate limiters to avoid combined limits interference
export const inquiryRateLimiter = new RateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 5,
});

export const feedbackRateLimiter = new RateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 5,
});

export const loginRateLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Max 10 attempts
});
