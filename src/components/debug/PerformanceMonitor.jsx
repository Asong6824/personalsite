'use client';

import { useEffect } from 'react';
import Stats from 'stats.js';
import { scan } from 'react-scan';

export default function PerformanceMonitor() {
    useEffect(() => {
        if (typeof window === 'undefined') return;

        // Stats.js setup
        const stats = new Stats();
        stats.showPanel(0); // 0: fps, 1: ms, 2: mb
        stats.dom.style.position = 'fixed';
        stats.dom.style.top = '0px';
        stats.dom.style.left = '0px';
        stats.dom.style.zIndex = '9999';
        document.body.appendChild(stats.dom);

        const animate = () => {
            stats.begin();
            stats.end();
            requestAnimationFrame(animate);
        };

        const frameId = requestAnimationFrame(animate);

        // React Scan setup
        try {
            scan({
                enabled: true,
            });
        } catch (e) {
            console.error('Failed to initialize react-scan:', e);
        }

        return () => {
            if (document.body.contains(stats.dom)) {
                document.body.removeChild(stats.dom);
            }
            cancelAnimationFrame(frameId);
        };
    }, []);

    return null;
}
