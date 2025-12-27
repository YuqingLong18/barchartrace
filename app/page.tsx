'use client';

import { useState } from 'react';
import { RaceRenderer } from '@/components/RaceRenderer';
import { PromptPanel } from '@/components/PromptPanel';
import { EXAMPLE_RACESPEC } from '@/lib/data/fixture';
import { RaceSpec } from '@/lib/llm/schema';

export default function Home() {
  const [spec, setSpec] = useState<RaceSpec | null>(EXAMPLE_RACESPEC);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (prompt: string) => {
    setLoading(true);
    setError(null);
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
        <RaceRenderer spec={spec} />
      ) : (
        !loading && <div style={{ textAlign: 'center', color: '#999', marginTop: '60px', fontStyle: 'italic' }}>Enter a prompt above to generate a race.</div>
      )}
    </main>
  );
}
