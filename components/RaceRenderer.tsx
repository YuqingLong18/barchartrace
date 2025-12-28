'use client';

import React, { useEffect, useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RaceSpec, DataPoint } from '../lib/llm/schema';
import { generateInterpolatedFrames } from '../lib/data/interpolate';
import { getFlagUrl } from '../lib/data/countries';
import { CountingNumber } from './CountingNumber';

interface RaceRendererProps {
    spec: RaceSpec;
}

export function RaceRenderer({ spec }: RaceRendererProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [frameIndex, setFrameIndex] = useState(0);

    // 1. Generate all frames (dense)
    const frames = useMemo(() => {
        return generateInterpolatedFrames(spec);
    }, [spec]);

    // Current frame data
    const currentFrameRaw = frames[frameIndex] || [];

    // 2. Sort current frame to determine ranks
    const sortedFrame = useMemo(() => {
        // Create a new array and sort
        return [...currentFrameRaw].sort((a, b) => b.value - a.value);
    }, [currentFrameRaw]);

    // 3. Take Top N
    const displayData = sortedFrame.slice(0, spec.topN);

    const currentYear = displayData.length > 0 ? displayData[0].year : (frames[0]?.[0]?.year || 0);
    const maxValue = displayData.length > 0 ? displayData[0].value : 1;

    // Calculate tick duration to target exactly 60 seconds (60000ms)
    // spec.stepDurationMs is ignored in favor of the 60s target rule
    const TARGET_DURATION_MS = 60 * 1000;
    const tickDuration = frames.length > 1 ? TARGET_DURATION_MS / frames.length : 100;

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isPlaying) {
            interval = setInterval(() => {
                setFrameIndex((prev) => {
                    if (prev >= frames.length - 1) {
                        setIsPlaying(false);
                        return prev;
                    }
                    return prev + 1;
                });
            }, tickDuration);
        }
        return () => clearInterval(interval);
    }, [isPlaying, frames.length, tickDuration]);

    const handlePlayPause = () => {
        if (frameIndex >= frames.length - 1) {
            setFrameIndex(0);
            setIsPlaying(true);
        } else {
            setIsPlaying(!isPlaying);
        }
    };

    const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = Number(e.target.value);
        setFrameIndex(val);
    };

    const getColor = (name: string) => {
        // Basic stable color hash
        const colors = [
            '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
            '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1',
            '#14b8a6', '#f43f5e', '#8b5cf6', '#0ea5e9', '#d946ef'
        ];
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }
        return colors[Math.abs(hash % colors.length)];
    };

    const ROW_HEIGHT = 50;
    const LABEL_WIDTH = 180;

    return (
        <div className="race-container" style={{
            fontFamily: 'system-ui, sans-serif',
            maxWidth: '900px',
            margin: '0 auto',
            padding: '20px',
            backgroundColor: 'var(--background)',
            color: 'var(--foreground)',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}>
            <header style={{ marginBottom: '24px' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '8px' }}>{spec.title}</h1>
                {spec.subtitle && <p style={{ color: '#666', margin: 0 }}>{spec.subtitle}</p>}
            </header>

            {/* Chart Area */}
            <div style={{ position: 'relative', height: `${spec.topN * ROW_HEIGHT + 40}px`, border: '1px solid #e5e5e5', borderRadius: '8px', overflow: 'hidden', padding: '10px' }}>

                {/* Background Year */}
                <div style={{
                    position: 'absolute',
                    bottom: '10px',
                    right: '20px',
                    fontSize: '6rem',
                    fontWeight: 'bold',
                    color: '#999',
                    opacity: 0.15,
                    zIndex: 0,
                    pointerEvents: 'none',
                    fontVariantNumeric: 'tabular-nums'
                }}>
                    {Math.floor(Number(currentYear))}
                </div>

                <div style={{ position: 'relative', width: '100%', height: '100%', zIndex: 1 }}>
                    <AnimatePresence>
                        {displayData.map((item, index) => {
                            const flagUrl = getFlagUrl(item.name);

                            return (
                                <motion.div
                                    key={item.name}
                                    layout
                                    initial={{ opacity: 0, y: 50, scale: 0.8 }}
                                    animate={{
                                        opacity: 1,
                                        y: index * ROW_HEIGHT,
                                        scale: 1,
                                    }}
                                    exit={{ opacity: 0, scale: 0.5 }}
                                    transition={{
                                        duration: tickDuration / 1000,
                                        ease: "linear"
                                    }}
                                    style={{
                                        position: 'absolute',
                                        left: 0,
                                        top: 0,
                                        height: '36px',
                                        width: '100%',
                                        display: 'flex',
                                        alignItems: 'center',
                                    }}
                                >
                                    {/* Label Column */}
                                    <div style={{
                                        width: `${LABEL_WIDTH}px`,
                                        flexShrink: 0,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'flex-end',
                                        height: '100%',
                                        paddingRight: '12px',
                                        gap: '8px'
                                    }}>
                                        {flagUrl && (
                                            <img
                                                src={flagUrl}
                                                alt=""
                                                style={{ width: '24px', height: 'auto', borderRadius: '2px', boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}
                                            />
                                        )}
                                        <span style={{
                                            fontWeight: 600,
                                            fontSize: '14px',
                                            textAlign: 'right',
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            color: 'var(--foreground)'
                                        }}>
                                            {item.name}
                                        </span>
                                    </div>

                                    {/* Bar Track (Takes remaining space) */}
                                    <div style={{ flex: 1, height: '100%', display: 'flex', alignItems: 'center' }}>
                                        {/* Colored Bar */}
                                        <motion.div
                                            style={{
                                                height: '100%',
                                                backgroundColor: getColor(item.name),
                                                borderRadius: '0 4px 4px 0',
                                                display: 'flex',
                                                alignItems: 'center',
                                                padding: '0 4px',
                                                boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                                            }}
                                            animate={{
                                                width: `${(item.value / maxValue) * 85 + 1}%`
                                            }}
                                            transition={{ duration: tickDuration / 1000, ease: "linear" }}
                                        />

                                        {/* Value Label */}
                                        <div style={{
                                            marginLeft: '10px',
                                            fontSize: '14px',
                                            fontWeight: 600,
                                            color: 'var(--foreground)',
                                            fontVariantNumeric: 'tabular-nums',
                                            whiteSpace: 'nowrap'
                                        }}>
                                            <CountingNumber value={item.value} />
                                        </div>
                                    </div>
                                </motion.div>
                            )
                        })}
                    </AnimatePresence>
                </div>
            </div>

            {/* Controls */}
            <div style={{ marginTop: '24px', display: 'flex', gap: '16px', alignItems: 'center' }}>
                <button
                    onClick={handlePlayPause}
                    style={{
                        height: '40px',
                        padding: '0 20px',
                        borderRadius: '6px',
                        border: 'none',
                        backgroundColor: '#2563eb',
                        color: 'white',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}
                >
                    {isPlaying ? 'Pause' : (frameIndex >= frames.length - 1 ? 'Replay' : 'Play')}
                </button>

                <input
                    type="range"
                    min="0"
                    max={frames.length - 1}
                    value={frameIndex}
                    onChange={handleSliderChange}
                    style={{ flex: 1, height: '6px', borderRadius: '3px', background: '#ddd' }}
                />

                <span style={{ minWidth: '40px', textAlign: 'right', fontWeight: 500 }}>
                    {Math.floor(Number(currentYear))}
                </span>
            </div>

            {spec.notes && <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '16px' }}>*{spec.notes}</p>}

            {spec.sources && spec.sources.length > 0 && (
                <div style={{ marginTop: '12px', fontSize: '0.8rem', color: '#888' }}>
                    Source: <a href={spec.sources[0].url} target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb', textDecoration: 'none' }}>{spec.sources[0].title}</a>
                </div>
            )}
        </div>
    );
}
