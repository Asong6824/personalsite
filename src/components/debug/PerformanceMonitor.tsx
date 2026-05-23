'use client';

import { useEffect } from 'react';

export default function PerformanceMonitor() {
    useEffect(() => {
        if (typeof window === 'undefined') return;

        let frameId;
        let statsDom;

        const init = async () => {
            // 动态导入 stats.js
            const Stats = (await import('stats.js')).default;
            const stats = new Stats();
            stats.showPanel(0); // 0: fps, 1: ms, 2: mb
            stats.dom.style.position = 'fixed';
            stats.dom.style.top = '0px';
            stats.dom.style.left = '0px';
            stats.dom.style.zIndex = '9999';
            document.body.appendChild(stats.dom);
            statsDom = stats.dom;

            const animate = () => {
                stats.begin();
                stats.end();
                frameId = requestAnimationFrame(animate);
            };

            frameId = requestAnimationFrame(animate);

            // 动态导入 react-scan
            try {
                const { scan } = await import('react-scan');
                scan({ enabled: true });
            } catch (e) {
                console.error('Failed to initialize react-scan:', e);
            }
        };

        init();

        return () => {
            if (statsDom && document.body.contains(statsDom)) {
                document.body.removeChild(statsDom);
            }
            if (frameId) cancelAnimationFrame(frameId);
        };
    }, []);

    return null;
}
