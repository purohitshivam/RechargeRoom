import crypto from 'crypto';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

const COOKIE_NAME = 'rr_admin_session';
const SESSION_SECRET = process.env.ADMIN_SESSION_SECRET || 'recharge_room_fallback_secret_key_2026';
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

/**
 * Creates an HMAC signed session token
 */
export function createSessionToken(): string {
  const timestamp = Date.now().toString();
  const signature = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(timestamp)
    .digest('hex');
  return `${timestamp}.${signature}`;
}

/**
 * Verifies if an HMAC session token is authentic and within validity window
 */
export function verifySessionToken(token: string | undefined | null): boolean {
  if (!token) return false;
  const parts = token.split('.');
  if (parts.length !== 2) return false;

  const [timestampStr, providedSignature] = parts;
  const timestamp = parseInt(timestampStr, 10);
  if (isNaN(timestamp)) return false;

  // Check expiration (7 days)
  if (Date.now() - timestamp > MAX_AGE_SECONDS * 1000) {
    return false;
  }

  const expectedSignature = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(timestampStr)
    .digest('hex');

  // Constant-time comparison
  try {
    return crypto.timingSafeEqual(
      Buffer.from(providedSignature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  } catch {
    return false;
  }
}

/**
 * Validates request cookie for admin authorization in Next.js Server Components / Route Handlers
 */
export async function isAuthenticatedAdmin(request?: NextRequest): Promise<boolean> {
  if (request) {
    const token = request.cookies.get(COOKIE_NAME)?.value;
    return verifySessionToken(token);
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  return verifySessionToken(token);
}

export { COOKIE_NAME, MAX_AGE_SECONDS };
