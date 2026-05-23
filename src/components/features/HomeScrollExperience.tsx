"use client";
import { useEffect, useRef, useState, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SECTIONS } from './Scrollytelling/constants';
import { PhaseIndicator } from './Scrollytelling/PhaseIndicator';
import { VISUALS } from './Scrollytelling/Visuals';

gsap.registerPlugin(ScrollTrigger);

// ── Constants ──
const STORY_LINES = [
  'Building digital experiences',
  'with curiosity and precision,',
  'trading insights for clarity,',
  'crafting stories that endure.'
];

const HERO_END = 0.45; // Hero 动画在 timeline 45% 处结束

// ── Utility: Debounce ──
const debounce = (fn, delay) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};

// ── Utility: will-change management ──
const setWillChange = (elements, property) => {
  elements.forEach((el) => { if (el) el.style.willChange = property; });
};
const clearWillChange = (elements) => {
  elements.forEach((el) => { if (el) el.style.willChange = 'auto'; });
};

export default function HomeScrollExperience() {
  // ── Master container ──
  const masterRef = useRef(null);

  // ── Hero refs ──
  const heroContainerRef = useRef(null);
  const viewportRef = useRef(null);
  const wordRef = useRef(null);
  const orbRef = useRef(null);
  const letterRefs = useRef([]);
  const storyRef = useRef(null);
  const lineRefs = useRef([]);
  const scrollHintRef = useRef(null);
  const cardRef = useRef(null);
  const cardContentRef = useRef(null);

  // ── Scrollytelling refs ──
  const sectionRefs = useRef({});
  const visualRefs = useRef({});
  const isFirstRender = useRef(true);

  // ── State ──
  const [activeSection, setActiveSection] = useState(SECTIONS[0].id);

  // ── Smooth scroll helper ──
  const scrollToSection = useCallback((id) => {
    const el = sectionRefs.current[id];
    if (el) {
      const offset = 100;
      const top = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  }, []);

  // ═══════════════════════════════════════════════════════════════
  //  MASTER TIMELINE — Single GSAP timeline controls everything
  // ═══════════════════════════════════════════════════════════════
  useEffect(() => {
    const master = masterRef.current;
    const viewport = viewportRef.current;
    const word = wordRef.current;
    const orb = orbRef.current;
    const story = storyRef.current;
    const scrollHint = scrollHintRef.current;
    const card = cardRef.current;
    const cardContent = cardContentRef.current;
    const letters = letterRefs.current.filter(Boolean);
    const lines = lineRefs.current.filter(Boolean);

    if (!master || !viewport || !word || !orb || !story || !scrollHint || !card) return;

    // ── Hero scale calculations ──
    const calculateScales = () => {
      const orbRect = orb.getBoundingClientRect();
      const orbBaseSize = orbRect.width;
      const viewportW = viewport.offsetWidth;
      const viewportH = viewport.offsetHeight;
      const maxViewportDim = Math.max(viewportW, viewportH);
      const orbTotalScale = (maxViewportDim / orbBaseSize) * 2.5;
      return { PHASE1_WORD_SCALE: 2, PHASE2_ORB_SCALE: orbTotalScale / 2 };
    };

    let { PHASE1_WORD_SCALE, PHASE2_ORB_SCALE } = calculateScales();

    // ── Pre-calculate centering offsets ──
    const wordRect = word.getBoundingClientRect();
    const orbRect = orb.getBoundingClientRect();
    const wordCenterX = wordRect.left + wordRect.width / 2;
    const wordCenterY = wordRect.top + wordRect.height / 2;
    const orbCenterX = orbRect.left + orbRect.width / 2;
    const orbCenterY = orbRect.top + orbRect.height / 2;
    const compensateX = -(orbCenterX - wordCenterX);
    const compensateY = -(orbCenterY - wordCenterY);

    const ctx = gsap.context(() => {
      // Optimize compositing
      setWillChange([word], 'transform');
      setWillChange([orb], 'transform');
      setWillChange(lines, 'transform, filter');
      setWillChange(letters, 'margin');
      setWillChange([card], 'transform, width, height');

      // ── Reset initial states ──
      const resetHero = () => {
        gsap.set(word, { scale: 1 });
        gsap.set(orb, { scale: 1, x: 0, y: 0 });
        gsap.set(story, { opacity: 0 });
        gsap.set(scrollHint, { opacity: 0.6 });
        gsap.set(lines, { opacity: 0, y: 30, filter: 'blur(10px)' });
        gsap.set(card, { y: '100vh', opacity: 0, width: '75vw', height: '75vh', borderRadius: '32px' });
        if (cardContent) gsap.set(cardContent, { opacity: 1 });
        letters.forEach((l) => gsap.set(l, { opacity: 1, marginLeft: '0em', marginRight: '0em' }));
      };
      resetHero();

      // ═══════════════════════════════════════════════
      //  MASTER TIMELINE
      // ═══════════════════════════════════════════════
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: master,
          start: 'top top',
          end: 'bottom bottom',
          scrub: true,
          invalidateOnRefresh: true,
          onLeaveBack: resetHero,
        },
      });

      // 独立的顶部检测触发器：当从下方 scroll 回到页面最顶部时强制 reset
      //（master timeline 的 start: 'top top' 导致 onLeaveBack 永远不会触发，
      //  因为无法 scroll 到负位置。此 trigger 作为补偿保险。）
      ScrollTrigger.create({
        trigger: master,
        start: 'top top',
        onEnterBack: resetHero,
      });

      const H = HERO_END;

      // ── Phase 1 (0~18% of Hero): Word放大 ──
      tl.fromTo(word, { scale: 1 }, { scale: PHASE1_WORD_SCALE, ease: 'none', duration: H * 0.18 }, 0);
      letters.forEach((letter, i) => {
        tl.fromTo(letter,
          { marginLeft: '0em', marginRight: '0em' },
          { marginLeft: i === 0 ? '0em' : '0.04em', marginRight: i === letters.length - 1 ? '0em' : '0.04em', ease: 'none', duration: H * 0.18 },
          0
        );
      });

      // ── Phase 2 (18~20%): Orb放大 ──
      tl.fromTo(orb, { scale: 1, x: 0, y: 0 },
        { scale: PHASE2_ORB_SCALE, x: compensateX, y: compensateY, ease: 'power4.in', duration: H * 0.02 },
        H * 0.18
      );

      // ── Phase 3 (20~36%): 字母淡出 ──
      letters.forEach((letter) => {
        tl.fromTo(letter, { opacity: 1 }, { opacity: 0, ease: 'power2.in', duration: H * 0.16 }, H * 0.20);
      });

      // ── Phase 4 (30~78%): 文案逐行浮现 ──
      lines.forEach((line, i) => {
        tl.fromTo(line,
          { opacity: 0, y: 30, filter: 'blur(10px)' },
          { opacity: 1, y: 0, filter: 'blur(0px)', ease: 'power2.out', duration: H * 0.08 },
          H * (0.30 + i * 0.07)
        );
      });

      // ── Phase 5 (0~6%): 滚动提示消失 ──
      tl.fromTo(scrollHint, { opacity: 0.6 }, { opacity: 0, ease: 'power2.in', duration: H * 0.06 }, 0);

      // ── Phase 6 (66~86%): 卡片移入 ──
      tl.fromTo(card, { y: '100vh', opacity: 0 }, { y: 0, opacity: 1, ease: 'power2.out', duration: H * 0.20 }, H * 0.66);

      // ── Phase 7 (86~100%): 卡片铺满 + 内容淡出 + viewport淡出 ──
      tl.to(card, { width: '100vw', height: '100vh', borderRadius: '0px', ease: 'power2.inOut', duration: H * 0.10 }, H * 0.86);
      if (cardContent) {
        tl.to(cardContent, { opacity: 0, ease: 'power2.in', duration: H * 0.08 }, H * 0.86);
      }
      tl.to(viewport, { opacity: 0, ease: 'power2.in', duration: H * 0.06 }, H * 0.94);

      // ═══════════════════════════════════════════════
      //  SCROLLYTELLING — entrance animations on master timeline
      // ═══════════════════════════════════════════════
      const S = H;

      // Phase Indicator entrance
      const indicatorBar = master.querySelector('.phase-indicator-bar');
      if (indicatorBar) {
        tl.fromTo(indicatorBar,
          { y: -20, opacity: 0 },
          { y: 0, opacity: 1, ease: 'power2.out', duration: 0.06 },
          S + 0.02
        );
      }

      // Section entrances — staggered on master timeline
      SECTIONS.forEach((section, index) => {
        const sectionEl = sectionRefs.current[section.id];
        if (!sectionEl) return;

        const animateEls = sectionEl.querySelectorAll('.scrolly-animate');
        const startPos = S + 0.04 + index * 0.12;

        tl.fromTo(animateEls,
          { y: index === 0 ? 60 : 50, opacity: 0 },
          { y: 0, opacity: 1, stagger: 0.04, duration: 0.08, ease: 'power2.out' },
          startPos
        );
      });

      // ═══════════════════════════════════════════════
      //  ACTIVE SECTION DETECTION — independent ScrollTriggers
      // ═══════════════════════════════════════════════
      SECTIONS.forEach((section) => {
        const sectionEl = sectionRefs.current[section.id];
        if (!sectionEl) return;
        ScrollTrigger.create({
          trigger: sectionEl,
          start: 'top 55%',
          end: 'bottom 45%',
          onEnter: () => setActiveSection(section.id),
          onEnterBack: () => setActiveSection(section.id),
        });
      });
    }, master);

    // Debounced resize
    const debouncedResize = debounce(() => {
      const newScales = calculateScales();
      PHASE1_WORD_SCALE = newScales.PHASE1_WORD_SCALE;
      PHASE2_ORB_SCALE = newScales.PHASE2_ORB_SCALE;
      ScrollTrigger.refresh();
    }, 150);
    window.addEventListener('resize', debouncedResize);

    return () => {
      window.removeEventListener('resize', debouncedResize);
      clearWillChange([word, orb, card, viewport, ...lines, ...letters]);
      ctx.revert();
    };
  }, []);

  // ═══════════════════════════════════════════════════════════════
  //  VISUAL SWITCHING — GSAP-driven (same as before)
  // ═══════════════════════════════════════════════════════════════
  useEffect(() => {
    const allVisuals = Object.values(visualRefs.current).filter(Boolean) as HTMLElement[];
    const activeEl = visualRefs.current[activeSection];

    if (isFirstRender.current) {
      isFirstRender.current = false;
      allVisuals.forEach((el) => {
        if (el === activeEl) gsap.set(el, { opacity: 1, scale: 1, y: 0 });
        else gsap.set(el, { opacity: 0, scale: 0.96, y: 15 });
      });
      return;
    }

    allVisuals.forEach((el) => {
      if (el && el !== activeEl) {
        gsap.to(el, { opacity: 0, scale: 0.96, y: -15, duration: 0.35, ease: 'power2.in', overwrite: true });
      }
    });

    if (activeEl) {
      gsap.fromTo(activeEl,
        { opacity: 0, scale: 0.96, y: 15 },
        { opacity: 1, scale: 1, y: 0, duration: 0.5, ease: 'power2.out', delay: 0.12, overwrite: true }
      );
    }
  }, [activeSection]);

  return (
    <div ref={masterRef}>
      {/* ═══════════════════════════════════════════════════════
          HERO — 500vh scroll distance, sticky viewport
          ═══════════════════════════════════════════════════════ */}
      <div ref={heroContainerRef} style={{ height: '500vh' }}>
        <div
          ref={viewportRef}
          className="sticky top-0 h-screen overflow-hidden flex items-center justify-center"
          style={{ background: '#FFFFFF' }}
        >
          {/* Asong 文字 */}
          <div
            ref={wordRef}
            style={{
              display: 'inline-block', position: 'relative', zIndex: 10,
              fontFamily: '"Helvetica Neue", Arial, sans-serif',
              fontSize: 'clamp(64px, 10vw, 120px)', fontWeight: 400,
              color: '#3D3A36', lineHeight: 1,
            }}
          >
            <span ref={(el) => { letterRefs.current[0] = el }}
              style={{ display: 'inline-block', verticalAlign: 'baseline' }}>A</span>
            <span ref={(el) => { letterRefs.current[1] = el }}
              style={{ display: 'inline-block', verticalAlign: 'baseline' }}>s</span>
            <div
              ref={orbRef}
              className="orb-gradient"
              style={{
                display: 'inline-block', verticalAlign: 'baseline',
                position: 'relative', zIndex: 1,
                width: '0.52em', height: '0.52em', borderRadius: '50%',
              }}
            />
            <span ref={(el) => { letterRefs.current[2] = el }}
              style={{ display: 'inline-block', verticalAlign: 'baseline' }}>n</span>
            <span ref={(el) => { letterRefs.current[3] = el }}
              style={{ display: 'inline-block', verticalAlign: 'baseline' }}>g</span>
          </div>

          {/* 文案层 */}
          <div ref={storyRef} className="story-text">
            {STORY_LINES.map((line, i) => (
              <div key={i} ref={(el) => { lineRefs.current[i] = el }} className="line">{line}</div>
            ))}
          </div>

          {/* 圆角卡片 */}
          <div
            ref={cardRef}
            style={{
              position: 'absolute', width: '75vw', height: '75vh', borderRadius: '32px',
              background: '#EBE3D5', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
              zIndex: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column',
              boxShadow: '0 25px 80px rgba(61, 58, 54, 0.08)',
            }}
          >
            <div ref={cardContentRef} className="flex flex-col items-center justify-center">
              <div style={{
                fontFamily: '"Helvetica Neue", Arial, sans-serif',
                fontSize: 'clamp(2rem, 5vw, 4rem)', fontWeight: 300,
                color: '#00A9E0', letterSpacing: '0.05em', lineHeight: 1.4, textAlign: 'center',
              }}>
                The story<br />continues...
              </div>
              <div style={{
                marginTop: '2rem', fontSize: 'clamp(0.875rem, 2vw, 1.25rem)',
                fontWeight: 300, color: '#00A9E0', letterSpacing: '0.15em', textTransform: 'uppercase',
              }}>
                Scroll to begin
              </div>
            </div>
          </div>

          {/* 滚动提示 */}
          <div ref={scrollHintRef} className="scroll-hint">SCROLL</div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════
          SCROLLYTELLING — natural flow after Hero
          ═══════════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto w-full bg-[var(--theme-surface)]">
        <div className="flex flex-col md:flex-row">

          {/* Left Column */}
          <div className="w-full md:w-1/2 relative border-r border-[var(--theme-outline-variant)]">

            {/* Phase Indicator */}
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

            {/* Sections */}
            {SECTIONS.map((section) => (
              <section
                key={section.id}
                id={section.id}
                ref={(el) => { sectionRefs.current[section.id] = el; }}
                className="min-h-[80vh] flex flex-col justify-center px-6 py-20 md:py-24 md:px-12 lg:px-20 border-b border-[var(--theme-outline-variant)] last:border-0 relative"
              >
                <div className="mb-12">
                  <div className="flex items-center gap-3 mb-6 scrolly-animate">
                    <span className="font-mono text-xs uppercase tracking-widest text-[var(--theme-outline)]">{section.subtitle}</span>
                  </div>
                  <h2 className="text-4xl md:text-5xl font-bold leading-tight mb-8 scrolly-animate">{section.title}</h2>
                  <p className="text-lg leading-relaxed font-light text-[var(--theme-ink)] opacity-80 scrolly-animate">{section.description}</p>
                  <p className="text-sm mt-4 font-mono text-[var(--theme-outline)] scrolly-animate">{section.status}</p>
                </div>

                <div className="space-y-8 mt-8">
                  {section.subPoints.map((point, idx) => (
                    <div key={idx} className="group scrolly-animate">
                      <div className="flex items-baseline gap-4 mb-2">
                        <span className="text-xs font-mono transition-colors text-[var(--theme-outline)] group-hover:text-[var(--theme-primary)]">{section.stepNumber}.{idx + 1}</span>
                        <h4 className="text-sm font-bold uppercase tracking-wide">{point.label}</h4>
                      </div>
                      <p className="text-sm pl-8 md:pl-10 border-l border-[var(--theme-outline-variant)] transition-colors opacity-70 group-hover:border-[var(--theme-primary)]">{point.text}</p>
                    </div>
                  ))}
                </div>

                {section.id === 'finance' && (
                  <div className="mt-16 text-left scrolly-animate">
                    <Link href="/blog" className="inline-flex items-center gap-2 font-mono text-sm group">
                      <span className="border-b border-[var(--theme-outline-variant)] group-hover:border-[var(--theme-primary)] transition-colors pb-1">进入频道探索更多</span>
                      <ArrowRight size={16} className="text-[var(--theme-outline)] group-hover:text-[var(--theme-primary)] transition-colors" />
                    </Link>
                  </div>
                )}
              </section>
            ))}
          </div>

          {/* Right Column: Visuals */}
          <div className="hidden md:block w-1/2 relative">
            <div className="sticky top-[73px] h-[calc(100vh-73px)] w-full p-8 lg:p-12 overflow-hidden flex items-center justify-center">
              {Object.entries(VISUALS).map(([id, Visual]) => (
                <div
                  key={id}
                  ref={(el) => { visualRefs.current[id] = el; }}
                  className={cn(
                    'absolute inset-8 lg:inset-12 flex items-center justify-center',
                    id === SECTIONS[0].id ? 'opacity-100' : 'opacity-0'
                  )}
                >
                  <div className="w-full h-full max-h-[600px]"><Visual /></div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}
