import { cookies } from 'next/headers';
import { AUTH_COOKIE_NAME } from './constants';

export async function isAuthenticated() {
  const cookieStore = await cookies();
  return cookieStore.get(AUTH_COOKIE_NAME)?.value === 'true';
}
