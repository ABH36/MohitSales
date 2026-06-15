import crypto from 'crypto';

const ALGORITHM = 'aes-256-cbc';
const KEY = crypto.createHash('sha256').update(getSecret()).digest();
const HKEY = crypto.createHash('sha256').update('hmac-' + getSecret()).digest();

function getSecret(): string {
  const s = process.env.CAPTCHA_SECRET || process.env.JWT_SECRET;
  if (!s && process.env.NODE_ENV === 'production') {
    throw new Error('CAPTCHA_SECRET environment variable must be set in production');
  }
  return s || 'mohit-industries-jwt-secret-change-in-production-2024';
}

const usedTokens = new Set<string>();

export function markTokenUsed(sig: string) {
  usedTokens.add(sig);
}

export function isTokenUsed(sig: string): boolean {
  return usedTokens.has(sig);
}

// Clear used tokens Set cache every 15 minutes to bound memory usage
if (typeof global !== 'undefined') {
  const globalInterval = (global as any).captchaInterval;
  if (globalInterval) clearInterval(globalInterval);
  (global as any).captchaInterval = setInterval(() => {
    usedTokens.clear();
  }, 15 * 60 * 1000);
}

/**
 * Encrypts a captcha code and a timestamp into a secure signed token string.
 */
export function encryptCaptcha(code: string, timestamp: number): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
  const payload = JSON.stringify({ code, timestamp });
  let enc = cipher.update(payload, 'utf8', 'hex');
  enc += cipher.final('hex');
  const data = iv.toString('hex') + ':' + enc;
  const sig = crypto.createHmac('sha256', HKEY).update(data).digest('hex');
  return data + ':' + sig;
}

/**
 * Decrypts a captcha token after verifying its HMAC integrity.
 * Returns null if validation fails, token is tampered, or sig timing mismatch.
 */
export function decryptCaptcha(token: string): { code: string; timestamp: number } | null {
  try {
    const lastColon = token.lastIndexOf(':');
    if (lastColon === -1) return null;
    
    const data = token.slice(0, lastColon);
    const sig = token.slice(lastColon + 1);
    
    // Strict format validation for the HMAC signature
    if (sig.length !== 64 || !/^[0-9a-f]{64}$/i.test(sig)) {
      return null;
    }
    
    const expected = crypto.createHmac('sha256', HKEY).update(data).digest('hex');
    
    // Constant-time comparison to prevent timing side-channel attacks
    if (!crypto.timingSafeEqual(Buffer.from(sig, 'hex'), Buffer.from(expected, 'hex'))) {
      return null;
    }

    const [ivHex, enc] = data.split(':');
    if (!ivHex || !enc) return null;
    
    // Validate IV format (16 bytes = 32 hex chars) and ciphertext format
    if (ivHex.length !== 32 || !/^[0-9a-f]{32}$/i.test(ivHex)) {
      return null;
    }
    if (!/^[0-9a-f]+$/i.test(enc)) {
      return null;
    }
    
    const decipher = crypto.createDecipheriv(ALGORITHM, KEY, Buffer.from(ivHex, 'hex'));
    let dec = decipher.update(enc, 'hex', 'utf8');
    dec += decipher.final('utf8');
    
    return JSON.parse(dec);
  } catch (error) {
    return null;
  }
}
