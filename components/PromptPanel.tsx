'use client';

import React, { useState } from 'react';

interface PromptPanelProps {
    onGenerate: (prompt: string) => void;
    isLoading: boolean;
}

import { useLanguage } from '../lib/context/LanguageContext';

export function PromptPanel({ onGenerate, isLoading }: PromptPanelProps) {
    const [prompt, setPrompt] = useState('GDP ranking by country 1960-2024');
    const { t } = useLanguage();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (prompt.trim()) {
            onGenerate(prompt);
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{ maxWidth: '600px', margin: '0 auto 40px', display: 'flex', gap: '10px' }}>
            <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={t('prompt.placeholder')}
                style={{
                    flex: 1,
                    padding: '12px 16px',
                    fontSize: '16px',
                    borderRadius: '8px',
                    border: '1px solid #ddd',
                    outline: 'none',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                }}
                disabled={isLoading}
            />
            <button
                type="submit"
                disabled={isLoading}
                style={{
                    padding: '12px 24px',
                    fontSize: '16px',
                    fontWeight: 600,
                    color: 'white',
                    backgroundColor: isLoading ? '#93c5fd' : '#2563eb',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    transition: 'background-color 0.2s',
                    minWidth: '120px'
                }}
            >
                {isLoading ? t('btn.generating') : t('btn.generate')}
            </button>
        </form>
    );
}
