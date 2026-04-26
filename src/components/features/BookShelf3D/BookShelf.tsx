'use client';
import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import booksData from '../../../content/books.json';

const items = booksData.map((book, i) => ({
  id: book.id || String(i),
  year: book.year,
  title: book.title,
  volume: book.author || `Vol. ${i + 1}`, // map author to the volume subtext area
  description: book.description,
  coverUrl: book.coverUrl,
}));

export function BookShelf() {
  const containerRef = useRef<HTMLElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  
  const [openedBook, setOpenedBook] = useState<typeof items[0] | null>(null);
  const activeIndexRef = useRef<number>(Math.round((items.length - 1) / 2));
  
  // Text container DOM refs for blazing-fast 60fps updates without React re-renders
  const textContainerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const volRef = useRef<HTMLParagraphElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    // --- DIAGONAL ISOMETRIC-STYLE MATH DEFINITIONS ---
    const SPACING_X = 62; 
    const SPACING_Y = -17; 
    
    // Static angles: Removed X rotation (pitch) so the books remain standing 
    const STATIC_ROT_Y = -38; 
    const STATIC_ROT_X = 0; 
    
    // Interaction constraints
    const PUSH_SLOTS = 2.2;  
    const PUSH_RADIUS = 3.5; 

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let isHovered = false;
    let lockedTargetIndex = Math.round((items.length - 1) / 2); 
    let smoothTargetIndex = lockedTargetIndex;
    let smoothHover = 0; 
    let lastActiveIndex = -1; 
    
    // Low-pass filter array for each individual book's "pop out" state
    const cardFocusArray = new Float32Array(items.length).fill(0);

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      isHovered = true;
    };

    const onMouseLeave = () => {
      isHovered = false;
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousemove', onMouseMove);
      container.addEventListener('mouseleave', onMouseLeave);
      container.addEventListener('mouseenter', onMouseMove);
    }

    const updateCoverflow = () => {
      const numItems = items.length;
      const screenW = window.innerWidth;
      const screenH = window.innerHeight;

      // 1) Calculate mapping of MouseX -> Array Index
      const isMouseInSliderZone = isHovered && (mouseY < screenH * 0.62);
      
      if (isMouseInSliderZone) {
        const padding = Math.min(250, screenW * 0.15);
        const workArea = screenW - padding * 2;
        const clampedX = Math.max(0, Math.min(workArea, mouseX - padding));
        const progress = clampedX / workArea;
        lockedTargetIndex = progress * (numItems - 1);
      } else {
        lockedTargetIndex = Math.round(lockedTargetIndex);
      }

      smoothTargetIndex += (lockedTargetIndex - smoothTargetIndex) * 0.08;
      smoothHover += (1 - smoothHover) * 0.06;

      const trackOffX = screenW / 2 - (smoothTargetIndex * SPACING_X);
      const trackOffY = screenH * 0.45 - (smoothTargetIndex * SPACING_Y);

      const activeIdx = Math.round(smoothTargetIndex);
      
      if (activeIdx >= 0 && activeIdx < numItems) {
         if (activeIdx !== lastActiveIndex) {
           lastActiveIndex = activeIdx;
           activeIndexRef.current = activeIdx;
         }
         if (titleRef.current && titleRef.current.innerText !== items[activeIdx].title) {
           titleRef.current.innerText = items[activeIdx].title;
           if (volRef.current) volRef.current.innerText = items[activeIdx].volume || '';
           if (descRef.current) descRef.current.innerText = items[activeIdx].description || '';
         }
      }
      
      if (textContainerRef.current) {
         gsap.set(textContainerRef.current, {
            autoAlpha: smoothHover,
            y: (1 - smoothHover) * 20
         });
      }

      cardRefs.current.forEach((card, i) => {
        if (!card) return;

        const baseX = i * SPACING_X;
        const baseY = i * SPACING_Y;
        
        let targetX = trackOffX + baseX;
        let targetY = trackOffY + baseY;

        const dist = i - smoothTargetIndex;

        const pushFactor = Math.tanh(dist * 2.5);
        const xPush = pushFactor * (PUSH_SLOTS * SPACING_X) * smoothHover;
        const yPush = pushFactor * (PUSH_SLOTS * SPACING_Y) * smoothHover;
        
        const idealFocus = Math.max(0, 1 - Math.abs(dist * 1.5));
        
        if (idealFocus > cardFocusArray[i]) {
            cardFocusArray[i] += (idealFocus - cardFocusArray[i]) * 0.055; 
        } else {
            cardFocusArray[i] += (idealFocus - cardFocusArray[i]) * 0.15;  
        }
        
        const e_smooth_focus = cardFocusArray[i] * smoothHover;

        const scale = 1 + e_smooth_focus * 0.65; 
        const rotateY = STATIC_ROT_Y + e_smooth_focus * (-STATIC_ROT_Y); 
        const rotateX = STATIC_ROT_X + e_smooth_focus * (-STATIC_ROT_X); 
        
        const baseZIndex = numItems - i;
        const activeZIndex = Math.round(e_smooth_focus * 1000);

        gsap.set(card, {
          x: targetX + xPush,
          y: targetY + yPush,
          z: e_smooth_focus * 250, 
          rotateY: rotateY,
          rotateX: rotateX,
          scale: scale,
          zIndex: baseZIndex + activeZIndex,
          transformOrigin: "center center"
        });
      });
    };

    gsap.ticker.add(updateCoverflow);
    updateCoverflow(); 

    return () => {
      gsap.ticker.remove(updateCoverflow);
      if (container) {
        container.removeEventListener('mousemove', onMouseMove);
        container.removeEventListener('mouseleave', onMouseLeave);
        container.removeEventListener('mouseenter', onMouseMove);
      }
    };
  }, []);

  return (
    <div className="relative w-full h-[100dvh] flex flex-col items-center justify-center overflow-hidden select-none font-sans">
      <main 
        ref={containerRef}
        className="w-full h-full cursor-ew-resize flex items-center"
        style={{ perspective: '4000px', perspectiveOrigin: '50% -120%', transformStyle: 'preserve-3d' }}
      >
        {items.map((_, reverse_i) => {
          const i = items.length - 1 - reverse_i;
          const item = items[i];
          return (
          <div
            key={item.id}
            ref={(el) => {
              cardRefs.current[i] = el;
            }}
            className="absolute top-0 left-0 will-change-transform"
            style={{
              width: '180px',
              height: '252px', 
              marginLeft: '-90px',
              marginTop: '-126px',
              transformStyle: 'preserve-3d', 
            }}
          >
            {/* --- SHADOW PLATE --- */}
            <div 
              className="absolute inset-0 bg-transparent"
              style={{
                transform: 'translateZ(-17px)', 
                boxShadow: '-15px 25px 25px rgba(0,0,0,0.25)', 
                pointerEvents: 'none'
              }}
            ></div>

            {/* --- 3D FACE: FRONT --- */}
            <div 
              className="absolute inset-0 flex bg-white"
              style={{
                transform: 'translateZ(16px)', 
                backfaceVisibility: 'hidden',
                boxShadow: 'inset 0 0 0 3px white', 
              }}
            >
              <div className="w-full h-full relative overflow-hidden group">
                 <img 
                   src={item.coverUrl} 
                   loading="lazy"
                   alt={item.title} 
                   referrerPolicy="no-referrer"
                   className="w-full h-full object-cover" 
                 />
                 <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-500" />
                 <div className="absolute inset-0 border-[3px] border-white pointer-events-none" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 pointer-events-none z-30" />
            </div>

            {/* --- 3D FACE: BACK --- */}
            <div 
              className="absolute inset-0 bg-[#e8e8e8]"
              style={{
                transform: 'rotateY(180deg) translateZ(16px)',
                boxShadow: 'inset 0 0 0 3px white',
              }}
            ></div>

            {/* --- 3D FACE: RIGHT (Paper Edge) --- */}
            <div 
              className="absolute top-0 bg-[#f4f1e9]"
              style={{
                width: '32px', height: '100%', left: '50%', marginLeft: '-16px',
                transform: 'rotateY(90deg) translateZ(90px)',
                borderTop: '3px solid white', borderBottom: '3px solid white',
                backgroundImage: 'repeating-linear-gradient(to right, transparent, transparent 1px, rgba(0,0,0,0.04) 2px, transparent 3px)',
                boxShadow: 'inset 2px 0 10px rgba(0,0,0,0.02)'
              }}
            ></div>

            {/* --- 3D FACE: LEFT (Paper Edge) --- */}
            <div 
              className="absolute top-0 bg-[#f4f1e9]"
              style={{
                width: '32px', height: '100%', left: '50%', marginLeft: '-16px',
                transform: 'rotateY(-90deg) translateZ(90px)',
                borderTop: '3px solid white', borderBottom: '3px solid white',
                backgroundImage: 'repeating-linear-gradient(to right, transparent, transparent 1px, rgba(0,0,0,0.04) 2px, transparent 3px)'
              }}
            ></div>

            {/* --- 3D FACE: TOP (Paper Edge) --- */}
            <div 
              className="absolute left-0 bg-[#f4f1e9]"
              style={{
                width: '100%', height: '32px', top: '50%', marginTop: '-16px',
                transform: 'rotateX(90deg) translateZ(126px)',
                borderLeft: '3px solid white', borderRight: '3px solid white',
                backgroundImage: 'repeating-linear-gradient(to bottom, transparent, transparent 1px, rgba(0,0,0,0.04) 2px, transparent 3px)'
              }}
            ></div>

            {/* --- 3D FACE: BOTTOM (Paper Edge) --- */}
            <div 
              className="absolute left-0 bg-[#f4f1e9]"
              style={{
                width: '100%', height: '32px', top: '50%', marginTop: '-16px',
                transform: 'rotateX(-90deg) translateZ(126px)',
                borderLeft: '3px solid white', borderRight: '3px solid white',
                backgroundImage: 'repeating-linear-gradient(to bottom, transparent, transparent 1px, rgba(0,0,0,0.04) 2px, transparent 3px)'
              }}
            ></div>
          </div>
          );
        })}
      </main>

      {/* DYNAMIC TEXT CONTAINER */}
      <div 
        ref={textContainerRef} 
        className="absolute bottom-[5%] left-1/2 -translate-x-1/2 w-full max-w-2xl flex flex-col items-center justify-start text-center opacity-0 px-6 z-50 pointer-events-none"
      >
        <h2 
          ref={titleRef} 
          className="text-[22px] md:text-[28px] font-medium text-gray-800 dark:text-gray-100 mb-3 leading-tight tracking-tight max-w-[90%]"
        >
        </h2>
        
        <div className="flex items-center space-x-8 mb-4 pointer-events-auto">
          <p ref={volRef} className="text-[13px] md:text-[14px] font-bold text-[#df3926] tracking-wider uppercase"></p>
        </div>
        
        <p 
          ref={descRef} 
          className="text-[13px] md:text-[15px] font-serif text-gray-500 max-w-[75%] mx-auto leading-relaxed mb-6"
        >
        </p>

        <button 
          type="button"
          onClick={() => {
            if (items[activeIndexRef.current]) {
              setOpenedBook(items[activeIndexRef.current]);
            }
          }}
          className="relative pointer-events-auto px-8 py-2.5 bg-[#1a1a1a] dark:bg-white text-white dark:text-black text-sm font-medium tracking-[0.1em] rounded-full shadow-xl hover:scale-105 hover:bg-black dark:hover:bg-neutral-200 transition-all z-[60]"
        >
          翻开阅读
        </button>
      </div>

      {/* --- OPENED BOOK 3D VIEWER OVERLAY --- */}
      {openedBook && (
        <OpenBookViewer book={openedBook} onClose={() => setOpenedBook(null)} />
      )}
    </div>
  );
}

function OpenBookViewer({ book, onClose }: { book: typeof items[0], onClose: () => void }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setStep(1), 50);
    const t2 = setTimeout(() => setStep(2), 650);
    const t3 = setTimeout(() => setStep(3), 850);
    const t4 = setTimeout(() => setStep(4), 1050);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, []);

  const w = 340;
  const h = 476;

  return (
    <div className={`fixed inset-0 z-[100] bg-[#f4f6f7]/95 dark:bg-[#0c0c0c]/95 backdrop-blur-md flex items-center justify-center font-sans tracking-wide transition-opacity duration-700 ease-out ${step > 0 ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
      <button 
        onClick={onClose} 
        className="absolute top-8 right-8 z-[110] p-3 text-gray-500 hover:text-black dark:hover:text-white bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 rounded-full transition-colors cursor-pointer"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
      </button>
      
      <div style={{ perspective: '3000px' }}>
        <div 
          className="relative transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{ 
            width: w, height: h, transformStyle: 'preserve-3d',
            transform: step > 0 ? `translateX(${w/2}px)` : 'translateX(0px)'
          }}
        >
           {/* RIGHT SIDE STATIC SPREAD */}
           <div 
             className="absolute inset-0 bg-[#faf9f6] flex flex-col px-10 py-12 shadow-2xl items-center justify-start text-center border-l shadow-[-10px_0_20px_rgba(0,0,0,0.05)] border-gray-200"
           >
              <h3 className="text-[11px] font-bold tracking-[0.25em] text-gray-400 mb-8 uppercase line-clamp-1 text-black">{book.title}</h3>
              <img src={book.coverUrl} referrerPolicy="no-referrer" className="w-full h-56 object-cover mb-8 rounded-sm shadow-inner grayscale contrast-125 opacity-90" />
              <p className="text-gray-600 leading-relaxed text-[13px] font-serif text-justify line-clamp-4 text-black">
                {book.description}
              </p>
           </div>

           {/* FRONT COVER */}
           <div 
             className="absolute inset-0 origin-left transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
             style={{ 
               transformStyle: 'preserve-3d', 
               transform: step > 0 ? 'rotateY(-180deg)' : 'rotateY(0deg)',
               zIndex: 40 
             }}
           >
             <div className="absolute inset-0 bg-white" style={{ backfaceVisibility: 'hidden' }}>
                <img src={book.coverUrl} referrerPolicy="no-referrer" className="w-full h-full object-cover shadow-2xl" />
             </div>
             <div className="absolute inset-0 bg-[#e8e8e8]" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}></div>
           </div>

           {/* FLIPPING PAGE 1 */}
           <div 
             className="absolute inset-0 origin-left transition-transform duration-[1000ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
             style={{ 
               transformStyle: 'preserve-3d', 
               transform: step > 1 ? 'rotateY(-180deg)' : 'rotateY(0deg)',
               zIndex: 30 
             }}
           >
             <div className="absolute inset-0 bg-white border-r border-[#f0f0f0]" style={{ backfaceVisibility: 'hidden' }}>
                <img src={book.coverUrl} referrerPolicy="no-referrer" className="w-full h-full object-cover opacity-10" />
             </div>
             <div className="absolute inset-0 bg-[#faf9f6]" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}></div>
           </div>
           
           {/* FLIPPING PAGE 2 */}
           <div 
             className="absolute inset-0 origin-left transition-transform duration-[1000ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
             style={{ 
               transformStyle: 'preserve-3d', 
               transform: step > 2 ? 'rotateY(-180deg)' : 'rotateY(0deg)',
               zIndex: 20 
             }}
           >
             <div className="absolute inset-0 bg-white border-r border-[#f0f0f0] p-10 flex flex-col justify-end" style={{ backfaceVisibility: 'hidden' }}>
                <div className="w-full h-1/2 bg-gray-100 rounded-sm mb-4 bg-cover bg-center" style={{ backgroundImage: `url(${book.coverUrl})`, opacity: 0.2 }}></div>
                <div className="h-4 bg-gray-200 w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 w-1/2"></div>
             </div>
             <div className="absolute inset-0 bg-[#f4f1e9]" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}></div>
           </div>

           {/* FLIPPING PAGE 3 */}
           <div 
             className="absolute inset-0 origin-left transition-transform duration-[1000ms] ease-[cubic-bezier(0.22,1,0.36,1)] shadow-[-10px_0_20px_rgba(0,0,0,0.05)]"
             style={{ 
               transformStyle: 'preserve-3d', 
               transform: step > 3 ? 'rotateY(-180deg)' : 'rotateY(0deg)',
               zIndex: 10 
             }}
           >
             <div className="absolute inset-0 bg-white border-r border-[#f0f0f0]" style={{ backfaceVisibility: 'hidden' }}>
             </div>
             
             {/* FINAL LEFT SPREAD CONTENT */}
             <div className="absolute inset-0 bg-[#faf9f6] flex flex-col px-10 py-12 shadow-inner items-center justify-center text-center font-serif text-gray-800 border-l border-gray-100" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                <h2 className="text-[18px] font-medium mb-5 italic leading-snug">{book.title}</h2>
                <div className="w-12 h-[1px] bg-[#df3926] mb-8"></div>
                <p className="text-xs text-gray-500 leading-relaxed tracking-widest font-sans uppercase">
                   Author:<br/>{book.volume}
                </p>
                <div className="mt-8 text-[11px] text-gray-400 font-sans tracking-wide">
                  Pg. {book.year}
                </div>
             </div>
           </div>
           
        </div>
      </div>
    </div>
  );
}
