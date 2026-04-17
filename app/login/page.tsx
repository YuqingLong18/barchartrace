'use client';

import { FormEvent, Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { LanguageToggle } from '@/components/LanguageToggle';
import { useLanguage } from '@/lib/context/LanguageContext';

type SessionUser = {
  name?: string;
  username?: string;
  email?: string | null;
  role?: string | null;
  authMethod?: string | null;
};

const AUTH_BASE_URL =
  process.env.NEXT_PUBLIC_AUTH_BASE_URL || 'https://thisnexus.cn';

function normalizeRedirect(redirect: string | null) {
  if (!redirect || !redirect.startsWith('/')) {
    return '/';
  }

  return redirect;
}

function LoginForm() {
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const redirect = normalizeRedirect(
    searchParams.get('redirect') || searchParams.get('from')
  );

  const [currentSession, setCurrentSession] = useState<SessionUser | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [switchingAccount, setSwitchingAccount] = useState(false);
  const [showLegacyForm, setShowLegacyForm] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [submittingLegacy, setSubmittingLegacy] = useState(false);
  const [legacyError, setLegacyError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadSession() {
      try {
        const response = await fetch('/api/session', { cache: 'no-store' });
        const data = await response.json().catch(() => null);

        if (!active || !data?.user) {
          return;
        }

        setCurrentSession(data.user);
      } catch {
        // Ignore session inspection failures; the page still works as a login entry.
      } finally {
        if (active) {
          setCheckingSession(false);
        }
      }
    }

    loadSession();

    return () => {
      active = false;
    };
  }, []);

  const teacherOnlyMessage = useMemo(() => {
    if (searchParams.get('error') !== 'teacher_only') {
      return null;
    }

    return t('login.teacher_only');
  }, [searchParams, t]);

  const startMicrosoftLogin = () => {
    const target = new URL('/api/auth/login', window.location.origin);
    target.searchParams.set('redirect', redirect);
    window.location.href = target.toString();
  };

  const handleLegacySubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!username.trim() || !password.trim()) {
      setLegacyError(t('login.error_required'));
      return;
    }

    setSubmittingLegacy(true);
    setLegacyError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim(),
          password,
        }),
      });

      const data = await res.json().catch(() => null);

      if (res.ok && data?.success) {
        window.location.href = redirect;
        return;
      }

      setLegacyError(data?.error || t('login.error_invalid'));
    } catch {
      setLegacyError(t('login.error_unavailable'));
    } finally {
      setSubmittingLegacy(false);
    }
  };

  const switchAccount = () => {
    setSwitchingAccount(true);
    const target = new URL('/api/auth/logout', window.location.origin);
    target.searchParams.set('redirect', '/login');
    window.location.href = target.toString();
  };

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        padding: '24px',
        background:
          'radial-gradient(circle at top, #dbeafe, #e0f2fe 35%, #f8fafc 100%)',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '460px',
          background: 'rgba(255,255,255,0.92)',
          borderRadius: '18px',
          padding: '32px',
          boxShadow: '0 16px 40px rgba(15, 23, 42, 0.12)',
          border: '1px solid rgba(148, 163, 184, 0.25)',
          animation: 'cardIn 0.6s ease both',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px',
            gap: '12px',
          }}
        >
          <div
            style={{
              fontWeight: 700,
              fontSize: '14px',
              letterSpacing: '0.12em',
              color: '#1d4ed8',
              background: '#dbeafe',
              padding: '6px 10px',
              borderRadius: '999px',
            }}
          >
            BAR RACE
          </div>
          <LanguageToggle />
        </div>

        <h1 style={{ margin: 0, fontSize: '28px', color: '#0f172a' }}>
          {t('login.title')}
        </h1>
        <p
          style={{
            margin: '8px 0 24px',
            color: '#475569',
            fontSize: '14px',
            lineHeight: 1.6,
          }}
        >
          {t('login.subtitle')}
        </p>

        {teacherOnlyMessage ? (
          <div
            style={{
              marginBottom: '16px',
              padding: '12px 14px',
              borderRadius: '12px',
              background: '#fee2e2',
              border: '1px solid #fecaca',
              color: '#b91c1c',
              fontSize: '13px',
              lineHeight: 1.55,
            }}
          >
            {teacherOnlyMessage}
          </div>
        ) : null}

        {checkingSession ? (
          <div
            style={{
              marginBottom: '16px',
              padding: '12px 14px',
              borderRadius: '12px',
              background: '#eff6ff',
              border: '1px solid #bfdbfe',
              color: '#1d4ed8',
              fontSize: '13px',
            }}
          >
            {t('login.checking')}
          </div>
        ) : null}

        {currentSession ? (
          <div
            style={{
              marginBottom: '16px',
              padding: '14px',
              borderRadius: '14px',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
            }}
          >
            <div
              style={{
                fontSize: '12px',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: '#64748b',
                marginBottom: '8px',
              }}
            >
              {t('login.current_account')}
            </div>
            <div style={{ fontWeight: 700, color: '#0f172a' }}>
              {currentSession.name || currentSession.username || t('login.unknown_user')}
            </div>
            <div style={{ marginTop: '4px', color: '#475569', fontSize: '14px' }}>
              {currentSession.email || currentSession.username || t('login.no_email')}
            </div>
            <div style={{ marginTop: '10px', color: '#64748b', fontSize: '13px' }}>
              {currentSession.role === 'student'
                ? t('login.current_account_student')
                : t('login.current_account_teacher')}
            </div>
          </div>
        ) : null}

        <button
          onClick={startMicrosoftLogin}
          style={{
            width: '100%',
            padding: '13px 16px',
            borderRadius: '12px',
            border: 'none',
            fontSize: '15px',
            fontWeight: 700,
            color: 'white',
            background: '#1d4ed8',
            cursor: 'pointer',
            transition: 'transform 0.2s ease',
          }}
          type="button"
        >
          {t('login.continue_microsoft')}
        </button>

        <div
          style={{
            minHeight: '20px',
            marginTop: '10px',
            color: '#64748b',
            fontSize: '13px',
            lineHeight: 1.55,
          }}
        >
          {t('login.helper')}
        </div>

        <button
          onClick={() => {
            setShowLegacyForm((value) => !value);
            setLegacyError(null);
          }}
          style={{
            width: '100%',
            marginTop: '14px',
            padding: '12px 16px',
            borderRadius: '12px',
            border: '1px solid #cbd5e1',
            fontSize: '14px',
            fontWeight: 700,
            color: '#0f172a',
            background: 'white',
            cursor: 'pointer',
          }}
          type="button"
        >
          {showLegacyForm ? t('login.hide_legacy') : t('login.show_legacy')}
        </button>

        {showLegacyForm ? (
          <form onSubmit={handleLegacySubmit} style={{ marginTop: '16px' }}>
            <label
              htmlFor="username"
              style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 700,
                color: '#0f172a',
              }}
            >
              {t('login.username')}
            </label>
            <input
              id="username"
              type="text"
              autoComplete="username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              disabled={submittingLegacy}
              style={{
                width: '100%',
                marginTop: '8px',
                marginBottom: '14px',
                padding: '12px 14px',
                borderRadius: '10px',
                border: '1px solid #cbd5e1',
                fontSize: '14px',
              }}
            />

            <label
              htmlFor="password"
              style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 700,
                color: '#0f172a',
              }}
            >
              {t('login.password')}
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              disabled={submittingLegacy}
              style={{
                width: '100%',
                marginTop: '8px',
                marginBottom: '14px',
                padding: '12px 14px',
                borderRadius: '10px',
                border: '1px solid #cbd5e1',
                fontSize: '14px',
              }}
            />

            {legacyError ? (
              <div
                style={{
                  marginBottom: '12px',
                  padding: '12px 14px',
                  borderRadius: '12px',
                  background: '#fee2e2',
                  border: '1px solid #fecaca',
                  color: '#b91c1c',
                  fontSize: '13px',
                  lineHeight: 1.55,
                }}
              >
                {legacyError}
              </div>
            ) : null}

            <button
              disabled={submittingLegacy}
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '12px',
                border: 'none',
                fontSize: '14px',
                fontWeight: 700,
                color: 'white',
                background: submittingLegacy ? '#94a3b8' : '#0f172a',
                cursor: submittingLegacy ? 'not-allowed' : 'pointer',
              }}
              type="submit"
            >
              {submittingLegacy
                ? t('login.submitting_legacy')
                : t('login.submit_legacy')}
            </button>
          </form>
        ) : null}

        <div
          style={{
            marginTop: '18px',
            display: 'flex',
            gap: '10px',
            flexWrap: 'wrap',
          }}
        >
          <button
            onClick={switchAccount}
            disabled={switchingAccount}
            style={{
              flex: '1 1 200px',
              padding: '11px 14px',
              borderRadius: '12px',
              border: '1px solid #cbd5e1',
              background: 'white',
              color: '#334155',
              cursor: switchingAccount ? 'not-allowed' : 'pointer',
              fontWeight: 600,
            }}
            type="button"
          >
            {switchingAccount
              ? t('login.switching')
              : t('login.switch_account')}
          </button>

          <a
            href={AUTH_BASE_URL}
            style={{
              flex: '1 1 160px',
              padding: '11px 14px',
              borderRadius: '12px',
              border: '1px solid #cbd5e1',
              background: 'white',
              color: '#334155',
              textDecoration: 'none',
              fontWeight: 600,
              textAlign: 'center',
            }}
          >
            {t('login.back_nexus')}
          </a>
        </div>
      </div>

      <style>{`
        @keyframes cardIn {
          from {
            opacity: 0;
            transform: translateY(16px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
