'use client';

import React from 'react';

interface ActionPanelProps {
    onSave: () => void;
    onDiscard: () => void;
    isSaving: boolean;
    hasData: boolean;
}

export function ActionPanel({ onSave, onDiscard, isSaving, hasData }: ActionPanelProps) {
    if (!hasData) return null;

    return (
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '24px' }}>
            <button
                onClick={onDiscard}
                disabled={isSaving}
                style={{
                    padding: '10px 20px',
                    borderRadius: '6px',
                    border: '1px solid #e5e5e5',
                    backgroundColor: 'white',
                    color: '#ef4444',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: isSaving ? 'not-allowed' : 'pointer',
                    transition: 'background-color 0.2s'
                }}
            >
                Discard
            </button>

            <button
                onClick={onSave}
                disabled={isSaving}
                style={{
                    padding: '10px 20px',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: '#10b981',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: isSaving ? 'not-allowed' : 'pointer',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                }}
            >
                {isSaving ? 'Saving...' : 'Save to Gallery'}
            </button>
        </div>
    );
}
