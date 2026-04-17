export type AuthRole = 'teacher' | 'student';

export type AuthSession = {
  authMethod?: 'legacy' | 'microsoft' | string;
  role?: AuthRole | string;
  username?: string;
  name?: string;
  email?: string | null;
  exp?: number;
  iat?: number;
  [key: string]: unknown;
};

export const AUTH_COOKIE_NAME =
  process.env.AUTH_COOKIE_NAME || 'thisnexus_session';
export const AUTH_FLOW_COOKIE_NAME =
  process.env.AUTH_FLOW_COOKIE_NAME || 'thisnexus_auth_flow';
export const AUTH_BASE_URL =
  process.env.AUTH_BASE_URL ||
  process.env.NEXT_PUBLIC_AUTH_BASE_URL ||
  'https://thisnexus.cn';
export const AUTH_SERVICE_BASE_URL =
  process.env.AUTH_SERVICE_BASE_URL || AUTH_BASE_URL;
export const BARCHARTRACE_BASE_URL =
  process.env.BARCHARTRACE_BASE_URL ||
  process.env.NEXT_PUBLIC_BARCHARTRACE_BASE_URL ||
  'https://barchartrace.thisnexus.cn';

const AUTH_SESSION_SECRET =
  process.env.AUTH_SESSION_SECRET ||
  (process.env.NODE_ENV === 'production' ? '' : 'local-dev-secret-change-me');

function normalizeBase64Url(value: string) {
  return value.replace(/-/g, '+').replace(/_/g, '/');
}

function base64UrlToBytes(value: string) {
  const normalized = normalizeBase64Url(value);
  const padding = normalized.length % 4;
  const padded = padding ? normalized + '='.repeat(4 - padding) : normalized;
  const decoded = atob(padded);
  const bytes = new Uint8Array(decoded.length);

  for (let index = 0; index < decoded.length; index += 1) {
    bytes[index] = decoded.charCodeAt(index);
  }

  return bytes;
}

function bytesToBase64Url(bytes: Uint8Array) {
  let binary = '';

  bytes.forEach((value) => {
    binary += String.fromCharCode(value);
  });

  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

function stringToBytes(value: string) {
  return new TextEncoder().encode(value);
}

function bytesToString(value: Uint8Array) {
  return new TextDecoder().decode(value);
}

function timingSafeEqual(left: string, right: string) {
  if (left.length !== right.length) {
    return false;
  }

  let diff = 0;
  for (let index = 0; index < left.length; index += 1) {
    diff |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }

  return diff === 0;
}

async function signValue(value: string) {
  if (!AUTH_SESSION_SECRET) {
    throw new Error('AUTH_SESSION_SECRET is required');
  }

  const key = await crypto.subtle.importKey(
    'raw',
    stringToBytes(AUTH_SESSION_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', key, stringToBytes(value));
  return bytesToBase64Url(new Uint8Array(signature));
}

export async function verifyAuthSession(token?: string | null) {
  if (!token || !token.includes('.')) {
    return null;
  }

  const [encodedPayload, signature] = token.split('.');
  const expectedSignature = await signValue(encodedPayload);

  if (!timingSafeEqual(signature, expectedSignature)) {
    return null;
  }

  try {
    const payload = JSON.parse(
      bytesToString(base64UrlToBytes(encodedPayload))
    ) as AuthSession;

    if (payload.exp && payload.exp * 1000 < Date.now()) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export function isTeacherSession(session?: AuthSession | null) {
  return Boolean(session) && session?.role !== 'student';
}

export function normalizeRedirectPath(path?: string | null) {
  if (!path || !path.startsWith('/')) {
    return '/';
  }

  return path;
}

export function buildMicrosoftLoginUrl(path?: string | null) {
  const returnTo = new URL(
    normalizeRedirectPath(path),
    BARCHARTRACE_BASE_URL
  ).toString();

  const url = new URL('/api/auth/microsoft', AUTH_SERVICE_BASE_URL);
  url.searchParams.set('returnTo', returnTo);
  return url.toString();
}

export function buildLogoutUrl(path?: string | null) {
  const returnTo = new URL(
    normalizeRedirectPath(path),
    BARCHARTRACE_BASE_URL
  ).toString();

  const url = new URL('/api/auth/logout', AUTH_SERVICE_BASE_URL);
  url.searchParams.set('returnTo', returnTo);
  return url.toString();
}
