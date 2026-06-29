'use client';

import React, { createContext, useContext, useCallback, useRef } from 'react';

interface CacheEntry {
  data: any;
  timestamp: number;
}

interface AdminCacheContextType {
  fetchWithCache: (url: string, maxAge?: number) => Promise<any>;
  invalidate: (url: string) => void;
  prefetch: (url: string) => void;
}

const MAX_CACHE_SIZE = 100;
const cache = new Map<string, CacheEntry>();
const inflight = new Map<string, Promise<any>>();
let invalidationCounter = 0;

function evictOldest() {
  if (cache.size <= MAX_CACHE_SIZE) return;
  const oldest = cache.keys().next().value;
  if (oldest) cache.delete(oldest);
}

export function getCached(url: string, maxAge = 60000): any | null {
  const entry = cache.get(url);
  if (entry && Date.now() - entry.timestamp < maxAge) return entry.data;
  return null;
}

export function prefetchUrl(url: string) {
  if (cache.has(url)) return;
  if (inflight.has(url)) return;
  const promise = fetch(url)
    .then(r => r.json())
    .then(data => {
      cache.set(url, { data, timestamp: Date.now() });
      evictOldest();
      inflight.delete(url);
    })
    .catch(() => { inflight.delete(url); });
  inflight.set(url, promise);
}

const AdminCacheContext = createContext<AdminCacheContextType>({
  fetchWithCache: async () => null,
  invalidate: () => {},
  prefetch: () => {},
});

export function useAdminCache() {
  return useContext(AdminCacheContext);
}

export default function AdminCacheProvider({ children }: { children: React.ReactNode }) {
  const cacheRef = useRef(cache);
  const inflightRef = useRef(inflight);

  const fetchWithCache = useCallback(async (url: string, maxAge = 60000): Promise<any> => {
    const cached = cacheRef.current.get(url);
    if (cached && Date.now() - cached.timestamp < maxAge) {
      return cached.data;
    }

    const existing = inflightRef.current.get(url);
    if (existing) return existing;

    const snapshot = invalidationCounter;
    const promise = fetch(url)
      .then(r => r.json())
      .then(data => {
        if (invalidationCounter === snapshot) {
          cacheRef.current.set(url, { data, timestamp: Date.now() });
          evictOldest();
        }
        inflightRef.current.delete(url);
        return data;
      })
      .catch(err => {
        inflightRef.current.delete(url);
        throw err;
      });

    inflightRef.current.set(url, promise);
    return promise;
  }, []);

  const invalidate = useCallback((url: string) => {
    invalidationCounter++;
    if (url === '*') {
      cacheRef.current.clear();
      inflightRef.current.clear();
    } else {
      for (const key of cacheRef.current.keys()) {
        if (key.startsWith(url)) cacheRef.current.delete(key);
      }
      for (const key of inflightRef.current.keys()) {
        if (key.startsWith(url)) inflightRef.current.delete(key);
      }
    }
  }, []);

  const prefetch = useCallback((url: string) => {
    if (cacheRef.current.has(url)) return;
    if (inflightRef.current.has(url)) return;
    const promise = fetch(url)
      .then(r => r.json())
      .then(data => {
        cacheRef.current.set(url, { data, timestamp: Date.now() });
        inflightRef.current.delete(url);
      })
      .catch(() => { inflightRef.current.delete(url); });
    inflightRef.current.set(url, promise);
  }, []);

  return (
    <AdminCacheContext.Provider value={{ fetchWithCache, invalidate, prefetch }}>
      {children}
    </AdminCacheContext.Provider>
  );
}
