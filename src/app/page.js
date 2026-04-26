// src/app/page.js
"use client";
import React, { useState } from 'react';
import ScrollytellingSection from '@/components/features/Scrollytelling/ScrollytellingSection';
import SunlitBackground from '@/components/features/SunlitBackground';
import styles from './home.module.css';

export default function HomePage() {
    // Shared state between Scrollytelling format and Background Lighting
    const [activeSection, setActiveSection] = useState('hero');

    return (
        <div className={styles.scholarlyTheme}>
            {/* Global Fixed Viewport Spanning Background */}
            <SunlitBackground />

            {/* Content Layers (Need relative positioning to sit above fixed background) */}
            <div className="relative z-10">
                {/* Hero Content Wrapper */}
                <section id="hero" className="min-h-screen w-full flex items-center justify-center border-b border-[var(--theme-outline-variant)]">
                    <div className="flex flex-col items-center justify-center text-center">
                        <h1 className="serifFont displayHeadline text-5xl md:text-7xl font-bold tracking-tight text-[var(--theme-ink)] mb-4 drop-shadow-sm">
                            Ruochong Han
                        </h1>
                        <p className="font-mono text-sm tracking-widest text-[var(--theme-outline)] uppercase drop-shadow-sm">
                            Digital Curator & Developer
                        </p>
                    </div>
                </section>

                {/* Scrollytelling About Me Section */}
                <ScrollytellingSection onPhaseChange={setActiveSection} />

            </div>
        </div>
    );
}