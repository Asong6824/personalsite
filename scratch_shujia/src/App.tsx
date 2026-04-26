import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

// --- MOCK DATA GENERATION ---
const items = Array.from({ length: 40 }).map((_, i) => ({
  id: i,
  year: 2024 - Math.floor(i / 4),
  title: i % 2 === 0 
    ? `Unbuilt Frank Lloyd Wright: Challenging Conventional Approaches To Living` 
    : `Frank Lloyd Wright in Iowa`,
  volume: `Vol. ${35 - Math.floor(i / 4)} No. ${(i % 4) + 1} - ${['Spring', 'Summer', 'Autumn', 'Winter'][i % 4]} ${2024 - Math.floor(i / 4)}`,
  description: i % 2 === 0 
    ? `Skylights, Columns, and Innovation: Inside Wright's Unbuilt Factory; When Wright Pivoted to Housing; The Man With a Backup Plan...` 
    : `Frank Lloyd Wright in Iowa; Park Inn Hotel and City National Bank Building; George C. Stockman House; Cedar Rock...`,
  // Using picsum for realistic magazine covers
  coverUrl: `https://picsum.photos/seed/${i + 200}/400/500`,
}));

export default function App() {
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
    
    // Spacing creates a diagonal slope. 
    // SPACING_Y is negative so that as index goes up (rightwards), the item visually moves UP.
    // Viewpoint Spacing: Flattened slope to span from bottom 1/3 to top 1/3
    // by significantly increasing X spacing while retaining adequate Y stagger for top-exposure.
    const SPACING_X = 62; 
    const SPACING_Y = -17; 
    
    // Static angles: Removed X rotation (pitch) so the books remain standing 
    // straight up, solely relying on Y rotation and staggered position for perspective.
    const STATIC_ROT_Y = -38; 
    const STATIC_ROT_X = 0; 
    
    // Interaction constraints
    // We now use PUSH_SLOTS instead of hardcoded X/Y to strictly lock the slide vector!
    const PUSH_SLOTS = 2.2;  // How many index slots neighbors are shifted apart
    const PUSH_RADIUS = 3.5; // Blast radius calculated via Index Distance, NOT pixels

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let isHovered = false;
    let lockedTargetIndex = Math.round((items.length - 1) / 2); // Magnetically default to an exact middle book
    let smoothTargetIndex = lockedTargetIndex;
    let smoothHover = 0; 
    let lastActiveIndex = -1; // Track which index's text is currently displayed
    
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
        // Update horizontal array tracking based on mouse progress
        const padding = Math.min(250, screenW * 0.15);
        const workArea = screenW - padding * 2;
        const clampedX = Math.max(0, Math.min(workArea, mouseX - padding));
        const progress = clampedX / workArea;
        lockedTargetIndex = progress * (numItems - 1);
      } else {
        // Magnetic Lock: The moment the mouse leaves the top sliding zone (or leaves window entirely), 
        // cleanly round the target to the nearest whole integer book index!
        lockedTargetIndex = Math.round(lockedTargetIndex);
      }

      // Smooth decay for dynamic interactions
      // This will smoothly glide the continuous value to exactly hit the snapped integer index when locked!
      smoothTargetIndex += (lockedTargetIndex - smoothTargetIndex) * 0.08;
      
      // Permanently target 1 so the array always has exactly ONE beautiful spotlighted book, 
      // preventing the books from ever crashing back to a completely flat array.
      smoothHover += (1 - smoothHover) * 0.06;

      // 2) Camera Panning calculation 
      // Anchor the entire array slightly higher on the screen so the bottom UI text has plenty of room
      const trackOffX = screenW / 2 - (smoothTargetIndex * SPACING_X);
      const trackOffY = screenH * 0.45 - (smoothTargetIndex * SPACING_Y);

      // Determine strictly which item is structurally in the center
      const activeIdx = Math.round(smoothTargetIndex);
      
      // Lazily update the DOM text block ONLY when the focused index truly changes
      // We also verify innerText so if React re-renders and wipes the content, we instantly restore it!
      if (activeIdx >= 0 && activeIdx < numItems) {
         if (activeIdx !== lastActiveIndex) {
           lastActiveIndex = activeIdx;
           activeIndexRef.current = activeIdx;
         }
         if (titleRef.current && titleRef.current.innerText !== items[activeIdx].title) {
           titleRef.current.innerText = items[activeIdx].title;
           if (volRef.current) volRef.current.innerText = items[activeIdx].volume;
           if (descRef.current) descRef.current.innerText = items[activeIdx].description;
         }
      }
      
      // Update text block opacity/position cleanly 
      if (textContainerRef.current) {
         gsap.set(textContainerRef.current, {
            autoAlpha: smoothHover,
            y: (1 - smoothHover) * 20
         });
      }

      cardRefs.current.forEach((card, i) => {
        if (!card) return;

        // Base static diagonal positioning
        // By relying purely on X/Y translations without Z-depth progression, all cards maintain identical apparent size!
        const baseX = i * SPACING_X;
        const baseY = i * SPACING_Y;
        
        let targetX = trackOffX + baseX;
        let targetY = trackOffY + baseY;

        // 3) Interaction push based purely on mathematical index distance
        const dist = i - smoothTargetIndex;

        // PUSH FACTOR: Push neighbors aside instantly to make physical space.
        // By multiplying the original SPACING_X and SPACING_Y, we FORCE the push to happen 
        // strictly along the isometric diagonal line, keeping all non-focused books visually collinear!
        const pushFactor = Math.tanh(dist * 2.5);
        const xPush = pushFactor * (PUSH_SLOTS * SPACING_X) * smoothHover;
        const yPush = pushFactor * (PUSH_SLOTS * SPACING_Y) * smoothHover;
        
        // FOCUS FACTOR (Rotation & Scale): Target 1 when exactly centered, 0 when adjacent.
        // We apply an ASYMMETRIC LOW-PASS FILTER to the individual book's popup progress.
        // This ensures fast swipes only cause a "slight lift", while dwelling blossoms into full frontal presentation.
        const idealFocus = Math.max(0, 1 - Math.abs(dist * 1.5));
        
        if (idealFocus > cardFocusArray[i]) {
            cardFocusArray[i] += (idealFocus - cardFocusArray[i]) * 0.055; // Slow rise (Requires hovering to fully face front)
        } else {
            cardFocusArray[i] += (idealFocus - cardFocusArray[i]) * 0.15;  // Faster fall (Quickly retreats when bypassed)
        }
        
        const e_smooth_focus = cardFocusArray[i] * smoothHover;

        // Interpolate structural properties
        const scale = 1 + e_smooth_focus * 0.65; // Massive scale up for the spotlight front
        const rotateY = STATIC_ROT_Y + e_smooth_focus * (-STATIC_ROT_Y); // Smoothly rolls to 0deg (Face Forward)
        const rotateX = STATIC_ROT_X + e_smooth_focus * (-STATIC_ROT_X); // Lifts from backward pitch to flat forward
        
        // Z-Index calculation: Base constraint ensures Left (smaller index) strictly covers Right (larger index).
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
    updateCoverflow(); // Force initial draw

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
    <div className="w-screen h-screen bg-[#f4f6f7] flex flex-col items-center justify-center overflow-hidden select-none font-sans">
      
      {/* 
        Perspective Container 
        Very large perspective minimizes vanishing-point distortion, heavily simulating an Isometric camera.
      */}
      <main 
        ref={containerRef}
        className="relative w-full h-full cursor-ew-resize flex items-center shadow-inner"
        // Elevate the camera (vanishing point) moderately above the screen.
        // Moved down from -250% for a less extreme top-down isometric angle.
        style={{ perspective: '4000px', perspectiveOrigin: '50% -120%', transformStyle: 'preserve-3d' }}
      >
        {/* Render elements in reverse to force Left (Index 0) to sit above Right (Index N) in 3D painter's algorithm */}
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
              height: '252px', // Exact 1:1.4 aspect ratio
              marginLeft: '-90px',
              marginTop: '-126px',
              transformStyle: 'preserve-3d', // Enable 3D Volume rendering
            }}
          >
            {/* --- SHADOW PLATE --- */}
            <div 
              className="absolute inset-0 bg-transparent"
              style={{
                transform: 'translateZ(-17px)', // Push slightly behind the deeper 32px back face
                boxShadow: '-15px 25px 25px rgba(0,0,0,0.25)', 
                pointerEvents: 'none'
              }}
            ></div>

            {/* --- 3D FACE: FRONT --- */}
            <div 
              className="absolute inset-0 flex bg-white"
              style={{
                transform: 'translateZ(16px)', // Push out half the massive depth (32px thickness)
                backfaceVisibility: 'hidden',
                boxShadow: 'inset 0 0 0 3px white', // Physical cover thickness illusion
              }}
            >
              {/* Cover Image (Full Width) */}
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

              {/* Gentle depth sheen */}
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

      {/* DYNAMIC TEXT CONTAINER (Below the Array) */}
      <div 
        ref={textContainerRef} 
        className="absolute bottom-[5%] left-1/2 -translate-x-1/2 w-full max-w-2xl flex flex-col items-center justify-start text-center opacity-0 px-6 z-50"
      >
        <h2 
          ref={titleRef} 
          className="text-[22px] md:text-[28px] font-medium text-gray-800 mb-3 leading-tight tracking-tight max-w-[90%]"
        >
          {/* Injected dynamically */}
        </h2>
        
        <div className="flex items-center space-x-8 mb-4 pointer-events-auto">
          <p ref={volRef} className="text-[13px] md:text-[14px] font-bold text-[#df3926] tracking-wider uppercase"></p>
        </div>
        
        <p 
          ref={descRef} 
          className="text-[13px] md:text-[15px] font-serif text-gray-500 max-w-[75%] mx-auto leading-relaxed mb-6"
        >
          {/* Injected dynamically */}
        </p>

        <button 
          type="button"
          onClick={() => {
            if (items[activeIndexRef.current]) {
              setOpenedBook(items[activeIndexRef.current]);
            }
          }}
          className="relative pointer-events-auto px-8 py-2.5 bg-[#1a1a1a] text-white text-sm font-medium tracking-[0.1em] rounded-full shadow-xl hover:scale-105 hover:bg-black transition-all z-[60]"
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
    // 1. Move to center and open the cover
    const t1 = setTimeout(() => setStep(1), 50);
    // 2. Flip page 1
    const t2 = setTimeout(() => setStep(2), 650);
    // 3. Flip page 2
    const t3 = setTimeout(() => setStep(3), 850);
    // 4. Flip page 3 (revealing the middle spread)
    const t4 = setTimeout(() => setStep(4), 1050);
    
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, []);

  const w = 340;
  const h = 476; // 1:1.4 roughly

  return (
    <div className={`fixed inset-0 z-[100] bg-[#f4f6f7]/95 backdrop-blur-md flex items-center justify-center font-sans tracking-wide transition-opacity duration-700 ease-out ${step > 0 ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
      <button 
        onClick={onClose} 
        className="absolute top-8 right-8 z-[110] p-3 text-gray-500 hover:text-black bg-black/5 hover:bg-black/10 rounded-full transition-colors cursor-pointer"
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
           {/* RIGHT SIDE STATIC SPREAD (Underneath all flipping pages) */}
           <div 
             className="absolute inset-0 bg-[#faf9f6] flex flex-col px-10 py-12 shadow-2xl items-center justify-start text-center border-l shadow-[-10px_0_20px_rgba(0,0,0,0.05)] border-gray-200"
           >
              <h3 className="text-[11px] font-bold tracking-[0.25em] text-gray-400 mb-8 uppercase line-clamp-1">{book.title}</h3>
              <img src={book.coverUrl} referrerPolicy="no-referrer" className="w-full h-56 object-cover mb-8 rounded-sm shadow-inner grayscale contrast-125 opacity-90" />
              <p className="text-gray-600 leading-relaxed text-[13px] font-serif text-justify line-clamp-4">
                {book.description} This marks a significant pivot in the architectural styles that had dominated the era, showcasing an innovative take on modernism and practical integration.
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
             {/* Outside Cover */}
             <div className="absolute inset-0 bg-white" style={{ backfaceVisibility: 'hidden' }}>
                <img src={book.coverUrl} referrerPolicy="no-referrer" className="w-full h-full object-cover shadow-2xl" />
             </div>
             {/* Inside Cover */}
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
                <img src={`https://picsum.photos/seed/${book.id}img1/340/476?blur=2`} referrerPolicy="no-referrer" className="w-full h-full object-cover opacity-80" />
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
                <div className="w-full h-1/2 bg-gray-100 rounded-sm mb-4 bg-cover bg-center" style={{ backgroundImage: `url(https://picsum.photos/seed/${book.id}img2/300/300)` }}></div>
                <div className="h-4 bg-gray-200 w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 w-1/2"></div>
             </div>
             <div className="absolute inset-0 bg-[#f4f1e9]" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}></div>
           </div>

           {/* FLIPPING PAGE 3 (Becomes the visible LEFT side of the final spread) */}
           <div 
             className="absolute inset-0 origin-left transition-transform duration-[1000ms] ease-[cubic-bezier(0.22,1,0.36,1)] shadow-[-10px_0_20px_rgba(0,0,0,0.05)]"
             style={{ 
               transformStyle: 'preserve-3d', 
               transform: step > 3 ? 'rotateY(-180deg)' : 'rotateY(0deg)',
               zIndex: 10 
             }}
           >
             <div className="absolute inset-0 bg-white border-r border-[#f0f0f0]" style={{ backfaceVisibility: 'hidden' }}>
                <img src={`https://picsum.photos/seed/${book.id}img3/340/476?blur=1`} referrerPolicy="no-referrer" className="w-full h-full object-cover opacity-80" />
             </div>
             
             {/* FINAL LEFT SPREAD CONTENT */}
             <div className="absolute inset-0 bg-[#faf9f6] flex flex-col px-10 py-12 shadow-inner items-center justify-center text-center font-serif text-gray-800 border-l border-gray-100" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                <h2 className="text-[26px] font-medium mb-5 italic leading-snug">{book.title}</h2>
                <div className="w-12 h-[1px] bg-[#df3926] mb-8"></div>
                <p className="text-xs text-gray-500 leading-relaxed uppercase tracking-widest font-sans">
                   Exhibition &<br/>Collection
                </p>
                <div className="mt-8 text-[11px] text-gray-400 font-sans tracking-wide">
                  Pg. 142
                </div>
             </div>
           </div>
           
        </div>
      </div>
    </div>
  );
}
