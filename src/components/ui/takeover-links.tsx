'use client';
// src/components/ui/takeover-links.jsx
import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';

export default function TakeoverLinks({ items = [], variant = 'fullscreen', className = '' }) {
  const [activeIndex, setActiveIndex] = useState(null);
  const activeItem = useMemo(() => (activeIndex != null ? items[activeIndex] : null), [activeIndex, items]);
  const handleLeaveContainer = () => setActiveIndex(null);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setActiveIndex(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div
      className={`relative bg-white text-black ${className}`}
      onMouseLeave={handleLeaveContainer}
      onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) { setActiveIndex(null); } }}
    >
      {/* 居中巨型链接列表 */}
      <div className="relative flex flex-col items-center justify-center min-h-[70vh] md:min-h-screen">
        <nav className="relative z-30 w-full max-w-4xl text-center space-y-8 md:space-y-12">
          {items.map((item, idx) => (
            <Link
              key={item.title + idx}
              href={item.href}
              onMouseEnter={() => setActiveIndex(idx)}
              onFocus={() => setActiveIndex(idx)}
              className="block text-4xl md:text-7xl font-extralight tracking-[.15em] hover:opacity-70 transition-opacity focus:outline-none"
              aria-haspopup="true"
              aria-expanded={activeIndex === idx}
            >
              {item.title}
            </Link>
          ))}
        </nav>
      </div>

      {/* 全屏背景图覆盖（在文本后、页面前），不遮挡交互 */}
      <AnimatePresence>
        {variant === 'fullscreen' && activeItem && (
          <motion.div
            key={`bg-${activeItem.title}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-20 pointer-events-none"
            aria-hidden
          >
            <AnimatePresence mode="wait">
              {activeItem.image && (
                <motion.img
                  key={activeItem.image}
                  src={activeItem.image}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover"
                  initial={{ opacity: 0, scale: 1.02 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.02 }}
                  transition={{ duration: 0.35, ease: 'easeInOut' }}
                  draggable={false}
                />
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}