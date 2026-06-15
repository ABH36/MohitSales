import { describe, it, expect } from 'vitest';
import { encryptCaptcha, decryptCaptcha } from './captcha';

describe('captcha utility', () => {
  it('should encrypt and decrypt a code successfully', () => {
    const code = '7392';
    const timestamp = Date.now();
    const token = encryptCaptcha(code, timestamp);
    
    expect(token).toContain(':');
    
    const decrypted = decryptCaptcha(token);
    expect(decrypted).not.toBeNull();
    expect(decrypted?.code).toBe(code);
    expect(decrypted?.timestamp).toBe(timestamp);
  });

  it('should return null if token is tampered', () => {
    const code = '1234';
    const timestamp = Date.now();
    const token = encryptCaptcha(code, timestamp);
    
    // Tamper the token
    const tampered = token + 'a';
    expect(decryptCaptcha(tampered)).toBeNull();
    
    const randomString = 'randomnonsense';
    expect(decryptCaptcha(randomString)).toBeNull();
  });
});
