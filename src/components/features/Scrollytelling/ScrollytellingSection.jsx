// src/components/features/Scrollytelling/ScrollytellingSection.jsx
"use client";
import { useEffect, useRef, useState, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SECTIONS } from './constants';
import { PhaseIndicator } from './PhaseIndicator';
import { VISUALS } from './Visuals';

gsap.registerPlugin(ScrollTrigger);

// ── Utility: Throttle ──
const throttle = (fn, limit) => {
  let inThrottle;
  return (...args) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => { inThrottle = false; }, limit);
    }
  };
};

export default function ScrollytellingSection() {
    const [activeSection, setActiveSection] = useState(SECTIONS[0].id);
    const containerRef = useRef(null);
    const sectionRefs = useRef({});
    const visualContainerRef = useRef(null);
    const visualRefs = useRef({});
    const isFirstRender = useRef(true);

    // Throttle state updates triggered by scroll to avoid excessive React re-renders
    const throttledSetActiveSection = useRef(
        throttle((id) => { setActiveSection(id); }, 80)
    ).current;

    // ── 1. GSAP ScrollTrigger: section entrance animations + active detection ──
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const ctx = gsap.context(() => {
            // Phase indicator bar entrance — starts early for seamless handoff from Hero
            const indicatorBar = container.querySelector('.phase-indicator-bar');
            if (indicatorBar) {
                gsap.fromTo(
                    indicatorBar,
                    { y: -20, opacity: 0 },
                    {
                        y: 0,
                        opacity: 1,
                        duration: 0.6,
                        ease: 'power2.out',
                        scrollTrigger: {
                            trigger: indicatorBar,
                            start: 'top 105%',
                            end: 'top 85%',
                            scrub: 0.5,
                        },
                    }
                );
            }

            SECTIONS.forEach((section, index) => {
                const sectionEl = sectionRefs.current[section.id];
                if (!sectionEl) return;

                const animateEls = sectionEl.querySelectorAll('.scrolly-animate');
                const isFirst = index === 0;

                // Staggered entrance — first section starts earlier for seamless Hero handoff
                gsap.fromTo(
                    animateEls,
                    { y: isFirst ? 60 : 50, opacity: 0 },
                    {
                        y: 0,
                        opacity: 1,
                        stagger: 0.1,
                        duration: 0.8,
                        ease: 'power2.out',
                        scrollTrigger: {
                            trigger: sectionEl,
                            start: isFirst ? 'top 105%' : 'top 80%',
                            end: isFirst ? 'top 55%' : 'top 30%',
                            scrub: 0.8,
                        },
                    }
                );

                // Active section detection for phase indicator & visuals
                ScrollTrigger.create({
                    trigger: sectionEl,
                    start: 'top 55%',
                    end: 'bottom 45%',
                    onEnter: () => throttledSetActiveSection(section.id),
                    onEnterBack: () => throttledSetActiveSection(section.id),
                });
            });
        }, container);

        return () => ctx.revert();
    }, [throttledSetActiveSection]);

    // ── 2. GSAP-driven visual switching (replaces Framer Motion AnimatePresence) ──
    useEffect(() => {
        const allVisuals = Object.values(visualRefs.current).filter(Boolean);
        const activeEl = visualRefs.current[activeSection];

        // On first render just set initial states without animation
        if (isFirstRender.current) {
            isFirstRender.current = false;
            allVisuals.forEach((el) => {
                if (el === activeEl) {
                    gsap.set(el, { opacity: 1, scale: 1, y: 0 });
                } else {
                    gsap.set(el, { opacity: 0, scale: 0.96, y: 15 });
                }
            });
            return;
        }

        // Fade out all non-active visuals
        allVisuals.forEach((el) => {
            if (el && el !== activeEl) {
                gsap.to(el, {
                    opacity: 0,
                    scale: 0.96,
                    y: -15,
                    duration: 0.35,
                    ease: 'power2.in',
                    overwrite: true,
                });
            }
        });

        // Fade in active visual
        if (activeEl) {
            gsap.fromTo(
                activeEl,
                { opacity: 0, scale: 0.96, y: 15 },
                {
                    opacity: 1,
                    scale: 1,
                    y: 0,
                    duration: 0.5,
                    ease: 'power2.out',
                    delay: 0.12,
                    overwrite: true,
                }
            );
        }
    }, [activeSection]);

    // ── 3. Smooth scroll helper for phase indicator clicks ──
    const scrollToSection = useCallback((id) => {
        const el = sectionRefs.current[id];
        if (el) {
            const offset = 100;
            const top = el.getBoundingClientRect().top + window.scrollY - offset;
            window.scrollTo({ top, behavior: 'smooth' });
        }
    }, []);

    return (
        <section ref={containerRef} className="max-w-7xl mx-auto w-full bg-[var(--theme-surface)]">
            <div className="flex flex-col md:flex-row">

                {/* ── Left Column: Narrative Content ── */}
                <div className="w-full md:w-1/2 relative border-r border-[var(--theme-outline-variant)]">

                    {/* Phase Indicators — Sticky */}
                    <div className="phase-indicator-bar sticky top-[73px] z-40 bg-[var(--theme-surface)]/95 backdrop-blur-sm border-b border-[var(--theme-outline-variant)] py-4 px-6 md:px-12 transition-all">
                        <div className="flex items-center justify-start gap-4 md:gap-8 overflow-x-auto no-scrollbar">
                            {SECTIONS.map((section, index) => {
                                const currentIndex = SECTIONS.findIndex((s) => s.id === activeSection);
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
                            ref={(el) => { sectionRefs.current[section.id] = el; }}
                            className="min-h-[80vh] flex flex-col justify-center px-6 py-20 md:py-24 md:px-12 lg:px-20 border-b border-[var(--theme-outline-variant)] last:border-0 relative"
                        >
                            <div className="mb-12">
                                <div className="flex items-center gap-3 mb-6 scrolly-animate">
                                    <span className="font-mono text-xs uppercase tracking-widest text-[var(--theme-outline)]">
                                        {section.subtitle}
                                    </span>
                                </div>
                                <h2 className="text-4xl md:text-5xl font-bold leading-tight mb-8 scrolly-animate">
                                    {section.title}
                                </h2>
                                <p className="text-lg leading-relaxed font-light text-[var(--theme-ink)] opacity-80 scrolly-animate">
                                    {section.description}
                                </p>
                                <p className="text-sm mt-4 font-mono text-[var(--theme-outline)] scrolly-animate">
                                    {section.status}
                                </p>
                            </div>

                            {/* Sub-points */}
                            <div className="space-y-8 mt-8">
                                {section.subPoints.map((point, idx) => (
                                    <div key={idx} className="group scrolly-animate">
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
                                <div className="mt-16 text-left scrolly-animate">
                                    <Link
                                        href="/blog"
                                        className="inline-flex items-center gap-2 font-mono text-sm group"
                                    >
                                        <span className="border-b border-[var(--theme-outline-variant)] group-hover:border-[var(--theme-primary)] transition-colors pb-1">
                                            进入频道探索更多
                                        </span>
                                        <ArrowRight size={16} className="text-[var(--theme-outline)] group-hover:text-[var(--theme-primary)] transition-colors" />
                                    </Link>
                                </div>
                            )}
                        </section>
                    ))}
                </div>

                {/* ── Right Column: Visual Context (Sticky) — Hidden on mobile ── */}
                <div className="hidden md:block w-1/2 relative">
                    <div
                        ref={visualContainerRef}
                        className="sticky top-[73px] h-[calc(100vh-73px)] w-full p-8 lg:p-12 overflow-hidden flex items-center justify-center"
                    >
                        {Object.entries(VISUALS).map(([id, Visual]) => (
                            <div
                                key={id}
                                ref={(el) => { visualRefs.current[id] = el; }}
                                className={cn(
                                    'absolute inset-8 lg:inset-12 flex items-center justify-center',
                                    id === SECTIONS[0].id ? 'opacity-100' : 'opacity-0'
                                )}
                            >
                                <div className="w-full h-full max-h-[600px]">
                                    <Visual />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </section>
    );
}
