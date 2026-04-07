export const dynamic = 'force-dynamic';
import { verifyCredentials, createToken, COOKIE_NAME } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return Response.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const user = await verifyCredentials(email, password);
    if (!user) {
      return Response.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const token = await createToken(user.id);

    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60,
      path: '/',
    });

    return Response.json({
      success: true,
      user: { id: user.id, name: user.name, email: user.email, onboardingDone: user.onboardingDone },
    });
  } catch {
    return Response.json({ error: 'Login failed' }, { status: 500 });
  }
}
