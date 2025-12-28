'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { RaceRenderer } from '@/components/RaceRenderer';
import { PromptPanel } from '@/components/PromptPanel';
import { ActionPanel } from '@/components/ActionPanel';
import { Gallery } from '@/components/Gallery';
import { LanguageToggle } from '@/components/LanguageToggle';
import { RaceSpec } from '@/lib/llm/schema';
import { useLanguage } from '@/lib/context/LanguageContext';

function PageContent() {
  const [spec, setSpec] = useState<RaceSpec | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [galleryTrigger, setGalleryTrigger] = useState(0);
  const router = useRouter();

  const { t } = useLanguage();

  const handleGenerate = async (prompt: string) => {
    setLoading(true);
    setError(null);
    setSpec(null);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();

      if (res.ok && data.status === 'ok') {
        setSpec(data.raceSpec);
      } else {
        setError(data.message || t('msg.error'));
      }
    } catch (err) {
      console.error(err);
      setError(t('msg.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!spec) return;
    setSaving(true);
    try {
      const res = await fetch('/api/races', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(spec)
      });
      const data = await res.json();
      if (data.status === 'ok') {
        alert(t('msg.saved'));
        setGalleryTrigger(prev => prev + 1);
      } else {
        alert(t('msg.save_fail'));
      }
    } catch (e) {
      console.error(e);
      alert(t('msg.save_fail'));
    } finally {
      setSaving(false);
    }
  };

  const handleDiscard = () => {
    setSpec(null);
    setError(null);
  };

  const handleLoadFromGallery = (loadedSpec: RaceSpec) => {
    setSpec(loadedSpec);
    setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      console.error(err);
    } finally {
      router.push('/login');
    }
  };

  return (
    <main style={{ padding: '40px 20px', minHeight: '100vh', backgroundColor: '#fafafa' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center', marginBottom: '40px', position: 'relative' }}>

        {/* Language Toggle */}
        <div style={{ position: 'absolute', right: 0, top: 0, display: 'flex', gap: '8px', alignItems: 'center' }}>
          <LanguageToggle />
          <button
            onClick={handleLogout}
            style={{
              padding: '4px 10px',
              borderRadius: '4px',
              border: '1px solid #e2e8f0',
              backgroundColor: 'white',
              color: '#475569',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 600
            }}
            type="button"
          >
            {t('btn.logout')}
          </button>
        </div>

        <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '10px', letterSpacing: '-0.02em', color: '#111' }}>{t('app.title')}</h1>
        <p style={{ color: '#666', fontSize: '1.1rem', marginBottom: '30px', lineHeight: 1.5 }}>
          {t('app.subtitle')}
        </p>

        <PromptPanel onGenerate={handleGenerate} isLoading={loading} />
      </div>

      {error && (
        <div style={{ maxWidth: '600px', margin: '0 auto 20px', padding: '16px', borderRadius: '8px', backgroundColor: '#fee2e2', color: '#b91c1c', border: '1px solid #fecaca', textAlign: 'center' }}>
          {error}
        </div>
      )}

      {spec ? (
        <>
          <RaceRenderer spec={spec} />
          <ActionPanel
            onSave={handleSave}
            onDiscard={handleDiscard}
            isSaving={saving}
            hasData={true}
          />
        </>
      ) : (
        !loading && <div style={{ textAlign: 'center', color: '#999', marginTop: '60px', fontStyle: 'italic' }}>{t('ph.start')}</div>
      )}

      <Gallery onLoad={handleLoadFromGallery} refreshTrigger={galleryTrigger} />
    </main>
  );
}

export default function Home() {
  return <PageContent />;
}
