'use client';

import { useState, type FormEvent, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { LanguageToggle } from '@/components/LanguageToggle';
import { useLanguage } from '@/lib/context/LanguageContext';

function LoginForm() {
  const { t } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!username.trim() || !password.trim()) {
      setError(t('login.error_required'));
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        const redirectTo = searchParams.get('from') || '/';
        router.replace(redirectTo);
        return;
      }

      setError(data.error || t('login.error_invalid'));
    } catch (err) {
      console.error(err);
      setError(t('login.error_unavailable'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        padding: '24px',
        background: 'radial-gradient(circle at top, #fef3c7, #e0f2fe 45%, #f8fafc 100%)'
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '420px',
          background: 'rgba(255,255,255,0.9)',
          borderRadius: '16px',
          padding: '32px',
          boxShadow: '0 16px 40px rgba(15, 23, 42, 0.12)',
          border: '1px solid rgba(148, 163, 184, 0.25)',
          animation: 'cardIn 0.6s ease both'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div
            style={{
              fontWeight: 700,
              fontSize: '14px',
              letterSpacing: '0.12em',
              color: '#0f766e',
              background: '#ccfbf1',
              padding: '6px 10px',
              borderRadius: '999px'
            }}
          >
            BAR RACE
          </div>
          <LanguageToggle />
        </div>

        <h1 style={{ margin: 0, fontSize: '24px', color: '#0f172a' }}>{t('login.title')}</h1>
        <p style={{ margin: '8px 0 24px', color: '#475569', fontSize: '14px' }}>{t('login.subtitle')}</p>

        <form onSubmit={handleSubmit}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>
            {t('login.username')}
          </label>
          <input
            type="text"
            autoComplete="username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            disabled={submitting}
            style={{
              width: '100%',
              marginTop: '8px',
              marginBottom: '16px',
              padding: '12px 14px',
              borderRadius: '10px',
              border: '1px solid #cbd5f5',
              fontSize: '14px'
            }}
          />

          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>
            {t('login.password')}
          </label>
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            disabled={submitting}
            style={{
              width: '100%',
              marginTop: '8px',
              marginBottom: '18px',
              padding: '12px 14px',
              borderRadius: '10px',
              border: '1px solid #cbd5f5',
              fontSize: '14px'
            }}
          />

          <button
            type="submit"
            disabled={submitting}
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: '10px',
              border: 'none',
              fontSize: '15px',
              fontWeight: 600,
              color: 'white',
              background: submitting ? '#94a3b8' : '#0f766e',
              cursor: submitting ? 'not-allowed' : 'pointer',
              transition: 'transform 0.2s ease'
            }}
          >
            {submitting ? t('login.submitting') : t('login.submit')}
          </button>

          <div
            role="status"
            aria-live="polite"
            style={{
              minHeight: '20px',
              marginTop: '12px',
              color: '#dc2626',
              fontSize: '13px'
            }}
          >
            {error}
          </div>
        </form>
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
