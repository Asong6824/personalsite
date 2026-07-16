"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Maximize2, Minimize2 } from "lucide-react";
import StampsPageClient from "@/components/stamps/StampsPageClient";
import { navLinks, socialLinks, stamps } from "@/data/stamps";

export function StampsPreview() {
  const [isExpanded, setIsExpanded] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const expandButtonRef = useRef<HTMLButtonElement>(null);
  const collapseButtonRef = useRef<HTMLButtonElement>(null);
  const wasExpanded = useRef(false);

  useEffect(() => {
    if (!isExpanded) return;

    const scrollY = window.scrollY;
    const previousBodyOverflow = document.body.style.overflow;
    const previousBodyPosition = document.body.style.position;
    const previousBodyTop = document.body.style.top;
    const previousBodyWidth = document.body.style.width;
    const previousRootOverflow = document.documentElement.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsExpanded(false);
    };

    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";
    document.documentElement.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.body.style.position = previousBodyPosition;
      document.body.style.top = previousBodyTop;
      document.body.style.width = previousBodyWidth;
      document.documentElement.style.overflow = previousRootOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      window.scrollTo({ top: scrollY, behavior: "auto" });
    };
  }, [isExpanded]);

  useEffect(() => {
    const focusTarget = isExpanded ? collapseButtonRef.current : expandButtonRef.current;
    if (isExpanded || wasExpanded.current) {
      requestAnimationFrame(() => focusTarget?.focus({ preventScroll: true }));
    }
    wasExpanded.current = isExpanded;
  }, [isExpanded]);

  const transition = shouldReduceMotion
    ? { duration: 0 }
    : { type: "spring" as const, stiffness: 420, damping: 40, mass: 0.7 };

  return (
    <div className="relative mx-auto aspect-video w-full max-w-5xl">
      <motion.div
        layout
        transition={transition}
        className={
          isExpanded
            ? "fixed inset-0 z-[100] overflow-hidden bg-[var(--muji-bg)]"
            : "absolute inset-0 overflow-hidden rounded-sm border border-[var(--muji-border)] bg-[var(--muji-paper)] shadow-sm"
        }
      >
        <StampsPageClient
          stamps={stamps}
          navLinks={navLinks}
          socialLinks={socialLinks}
          embedded
          interactive={isExpanded}
        />

        <AnimatePresence initial={false}>
          {!isExpanded && (
            <motion.button
              ref={expandButtonRef}
              type="button"
              aria-label="展开駅スタンプ收藏"
              title="展开駅スタンプ收藏"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.18 }}
              onClick={() => setIsExpanded(true)}
              className="group absolute inset-0 z-20 cursor-zoom-in outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-neutral-900/60"
            >
              <span className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-sm border border-neutral-900/10 bg-white/90 text-neutral-800 shadow-sm backdrop-blur-sm transition-colors group-hover:bg-white dark:border-white/15 dark:bg-neutral-900/90 dark:text-white dark:group-hover:bg-neutral-900">
                <Maximize2 className="h-5 w-5" aria-hidden="true" />
              </span>
            </motion.button>
          )}
        </AnimatePresence>

        {isExpanded && (
          <motion.button
            ref={collapseButtonRef}
            type="button"
            aria-label="退出全屏预览"
            title="退出全屏预览"
            initial={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.18 }}
            onClick={() => setIsExpanded(false)}
            className="fixed right-4 top-4 z-[110] flex h-11 w-11 items-center justify-center rounded-sm border border-neutral-900/10 bg-white/90 text-neutral-800 shadow-md backdrop-blur-sm transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/60 dark:border-white/15 dark:bg-neutral-900/90 dark:text-white dark:hover:bg-neutral-900"
          >
            <Minimize2 className="h-5 w-5" aria-hidden="true" />
          </motion.button>
        )}
      </motion.div>
    </div>
  );
}
