export const dynamic = 'force-dynamic';
import { getSession } from '@/lib/auth';
import { getAI, BUDDY_MODEL } from '@/lib/ai/client';

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { message } = (await request.json()) as { message: string };
  if (!message?.trim()) {
    return Response.json({ error: 'Message is required' }, { status: 400 });
  }

  try {
    const response = await getAI().chat.completions.create({
      model: BUDDY_MODEL,
      messages: [
        {
          role: 'system',
          content:
            'You are Sensei, an enthusiastic anime-style Japanese tutor. Respond in casual Indonesian mixed with Japanese expressions. Keep responses to 1-3 sentences. Be encouraging and fun!',
        },
        { role: 'user', content: message },
      ],
      max_tokens: 256,
    });

    const text =
      response.choices[0]?.message?.content ??
      'Sugoi! Ganbatte ne~ ✨';

    return Response.json({ response: text });
  } catch (error) {
    console.error('Feedback AI error:', error instanceof Error ? error.message : error);
    return Response.json({ response: 'Ganbatte! Keep going! 💪' });
  }
}
