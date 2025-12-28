'use client';

import { useLanguage } from '@/lib/context/LanguageContext';

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  return (
    <div style={{ display: 'flex', border: '1px solid #ddd', borderRadius: '4px', overflow: 'hidden' }}>
      <button
        onClick={() => setLanguage('en')}
        style={{
          padding: '4px 8px',
          border: 'none',
          backgroundColor: language === 'en' ? '#0f766e' : 'white',
          color: language === 'en' ? 'white' : '#666',
          cursor: 'pointer',
          fontSize: '12px',
          fontWeight: 600
        }}
        type="button"
        aria-pressed={language === 'en'}
      >
        English
      </button>
      <button
        onClick={() => setLanguage('zh')}
        style={{
          padding: '4px 8px',
          border: 'none',
          backgroundColor: language === 'zh' ? '#0f766e' : 'white',
          color: language === 'zh' ? 'white' : '#666',
          cursor: 'pointer',
          fontSize: '12px',
          fontWeight: 600
        }}
        type="button"
        aria-pressed={language === 'zh'}
      >
        中文
      </button>
    </div>
  );
}
