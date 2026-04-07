import { registerUser, createToken, COOKIE_NAME } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json();

    if (!email || !password || !name) {
      return Response.json({ error: 'Email, password, and name are required' }, { status: 400 });
    }

    if (password.length < 6) {
      return Response.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    const user = await registerUser(email, password, name);
    const token = await createToken(user.id);

    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/',
    });

    return Response.json({ success: true, user: { id: user.id, name: user.name, email: user.email } });
  } catch (err: any) {
    if (err.message === 'Email already registered') {
      return Response.json({ error: 'Email already registered' }, { status: 409 });
    }
    return Response.json({ error: 'Registration failed' }, { status: 500 });
  }
}
