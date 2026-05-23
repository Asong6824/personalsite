"use client";
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const STORY_LINES = [
  'Building digital experiences',
  'with curiosity and precision,',
  'trading insights for clarity,',
  'crafting stories that endure.'
];

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
  elements.forEach((el) => {
    if (el) el.style.willChange = property;
  });
};
const clearWillChange = (elements) => {
  elements.forEach((el) => {
    if (el) el.style.willChange = 'auto';
  });
};

export default function HeroOrbSection() {
  const containerRef = useRef(null);
  const viewportRef = useRef(null);
  const wordRef = useRef(null);
  const orbRef = useRef(null);
  const letterRefs = useRef([]);
  const storyRef = useRef(null);
  const lineRefs = useRef([]);
  const scrollHintRef = useRef(null);
  const cardRef = useRef(null);
  const cardContentRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    const viewport = viewportRef.current;
    const word = wordRef.current;
    const orb = orbRef.current;
    const story = storyRef.current;
    const scrollHint = scrollHintRef.current;
    const card = cardRef.current;
    const cardContent = cardContentRef.current;
    const letters = letterRefs.current.filter(Boolean);
    const lines = lineRefs.current.filter(Boolean);

    if (!container || !viewport || !word || !orb || !story || !scrollHint || !card) return;

    const calculateScales = () => {
      const orbRect = orb.getBoundingClientRect();
      const orbBaseSize = orbRect.width;
      const viewportW = viewport.offsetWidth;
      const viewportH = viewport.offsetHeight;
      const maxViewportDim = Math.max(viewportW, viewportH);
      const orbTotalScale = (maxViewportDim / orbBaseSize) * 2.5;
      return {
        PHASE1_WORD_SCALE: 2,
        PHASE2_ORB_SCALE: orbTotalScale / 2,
      };
    };

    let { PHASE1_WORD_SCALE, PHASE2_ORB_SCALE } = calculateScales();

    // ── Reset all animated elements to initial state ──
    const resetElements = () => {
      gsap.set(word, { scale: 1 });
      gsap.set(orb, { scale: 1, x: 0, y: 0 });
      gsap.set(story, { opacity: 0 });
      gsap.set(scrollHint, { opacity: 0.6 });
      gsap.set(lines, { opacity: 0, y: 30, filter: 'blur(10px)' });
      gsap.set(card, { y: '100vh', opacity: 0, width: '75vw', height: '75vh', borderRadius: '32px' });
      if (cardContent) gsap.set(cardContent, { opacity: 1 });
      letters.forEach((l) => {
        gsap.set(l, { opacity: 1, marginLeft: '0em', marginRight: '0em' });
      });
    };

    // ── Pre-calculate centering offsets ──
    const wordRect = word.getBoundingClientRect();
    const orbRect = orb.getBoundingClientRect();
    const wordCenterX = wordRect.left + wordRect.width / 2;
    const wordCenterY = wordRect.top + wordRect.height / 2;
    const orbCenterX = orbRect.left + orbRect.width / 2;
    const orbCenterY = orbRect.top + orbRect.height / 2;
    const orbOffsetX = orbCenterX - wordCenterX;
    const orbOffsetY = orbCenterY - wordCenterY;
    const compensateX = -orbOffsetX;
    const compensateY = -orbOffsetY;

    const ctx = gsap.context(() => {
      // Hint browser to optimize compositing for animated properties
      setWillChange([word], 'transform');
      setWillChange([orb], 'transform');
      setWillChange(lines, 'transform, filter');
      setWillChange(letters, 'margin');
      setWillChange([card], 'transform, width, height');

      resetElements();

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: container,
          start: 'top top',
          end: 'bottom bottom',
          scrub: true,
          pin: viewport,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onLeaveBack: resetElements,
        },
      });

      // Phase 1 (0~18%): Word放大，字母间距拉开
      tl.fromTo(word, { scale: 1 }, { scale: PHASE1_WORD_SCALE, ease: 'none', duration: 0.18 }, 0);
      letters.forEach((letter, i) => {
        tl.fromTo(
          letter,
          { marginLeft: '0em', marginRight: '0em' },
          {
            marginLeft: i === 0 ? '0em' : '0.04em',
            marginRight: i === letters.length - 1 ? '0em' : '0.04em',
            ease: 'none',
            duration: 0.18,
          },
          0
        );
      });

      // Phase 2 (18~20%): Orb瞬间放大+移动到视口中心
      tl.fromTo(
        orb,
        { scale: 1, x: 0, y: 0 },
        {
          scale: PHASE2_ORB_SCALE,
          x: compensateX,
          y: compensateY,
          ease: 'power4.in',
          duration: 0.02,
        },
        0.18
      );

      // Phase 3 (20~36%): 字母淡出
      letters.forEach((letter) => {
        tl.fromTo(letter, { opacity: 1 }, { opacity: 0, ease: 'power2.in', duration: 0.16 }, 0.20);
      });

      // Phase 4 (30~78%): 文案逐行浮现
      lines.forEach((line, i) => {
        tl.fromTo(
          line,
          { opacity: 0, y: 30, filter: 'blur(10px)' },
          { opacity: 1, y: 0, filter: 'blur(0px)', ease: 'power2.out', duration: 0.08 },
          0.30 + i * 0.07
        );
      });

      // Phase 5 (0~6%): 滚动提示消失
      tl.fromTo(scrollHint, { opacity: 0.6 }, { opacity: 0, ease: 'power2.in', duration: 0.06 }, 0);

      // Phase 6 (66~86%): 圆角卡片从下方移入
      tl.fromTo(card, { y: '100vh', opacity: 0 }, { y: 0, opacity: 1, ease: 'power2.out', duration: 0.20 }, 0.66);

      // Phase 7 (86~100%): 卡片铺满全屏 + 内容淡出
      tl.to(card, { width: '100vw', height: '100vh', borderRadius: '0px', ease: 'power2.inOut', duration: 0.14 }, 0.86);
      if (cardContent) {
        tl.to(cardContent, { opacity: 0, ease: 'power2.in', duration: 0.10 }, 0.86);
      }
    }, container);

    // Debounced resize handler to avoid excessive ScrollTrigger.refresh() calls
    const debouncedResize = debounce(() => {
      const newScales = calculateScales();
      PHASE1_WORD_SCALE = newScales.PHASE1_WORD_SCALE;
      PHASE2_ORB_SCALE = newScales.PHASE2_ORB_SCALE;
      ScrollTrigger.refresh();
    }, 150);

    window.addEventListener('resize', debouncedResize);

    return () => {
      window.removeEventListener('resize', debouncedResize);
      clearWillChange([word, orb, card, ...lines, ...letters]);
      ctx.revert();
    };
  }, []);

  return (
    <div ref={containerRef} style={{ height: '500vh', position: 'relative' }}>
      <div
        ref={viewportRef}
        style={{
          width: '100vw',
          height: '100vh',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#FFFFFF',
          position: 'relative',
        }}
      >
        {/* Asong 文字容器 */}
        <div
          ref={wordRef}
          style={{
            display: 'inline-block',
            position: 'relative',
            zIndex: 10,
            fontFamily: '"Helvetica Neue", Arial, sans-serif',
            fontSize: 'clamp(64px, 10vw, 120px)',
            fontWeight: 400,
            color: '#3D3A36',
            lineHeight: 1,
          }}
        >
          <span ref={(el) => { letterRefs.current[0] = el }} style={{ display: 'inline-block', verticalAlign: 'baseline' }}>
            A
          </span>
          <span ref={(el) => { letterRefs.current[1] = el }} style={{ display: 'inline-block', verticalAlign: 'baseline' }}>
            s
          </span>
          <div
            ref={orbRef}
            className="orb-gradient"
            style={{
              display: 'inline-block',
              verticalAlign: 'baseline',
              position: 'relative',
              zIndex: 1,
              width: '0.52em',
              height: '0.52em',
              borderRadius: '50%',
            }}
          />
          <span ref={(el) => { letterRefs.current[2] = el }} style={{ display: 'inline-block', verticalAlign: 'baseline' }}>
            n
          </span>
          <span ref={(el) => { letterRefs.current[3] = el }} style={{ display: 'inline-block', verticalAlign: 'baseline' }}>
            g
          </span>
        </div>

        {/* 文案层 */}
        <div ref={storyRef} className="story-text">
          {STORY_LINES.map((line, index) => (
            <div key={index} ref={(el) => { lineRefs.current[index] = el }} className="line">
              {line}
            </div>
          ))}
        </div>

        {/* 圆角卡片 */}
        <div
          ref={cardRef}
          style={{
            position: 'absolute',
            width: '75vw',
            height: '75vh',
            borderRadius: '32px',
            background: '#EBE3D5',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            zIndex: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            boxShadow: '0 25px 80px rgba(61, 58, 54, 0.08)',
          }}
        >
          <div ref={cardContentRef} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div
              style={{
                fontFamily: '"Helvetica Neue", Arial, sans-serif',
                fontSize: 'clamp(2rem, 5vw, 4rem)',
                fontWeight: 300,
                color: '#00A9E0',
                letterSpacing: '0.05em',
                lineHeight: 1.4,
                textAlign: 'center',
              }}
            >
              The story<br />continues...
            </div>
            <div
              style={{
                marginTop: '2rem',
                fontSize: 'clamp(0.875rem, 2vw, 1.25rem)',
                fontWeight: 300,
                color: '#00A9E0',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
              }}
            >
              Scroll to begin
            </div>
          </div>
        </div>

        {/* 滚动提示 */}
        <div ref={scrollHintRef} className="scroll-hint">
          SCROLL
        </div>
      </div>
    </div>
  );
}
