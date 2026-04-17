import { NextResponse } from 'next/server';
import { buildLogoutUrl, normalizeRedirectPath } from '@/lib/auth/constants';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const redirect = normalizeRedirectPath(
    searchParams.get('redirect') || '/login'
  );

  return NextResponse.redirect(buildLogoutUrl(redirect));
}
