"use client";

import React, { useEffect, useRef, useMemo } from 'react';

export const DataWall = ({ config, targetTwist, theme }) => {
    const canvasRef = useRef(null);
    const requestRef = useRef(0);
    const currentTwistRef = useRef(config.twist);
    const mouseRef = useRef({ x: 0, y: 0 });

    // Initialize data strips
    const strips = useMemo(() => {
        const s = [];
        // Denser, thinner strips for the "Data Wall" look
        const count = 100;

        for (let i = 0; i < count; i++) {
            let baseText = "";
            const type = Math.random();

            const randomChange = () => {
                const change = parseFloat((Math.random() * 5 - 2).toFixed(2));
                return change > 0 ? `+${change}%` : `${change}%`;
            };

            if (type < 0.15) {
                // A-Share (Moutai, Ping An, CATL)
                baseText = `600519.SH ${(1600 + Math.random() * 200).toFixed(2)} ${randomChange()}   000001.SZ ${(10 + Math.random() * 5).toFixed(2)} ${randomChange()}   300750.SZ ${(180 + Math.random() * 50).toFixed(2)} ${randomChange()}`;
            } else if (type < 0.3) {
                // HK Stocks (Tencent, Alibaba, Meituan)
                baseText = `0700.HK ${(320 + Math.random() * 60).toFixed(2)} ${randomChange()}   9988.HK ${(85 + Math.random() * 15).toFixed(2)} ${randomChange()}   3690.HK ${(110 + Math.random() * 30).toFixed(2)} ${randomChange()}`;
            } else if (type < 0.45) {
                // US Tech (Apple, Nvidia, Tesla, Microsoft)
                baseText = `AAPL ${(170 + Math.random() * 30).toFixed(2)} ${randomChange()}   NVDA ${(450 + Math.random() * 100).toFixed(2)} ${randomChange()}   TSLA ${(240 + Math.random() * 40).toFixed(2)} ${randomChange()}`;
            } else if (type < 0.6) {
                // Futures/Commodities (Gold, Silver, Oil)
                baseText = `XAU/USD ${(1950 + Math.random() * 100).toFixed(2)} ${randomChange()}   XAG/USD ${(23 + Math.random() * 2).toFixed(2)} ${randomChange()}   CL=F ${(75 + Math.random() * 10).toFixed(2)} ${randomChange()}`;
            } else if (type < 0.75) {
                // Forex (EUR, JPY, GBP)
                baseText = `EUR/USD ${(1.06 + Math.random() * 0.05).toFixed(4)} ${randomChange()}   USD/JPY ${(148 + Math.random() * 5).toFixed(2)} ${randomChange()}   GBP/USD ${(1.22 + Math.random() * 0.05).toFixed(4)} ${randomChange()}`;
            } else if (type < 0.9) {
                // Crypto (BTC, ETH, SOL)
                baseText = `BTC ${(35000 + Math.random() * 5000).toFixed(2)} ${randomChange()}   ETH ${(1900 + Math.random() * 300).toFixed(2)} ${randomChange()}   SOL ${(40 + Math.random() * 20).toFixed(2)} ${randomChange()}`;
            } else {
                // Raw Data / Hash
                baseText = `BLOCK_${Math.floor(Math.random() * 999999)} :: HASH 0x${Math.random().toString(16).substr(2, 8)}... :: TX_POOL_SIZE ${Math.floor(Math.random() * 5000)}`;
            }

            // Repeat text to form a long strip
            const text = Array(8).fill(baseText).join(" ");

            // Normalized position from -1 (top) to 1 (bottom)
            const yIndex = (i / (count - 1)) * 2 - 1;

            s.push({
                yIndex,
                text,
                width: 2400 + Math.random() * 1600,
                speed: (0.002 + Math.random() * 0.004) * (Math.random() > 0.5 ? 1 : -1), // Faster random direction
                offset: Math.random() * Math.PI * 2,
                alpha: 0.2 + Math.random() * 0.3
            });
        }
        return s;
    }, []);

    useEffect(() => {
        const handleMouseMove = (e) => {
            // Normalize mouse to -1...1
            mouseRef.current = {
                x: (e.clientX / window.innerWidth) * 2 - 1,
                y: (e.clientY / window.innerHeight) * 2 - 1
            };
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d', { alpha: false }); // Optimize for no transparency on canvas itself if possible
        if (!ctx) return;

        let time = 0;

        const render = () => {
            time += 0.01;

            if (canvas.width !== window.innerWidth || canvas.height !== window.innerHeight) {
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
            }

            // Instant Twist Update
            currentTwistRef.current = targetTwist;

            const bg = theme.bg || '#000000';
            const textColor = theme.text || '#ffffff';
            const accentColor = theme.accent || '#333333';

            // Fill Background
            ctx.fillStyle = bg;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const cx = canvas.width / 2;
            const cy = canvas.height / 2;

            // Global Camera/Wall settings
            const baseZoom = 0.8 + (config.zoom / 200);
            // Use config tilt as base, add mouse influence
            const wallTiltX = (config.tiltX !== undefined ? config.tiltX : 0.15) + (mouseRef.current.y * 0.05);
            const wallTiltY = (config.tiltY !== undefined ? config.tiltY : -0.2) + (mouseRef.current.x * 0.05);

            // Font settings
            ctx.font = '16px "JetBrains Mono", monospace';
            ctx.textBaseline = 'middle';
            ctx.textAlign = 'center';

            strips.forEach((strip, i) => {
                // 1. Calculate the Twist Curve
                // Requirement: "Midline (0) is static. Top/Bottom twist opposite ways."
                // Requirement: "Non-linear... near middle almost flat, edges bend most."

                const yBase = strip.yIndex; // -1 to 1

                // Power curve for non-linearity (e.g., y^2 or y^1.8) maintains sign
                // This keeps the center "tight" and flat, while edges flare out.
                const distortionCurve = Math.pow(Math.abs(yBase), 1.8) * Math.sign(yBase);

                // Calculate Angle
                // Twist slider controls maximum angle.
                // We want a range from 0 to ~180 degrees (Math.PI) when twist is 1.
                const twistAngleRad = distortionCurve * (currentTwistRef.current * Math.PI);

                // 2. Position Calculation
                // We simulate a 3D wall.
                // Base coordinates on the wall plane
                const wallW = 2000;
                const wallH = 1600; // Increased height to prevent text overlap

                const localX = 0; // Center of strip
                const localY = yBase * (wallH / 2); // Spread vertically
                const localZ = 0;

                // "Breathing" effect
                const breathe = Math.sin(time + strip.offset) * 2;

                // 3. Apply Transformations
                // We are constructing a transformation matrix manually for 2D Canvas

                // Step A: Twist Rotation (Around Z-axis of the strip center)
                // This creates the "Fan" shape

                // Step B: Global Wall Tilt (Perspective)
                // Rotate the entire wall point around World Origin

                // Rotation X (Tilt back)
                const y1 = localY * Math.cos(wallTiltX) - localZ * Math.sin(wallTiltX);
                const z1 = localY * Math.sin(wallTiltX) + localZ * Math.cos(wallTiltX);

                // Rotation Y (Turn sideways)
                const x2 = localX * Math.cos(wallTiltY) - z1 * Math.sin(wallTiltY);
                const z2 = localX * Math.sin(wallTiltY) + z1 * Math.cos(wallTiltY);
                const y2 = y1;

                // Perspective Projection
                const fov = 1000;
                const cameraZ = 1200; // Distance from camera
                const scale = (fov * baseZoom) / (fov + z2 + cameraZ);

                if (scale < 0) return; // Behind camera

                const screenX = cx + x2 * scale;
                const screenY = cy + y2 * scale;

                // Drawing
                ctx.save();
                ctx.translate(screenX, screenY + breathe * scale);

                // Apply the Twist Rotation + Global Tilt influence on rotation
                // We add wallTiltY * 0.5 to align text perspective slightly with wall
                ctx.rotate(twistAngleRad + (wallTiltY * 0.1));
                ctx.scale(scale, scale);

                // Draw Text
                ctx.fillStyle = textColor;
                // Fade out edges based on y-index for depth effect or just random
                ctx.globalAlpha = Math.max(0, strip.alpha * (0.9 - Math.abs(yBase) * 0.2));

                // Scrolling text effect
                const textWidth = ctx.measureText(strip.text).width;
                const period = textWidth;
                const scrollOffset = (time * strip.speed * 1000) % period;

                // Draw text multiple times to simulate seamless scrolling in both directions
                // We draw at center, left, and right based on the period (text width)
                ctx.fillText(strip.text, scrollOffset, 0);
                ctx.fillText(strip.text, scrollOffset - period, 0);
                ctx.fillText(strip.text, scrollOffset + period, 0);

                ctx.restore();
            });

            requestRef.current = requestAnimationFrame(render);
        };

        requestRef.current = requestAnimationFrame(render);
        return () => cancelAnimationFrame(requestRef.current);
    }, [config, strips, targetTwist, theme]);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 w-full h-full pointer-events-none z-0"
        />
    );
};
