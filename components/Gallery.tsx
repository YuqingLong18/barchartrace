'use client';

import React, { useEffect, useState } from 'react';
import { RaceSpec } from '@/lib/llm/schema'; // Ensure prompt import
import { Trash2, Play } from 'lucide-react';

import { useLanguage } from '../lib/context/LanguageContext';

interface SavedRace extends RaceSpec {
    id: string;
    createdAt: string;
}

interface GalleryProps {
    onLoad: (spec: RaceSpec) => void;
    refreshTrigger: number;
}

export function Gallery({ onLoad, refreshTrigger }: GalleryProps) {
    const [races, setRaces] = useState<SavedRace[]>([]);
    const [loading, setLoading] = useState(true);
    const { language, t } = useLanguage();

    const fetchRaces = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/races');
            const data = await res.json();
            if (data.status === 'ok') {
                setRaces(data.races);
            }
        } catch (e) {
            console.error('Failed to load gallery', e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRaces();
    }, [refreshTrigger]);

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm(t('gallery.delete_confirm'))) return;

        try {
            await fetch(`/api/races?id=${id}`, { method: 'DELETE' });
            fetchRaces();
        } catch (e) {
            console.error('Failed to delete', e);
        }
    };

    return (
        <div style={{ maxWidth: '800px', margin: '60px auto 0', padding: '0 20px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>{t('gallery.title')}</h2>

            {loading && <p>Loading gallery...</p>}

            {!loading && races.length === 0 && (
                <p style={{ color: '#999', fontStyle: 'italic' }}>{t('gallery.empty')}</p>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px' }}>
                {races.map((race) => {
                    const displayTitle = (language === 'zh' && race.title_zh) ? race.title_zh : race.title;
                    const displaySubtitle = (language === 'zh' && race.subtitle_zh) ? race.subtitle_zh : race.subtitle;

                    return (
                        <div
                            key={race.id}
                            onClick={() => onLoad(race)}
                            style={{
                                border: '1px solid #e5e5e5',
                                borderRadius: '8px',
                                padding: '16px',
                                backgroundColor: 'white',
                                cursor: 'pointer',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                height: '180px',
                                transition: 'transform 0.2s, box-shadow 0.2s',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 6px 12px rgba(0,0,0,0.1)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'none';
                                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';
                            }}
                        >
                            <div>
                                <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '8px', lineHeight: 1.3 }}>
                                    {displayTitle}
                                </h3>
                                {displaySubtitle && (
                                    <p style={{ fontSize: '0.8rem', color: '#666', margin: 0, lineClamp: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                        {displaySubtitle}
                                    </p>
                                )}
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '12px' }}>
                                <span style={{ fontSize: '0.75rem', color: '#999' }}>
                                    {new Date(race.createdAt).toLocaleDateString()}
                                </span>

                                <button
                                    onClick={(e) => handleDelete(race.id, e)}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: '#999',
                                        cursor: 'pointer',
                                        padding: '4px'
                                    }}
                                    title="Delete"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
