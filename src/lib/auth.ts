import { jwtVerify, SignJWT } from 'jose';

if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
  throw new Error('FATAL: JWT_SECRET environment variable is not defined in production!');
}

export const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-for-dev-only-mohit';
export const COOKIE_NAME = 'admin_token';
const encodedSecret = new TextEncoder().encode(JWT_SECRET);

export async function createToken(payload: any, expiresIn: string = '1d') {
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
