"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { CHANNELS_CONFIG } from '@/lib/channels';
import TempoBackground from '@/components/finance/TempoBackground';
import TempoHero from '@/components/finance/TempoHero';
import TempoGrid from '@/components/finance/TempoGrid';
import DebugPanel from '@/components/finance/DebugPanel';

const THEMES = [
    { name: 'Midnight', bg: '#050505', text: '#3b82f6', accent: '#1d4ed8' },
    { name: 'Blueprint', bg: '#1e3a8a', text: '#93c5fd', accent: '#60a5fa' },
    { name: 'Terminal', bg: '#0c0c0c', text: '#22c55e', accent: '#15803d' },
    { name: 'Crimson', bg: '#2a0a0a', text: '#f87171', accent: '#dc2626' },
    { name: 'Slate', bg: '#0f172a', text: '#cbd5e1', accent: '#475569' },
    { name: 'Gold', bg: '#1a1a1a', text: '#fbbf24', accent: '#d97706' },
    { name: 'Violet', bg: '#2e1065', text: '#d8b4fe', accent: '#a855f7' },
    { name: 'Cyber', bg: '#000000', text: '#22d3ee', accent: '#0891b2' },
];

export default function FinanceChannelClient() {
    const channelConfig = CHANNELS_CONFIG['finance'];

    // State for Visual Config
    const [config, setConfig] = useState({
        zoom: 50,
        twist: 5.0,
        tiltX: 0.15, // Default tilt X
        tiltY: -0.2, // Default tilt Y
        themeId: 0, // Default Midnight (now index 0)
        isDark: true,
        fullCanvas: false,
        showDebug: false
    });

    // Independent state for the "Target" twist to allow smooth animation
    const [targetTwist, setTargetTwist] = useState(0);

    const randomize = useCallback(() => {
        const newTwist = Math.random();
        setConfig(prev => ({
            ...prev,
            zoom: Math.floor(Math.random() * 200),
            twist: newTwist,
            tiltX: (Math.random() * 2) - 1, // Random -1 to 1
            tiltY: (Math.random() * 2) - 1, // Random -1 to 1
            themeId: Math.floor(Math.random() * THEMES.length)
        }));
    }, []);

    const toggleDebug = useCallback(() => {
        setConfig(prev => ({ ...prev, showDebug: !prev.showDebug }));
    }, []);

    useEffect(() => {
        const handleKeyDown = (e) => {
            // Don't trigger if typing in an input
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

            switch (e.code) {
                case 'Space':
                    e.preventDefault();
                    randomize();
                    break;
                case 'KeyD':
                    toggleDebug();
                    break;
                case 'KeyF':
                    setConfig(prev => ({ ...prev, fullCanvas: !prev.fullCanvas }));
                    break;
                case 'KeyM':
                    setConfig(prev => ({ ...prev, isDark: !prev.isDark }));
                    break;
                default:
                    // Check for numbers 0-9
                    if (e.key >= '0' && e.key <= '9') {
                        const idx = parseInt(e.key);
                        if (idx < THEMES.length) {
                            setConfig(prev => ({ ...prev, themeId: idx }));
                        }
                    }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [randomize, toggleDebug]);

    // Sync Slider Twist to Target Twist immediately
    useEffect(() => {
        setTargetTwist(config.twist);
    }, [config.twist]);

    const currentTheme = THEMES[config.themeId] || THEMES[0];

    return (
        <div className={`relative min-h-screen transition-colors duration-500 overflow-hidden ${config.isDark ? 'bg-[#1d1d1d] text-white' : 'bg-gray-100 text-black'}`}>
            {/* 3D Background Layer */}
            <TempoBackground
                config={config}
                targetTwist={targetTwist}
                theme={currentTheme}
            />

            {/* Main Content Layer */}
            <main className={`relative z-10 transition-opacity duration-500 ${config.fullCanvas ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                <TempoHero
                    title={channelConfig.name}
                    subtitle="Channel"
                    description="Smart investing, rational decision making. Explore our curated columns on trading strategies, market analysis, and financial wisdom."
                />

                <TempoGrid columns={channelConfig.columns} />

                {/* Footer / Additional Content */}
                <footer className="py-12 text-center text-gray-500 text-sm">
                    <p>Press [SPACEBAR] to randomize theme</p>
                    <p className="mt-2">© 2024 Personal Site. All rights reserved.</p>
                </footer>
            </main>

            {/* Debug / Controls */}
            <DebugPanel
                config={config}
                setConfig={setConfig}
                themes={THEMES}
                onRandomize={randomize}
                isOpen={config.showDebug}
                toggleOpen={toggleDebug}
            />

            {/* Toggle Hint (if panel hidden) */}
            {!config.showDebug && (
                <div className="fixed top-24 right-6 z-[100] px-3 py-1 bg-black/50 text-white text-xs font-mono rounded backdrop-blur-md border border-white/10 cursor-pointer" onClick={toggleDebug}>
                    PRESS [D]
                </div>
            )}
        </div>
    );
}