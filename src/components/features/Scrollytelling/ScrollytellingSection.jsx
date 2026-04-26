// src/components/features/Scrollytelling/ScrollytellingSection.jsx
"use client";
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SECTIONS } from './constants';
import { PhaseIndicator } from './PhaseIndicator';
import { VISUALS } from './Visuals';

const ScrollytellingSection = ({ onPhaseChange }) => {
    const [activeSection, setActiveSection] = useState(SECTIONS[0].id);
    const sectionRefs = useRef({});

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveSection(entry.target.id);
                        if (onPhaseChange) {
                            onPhaseChange(entry.target.id);
                        }
                    }
                });
            },
            {
                root: null,
                rootMargin: '-40% 0px -40% 0px',
                threshold: 0
            }
        );

        SECTIONS.forEach((section) => {
            const el = sectionRefs.current[section.id];
            if (el) observer.observe(el);
        });

        return () => observer.disconnect();
    }, []);

    const scrollToSection = (id) => {
        const el = sectionRefs.current[id];
        if (el) {
            const offset = 160;
            const elementPosition = el.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.scrollY - offset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    };

    const activeSectionData = SECTIONS.find(s => s.id === activeSection) || SECTIONS[0];
    const VisualComponent = VISUALS[activeSection];

    return (
        <section className="max-w-7xl mx-auto w-full">
            <div className="flex flex-col md:flex-row">

                {/* Left Column: Narrative Content */}
                <div className="w-full md:w-1/2 relative border-r border-[var(--theme-outline-variant)]">

                    {/* Phase Indicators - Sticky */}
                    <div className="sticky top-[73px] z-40 bg-[var(--theme-surface)]/95 backdrop-blur-sm border-b border-[var(--theme-outline-variant)] py-4 px-6 md:px-12 transition-all">
                        <div className="flex items-center justify-start gap-4 md:gap-8 overflow-x-auto no-scrollbar">
                            {SECTIONS.map((section, index) => {
                                const currentIndex = SECTIONS.findIndex(s => s.id === activeSection);
                                const isCompleted = index < currentIndex;

                                return (
                                    <PhaseIndicator
                                        key={section.id}
                                        number={section.stepNumber}
                                        label={section.title}
                                        isActive={section.id === activeSection}
                                        isCompleted={isCompleted}
                                        onClick={() => scrollToSection(section.id)}
                                    />
                                );
                            })}
                        </div>
                    </div>

                    {/* Scrollable Text Sections */}
                    {SECTIONS.map((section) => (
                        <section
                            key={section.id}
                            id={section.id}
                            ref={el => sectionRefs.current[section.id] = el}
                            className="min-h-[80vh] flex flex-col justify-center px-6 py-20 md:py-24 md:px-12 lg:px-20 border-b border-[var(--theme-outline-variant)] last:border-0 relative"
                        >
                            <div className="mb-12">
                                <div className="flex items-center gap-3 mb-6">
                                    <span className="font-mono text-xs uppercase tracking-widest text-[var(--theme-outline)]">{section.subtitle}</span>
                                </div>
                                <h2 className="text-4xl md:text-5xl font-bold leading-tight mb-8">
                                    {section.title}
                                </h2>
                                <p className="text-lg leading-relaxed font-light text-[var(--theme-ink)] opacity-80">
                                    {section.description}
                                </p>
                                <p className="text-sm mt-4 font-mono text-[var(--theme-outline)]">
                                    {section.status}
                                </p>
                            </div>

                            {/* Sub-points */}
                            <div className="space-y-8 mt-8">
                                {section.subPoints.map((point, idx) => (
                                    <div key={idx} className="group">
                                        <div className="flex items-baseline gap-4 mb-2">
                                            <span className="text-xs font-mono transition-colors text-[var(--theme-outline)] group-hover:text-[var(--theme-primary)]">
                                                {section.stepNumber}.{idx + 1}
                                            </span>
                                            <h4 className="text-sm font-bold uppercase tracking-wide">{point.label}</h4>
                                        </div>
                                        <p className="text-sm pl-8 md:pl-10 border-l border-[var(--theme-outline-variant)] transition-colors opacity-70 group-hover:border-[var(--theme-primary)]">
                                            {point.text}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            {/* CTA for last section */}
                            {section.id === 'finance' && (
                                <div className="mt-16 text-left">
                                    <Link
                                        href="/blog"
                                        className="inline-flex items-center gap-2 font-mono text-sm group"
                                    >
                                        <span className="border-b border-[var(--theme-outline-variant)] group-hover:border-[var(--theme-primary)] transition-colors pb-1">进入频道探索更多</span>
                                        <ArrowRight size={16} className="text-[var(--theme-outline)] group-hover:text-[var(--theme-primary)] transition-colors" />
                                    </Link>
                                </div>
                            )}
                        </section>
                    ))}
                </div>

                {/* Right Column: Visual Context (Sticky) - Hidden on mobile */}
                <div className="hidden md:block w-1/2 relative">
                    <div className="sticky top-[73px] h-[calc(100vh-73px)] w-full p-8 lg:p-12 overflow-hidden flex items-center justify-center">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeSection}
                                initial={{ opacity: 0, scale: 0.98, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.98, y: -10 }}
                                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                                className="w-full h-full max-h-[600px]"
                            >
                                {VisualComponent && <VisualComponent />}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>

            </div>
        </section>
    );
};

export default ScrollytellingSection;
