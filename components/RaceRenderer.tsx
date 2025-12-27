'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RaceSpec } from '../lib/llm/schema';

interface RaceRendererProps {
    spec: RaceSpec;
}

export function RaceRenderer({ spec }: RaceRendererProps) {
    const [currentStep, setCurrentStep] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);

    // Group data by time
    const steps = useMemo(() => {
        // Unique years sorted
        const combinedData = spec.data;
        const years = Array.from(new Set(combinedData.map((d) => d.year))).sort();
        return years;
    }, [spec.data]);

    const currentYear = steps[currentStep];

    // Derive current frame data
    const currentData = useMemo(() => {
        // Filter for current year
        const frameData = spec.data.filter((d) => d.year === currentYear);

        // Sort descending by value
        const sorted = [...frameData].sort((a, b) => b.value - a.value);

        // Assign Rank (index)
        // We only take top N for display, but keeping track of them is useful
        return sorted.slice(0, spec.topN);
    }, [spec.data, currentYear, spec.topN]);

    // Determine max value for the current frame to scale bars relative to the width
    // Alternatively, max value of the entire dataset? Usually frame-relative is better for "race" dynamics,
    // but it makes the axis jumpy. Fixed axis (max of all time) or dynamic? 
    // "Bar chart race" typically means dynamic axis (top item is always near 100% or growing).
    // Usually, the lead bar is full width or close to it.
    const maxValue = currentData.length > 0 ? currentData[0].value : 1;

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isPlaying) {
            interval = setInterval(() => {
                setCurrentStep((prev) => {
                    if (prev >= steps.length - 1) {
                        setIsPlaying(false);
                        return prev;
                    }
                    return prev + 1;
                });
            }, spec.stepDurationMs);
        }
        return () => clearInterval(interval);
    }, [isPlaying, steps.length, spec.stepDurationMs]);

    const handlePlayPause = () => {
        if (currentStep >= steps.length - 1) {
            setCurrentStep(0);
            setIsPlaying(true);
        } else {
            setIsPlaying(!isPlaying);
        }
    };

    const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = Number(e.target.value);
        setCurrentStep(val);
        // Optional: pause when scrubbing
        // setIsPlaying(false); 
    };

    // Stable color assignment
    const getColor = (name: string) => {
        const colors = [
            '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
            '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1'
        ];
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }
        return colors[Math.abs(hash % colors.length)];
    };

    const formatValue = (val: number) => {
        // Basic formatting based on schema could be added here
        return new Intl.NumberFormat('en-US', {
            notation: "compact",
            maximumFractionDigits: 1
        }).format(val);
    };

    return (
        <div className="race-container" style={{
            fontFamily: 'system-ui, sans-serif',
            maxWidth: '800px',
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
            <div style={{ position: 'relative', height: `${spec.topN * 50 + 20}px`, border: '1px solid #e5e5e5', borderRadius: '8px', overflow: 'hidden', padding: '10px' }}>

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
                    {currentYear}
                </div>

                <div style={{ position: 'relative', width: '100%', height: '100%', zIndex: 1 }}>
                    <AnimatePresence>
                        {currentData.map((item, index) => (
                            <motion.div
                                key={item.name}
                                initial={{ opacity: 0, y: 50, width: 0 }}
                                animate={{
                                    opacity: 1,
                                    y: index * 48, // row height
                                    width: `${(item.value / maxValue) * 75 + 1}%` // Scale width
                                }}
                                exit={{ opacity: 0, y: 50 }}
                                transition={{ duration: spec.stepDurationMs / 1000, ease: "linear" }}
                                style={{
                                    position: 'absolute',
                                    left: 0,
                                    top: 0,
                                    height: '36px', // bar height
                                    display: 'flex',
                                    alignItems: 'center',
                                }}
                            >
                                {/* Bar */}
                                <div style={{
                                    height: '100%',
                                    width: '100%',
                                    backgroundColor: getColor(item.name),
                                    borderRadius: '4px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '0 12px',
                                    whiteSpace: 'nowrap',
                                    color: '#fff',
                                    fontSize: '14px',
                                    fontWeight: 600,
                                    boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                                }}>
                                    {item.name}
                                </div>

                                {/* Value Label (outside bar) */}
                                <div style={{
                                    marginLeft: '10px',
                                    fontSize: '14px',
                                    fontWeight: 600,
                                    color: 'var(--foreground)',
                                    fontVariantNumeric: 'tabular-nums'
                                }}>
                                    {formatValue(item.value)}
                                </div>
                            </motion.div>
                        ))}
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
                    {isPlaying ? 'Pause' : (currentStep >= steps.length - 1 ? 'Replay' : 'Play')}
                </button>

                <input
                    type="range"
                    min="0"
                    max={steps.length - 1}
                    value={currentStep}
                    onChange={handleSliderChange}
                    style={{ flex: 1, height: '6px', borderRadius: '3px', background: '#ddd' }}
                />

                <span style={{ minWidth: '40px', textAlign: 'right', fontWeight: 500 }}>
                    {currentYear}
                </span>
            </div>

            {spec.notes && <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '16px' }}>*{spec.notes}</p>}

            {/* Sources */}
            {spec.sources && spec.sources.length > 0 && (
                <div style={{ marginTop: '12px', fontSize: '0.8rem', color: '#888' }}>
                    Source: <a href={spec.sources[0].url} target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb', textDecoration: 'none' }}>{spec.sources[0].title}</a>
                </div>
            )}
        </div>
    );
}
