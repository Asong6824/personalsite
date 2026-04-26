"use client";

import { useState, useEffect } from 'react';
import LiquidGlass from './liquid-glass/index';

/* SSR-safe fallback — 与 LiquidGlass 尺寸一致，避免水合错位 */
function GlassFallback({ children, style }) {
    return (
        <div
            className="rounded-[32px] border border-neutral-200/60 bg-white/80 backdrop-blur-md"
            style={style}
        >
            {children}
        </div>
    );
}

export function LiquidGlassWrapper({
    children,
    mouseContainer,
    fallback,
    ...props
}) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // During SSR and initial hydration, render fallback
    if (!mounted) {
        return fallback || (
            <GlassFallback style={props.style}>
                {children}
            </GlassFallback>
        );
    }

    return (
        <LiquidGlass mouseContainer={mouseContainer} {...props}>
            {children}
        </LiquidGlass>
    );
}
