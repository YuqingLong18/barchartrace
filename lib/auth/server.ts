import { cookies } from 'next/headers';
import {
  AUTH_COOKIE_NAME,
  type AuthSession,
  isTeacherSession,
  verifyAuthSession,
} from './constants';

export async function getAuthSession(): Promise<AuthSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  return verifyAuthSession(token);
}

export async function isAuthenticated() {
  const session = await getAuthSession();
  return isTeacherSession(session);
}
