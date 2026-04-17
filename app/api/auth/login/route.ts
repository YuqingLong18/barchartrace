import { NextRequest, NextResponse } from 'next/server';
import {
  AUTH_SERVICE_BASE_URL,
  buildMicrosoftLoginUrl,
  normalizeRedirectPath,
} from '@/lib/auth/constants';

const LEGACY_AUTH_ENDPOINT = `${AUTH_SERVICE_BASE_URL}/api/auth/login`;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const redirect = normalizeRedirectPath(
    searchParams.get('redirect') || searchParams.get('from')
  );

  return NextResponse.redirect(buildMicrosoftLoginUrl(redirect));
}

export async function POST(req: NextRequest) {
  let rawBody = '';

  try {
    rawBody = await req.text();
  } catch {
    return NextResponse.json(
      { success: false, error: 'Invalid request body' },
      { status: 400 }
    );
  }

  try {
    const authResponse = await fetch(LEGACY_AUTH_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: rawBody,
      cache: 'no-store',
    });

    const responseText = await authResponse.text();
    const response = new NextResponse(responseText, {
      status: authResponse.status,
      headers: {
        'Content-Type':
          authResponse.headers.get('content-type') || 'application/json',
      },
    });

    const setCookieHeader = authResponse.headers.get('set-cookie');
    if (setCookieHeader) {
      response.headers.set('set-cookie', setCookieHeader);
    }

    return response;
  } catch {
    return NextResponse.json(
      { success: false, error: 'Authentication service unavailable' },
      { status: 503 }
    );
  }
}
