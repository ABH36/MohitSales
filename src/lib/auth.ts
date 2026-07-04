import { jwtVerify, SignJWT } from 'jose';

// No insecure hardcoded fallback: JWT_SECRET must be provided via the
// environment (.env) in every environment. Fail fast if it is missing.
if (!process.env.JWT_SECRET) {
  throw new Error('FATAL: JWT_SECRET environment variable is not defined. Set it in your .env.');
}

export const JWT_SECRET = process.env.JWT_SECRET;
export const COOKIE_NAME = 'admin_token';
const encodedSecret = new TextEncoder().encode(JWT_SECRET);

export interface TokenPayload {
  userId: string;
  role?: string;
  [key: string]: unknown;
}

export async function createToken(payload: TokenPayload, expiresIn: string = '1d') {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(encodedSecret);
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, encodedSecret);
    return payload;
  } catch (error) {
    return null;
  }
}
