'use client';

import { useState } from 'react';
import { RaceRenderer } from '@/components/RaceRenderer';
import { PromptPanel } from '@/components/PromptPanel';
import { ActionPanel } from '@/components/ActionPanel';
import { Gallery } from '@/components/Gallery';
import { EXAMPLE_RACESPEC } from '@/lib/data/fixture';
import { RaceSpec } from '@/lib/llm/schema';

export default function Home() {
  const [spec, setSpec] = useState<RaceSpec | null>(null); // Start empty to show gallery properly
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [galleryTrigger, setGalleryTrigger] = useState(0);

  const handleGenerate = async (prompt: string) => {
    setLoading(true);
    setError(null);
    setSpec(null); // Clear while regenerating
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
        setError(data.message || 'Failed to generate race.');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred. Please try again.');
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
        alert('Chart saved to gallery!');
        setGalleryTrigger(prev => prev + 1); // Refresh gallery
      } else {
        alert('Failed to save chart.');
      }
    } catch (e) {
      console.error(e);
      alert('Error saving chart.');
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

  return (
    <main style={{ padding: '40px 20px', minHeight: '100vh', backgroundColor: '#fafafa' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '10px', letterSpacing: '-0.02em', color: '#111' }}>Bar Chart Race Generator</h1>
        <p style={{ color: '#666', fontSize: '1.1rem', marginBottom: '30px', lineHeight: 1.5 }}>
          Generate animated bar chart races from natural language prompts.
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
        !loading && <div style={{ textAlign: 'center', color: '#999', marginTop: '60px', fontStyle: 'italic' }}>Enter a prompt above or select a saved chart below.</div>
      )}

      <Gallery onLoad={handleLoadFromGallery} refreshTrigger={galleryTrigger} />
    </main>
  );
}
