import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return Response.json({ error: 'Not authenticated' }, { status: 401 });
  }

  return Response.json({
    id: user.id,
    email: user.email,
    name: user.name,
    displayName: user.displayName,
    currentLevel: user.currentLevel,
    onboardingDone: user.onboardingDone,
  });
}
