"use client";

import { useState, useEffect } from 'react';
import { Maximize2, Minimize2 } from 'lucide-react';

export function WidthToggle({ className = "" }) {
  const [wide, setWide] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('article-wide');
    if (saved) setWide(saved === 'true');
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty('--article-width', wide ? '1200px' : '768px');
    document.documentElement.classList.toggle('article-wide', wide);
  }, [wide]);

  return (
    <button
      onClick={() => {
        const next = !wide;
        setWide(next);
        localStorage.setItem('article-wide', String(next));
      }}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md border border-gray-200 dark:border-neutral-700 bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm hover:bg-gray-100 dark:hover:bg-neutral-700 transition-colors text-gray-600 dark:text-gray-300 ${className}`}
      title={wide ? "切换窄屏阅读" : "切换宽屏阅读"}
      aria-label={wide ? "切换窄屏阅读" : "切换宽屏阅读"}
    >
      {wide ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
      <span className="hidden sm:inline">{wide ? "窄屏" : "宽屏"}</span>
    </button>
  );
}
