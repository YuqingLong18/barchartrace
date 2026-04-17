import { NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth/server';
import { isTeacherSession } from '@/lib/auth/constants';

export async function GET() {
  const session = await getAuthSession();

  if (!session) {
    return NextResponse.json({ authenticated: false });
  }

  return NextResponse.json({
    authenticated: isTeacherSession(session),
    user: {
      name: session.name,
      username: session.username,
      email: session.email ?? null,
      role: session.role ?? null,
      authMethod: session.authMethod ?? null,
    },
  });
}
