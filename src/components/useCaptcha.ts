'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Shared client hook for the server-backed captcha (GET /api/captcha → { svg, token }).
 * Handles fetching, in-flight abort, and refresh. The form renders `svg`, collects
 * the user's input, and submits it together with `token` — the server validates via
 * decryptCaptcha (single-use). Used by every public contact/enquiry form so they can
 * never diverge (previously each re-implemented this, and one used an insecure
 * client-only code).
 */
export function useCaptcha() {
  const [svg, setSvg] = useState('');
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const refresh = useCallback(async () => {
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setLoading(true);
    try {
      const res = await fetch('/api/captcha', { signal: ctrl.signal });
      const data = await res.json();
      if (data?.svg) {
        setSvg(data.svg);
        setToken(data.token);
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') console.error('Failed to generate captcha', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    return () => abortRef.current?.abort();
  }, [refresh]);

  return { svg, token, loading, refresh };
}
