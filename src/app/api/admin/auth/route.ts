import { NextRequest, NextResponse } from 'next/server';
import { createSessionToken, verifySessionToken, COOKIE_NAME, MAX_AGE_SECONDS } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();
    const expectedPassword = process.env.ADMIN_PASSWORD || 'admin249';

    if (!password || password !== expectedPassword) {
      return NextResponse.json({ error: 'Incorrect administrator password.' }, { status: 401 });
    }

    const token = createSessionToken();
    const response = NextResponse.json({ success: true, message: 'Authenticated successfully.' });

    response.cookies.set({
      name: COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: MAX_AGE_SECONDS,
    });

    return response;
  } catch (error: any) {
    return NextResponse.json({ error: 'Authentication failed.' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  const isValid = verifySessionToken(token);

  if (!isValid) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({ authenticated: true });
}

export async function DELETE() {
  const response = NextResponse.json({ success: true, message: 'Logged out.' });
  response.cookies.delete(COOKIE_NAME);
  return response;
}
