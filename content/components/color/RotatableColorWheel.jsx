"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';

// Helper to calculate polygon vertices for a ring segment
const createSegmentPath = (startAngle, endAngle, innerRadius, outerRadius, cx, cy) => {
    // Convert degrees to radians
    const toRad = (deg) => (deg - 90) * (Math.PI / 180); // -90 to start at top

    const startRad = toRad(startAngle);
    const endRad = toRad(endAngle);

    // Points
    const p1 = {
        x: cx + outerRadius * Math.cos(startRad),
        y: cy + outerRadius * Math.sin(startRad)
    };
    const p2 = {
        x: cx + outerRadius * Math.cos(endRad),
        y: cy + outerRadius * Math.sin(endRad)
    };
    const p3 = {
        x: cx + innerRadius * Math.cos(endRad),
        y: cy + innerRadius * Math.sin(endRad)
    };
    const p4 = {
        x: cx + innerRadius * Math.cos(startRad),
        y: cy + innerRadius * Math.sin(startRad)
    };

    return `M ${p1.x} ${p1.y} L ${p2.x} ${p2.y} L ${p3.x} ${p3.y} L ${p4.x} ${p4.y} Z`;
};

// Interpolate two hex colors
const interpolateColor = (color1, color2, factor) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(color1);
    const r1 = parseInt(result[1], 16);
    const g1 = parseInt(result[2], 16);
    const b1 = parseInt(result[3], 16);

    const result2 = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(color2);
    const r2 = parseInt(result2[1], 16);
    const g2 = parseInt(result2[2], 16);
    const b2 = parseInt(result2[3], 16);

    const r = Math.round(r1 + factor * (r2 - r1));
    const g = Math.round(g1 + factor * (g2 - g1));
    const b = Math.round(b1 + factor * (b2 - b1));

    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
};

// RYB Anchors from ColorWheelSteps
const rybAnchors = [
    { angle: 0, color: "#FF1D25" },   // Red
    { angle: 30, color: "#FF4500" },  // RedOrange
    { angle: 60, color: "#FF8C00" },  // Orange
    { angle: 90, color: "#FFAE00" },  // YellowOrange
    { angle: 120, color: "#FFDE00" }, // Yellow
    { angle: 150, color: "#8FD400" }, // YellowGreen
    { angle: 180, color: "#008E41" }, // Green
    { angle: 210, color: "#009AA6" }, // BlueGreen
    { angle: 240, color: "#0057B7" }, // Blue
    { angle: 270, color: "#403A99" }, // BluePurple
    { angle: 300, color: "#6A329F" }, // Purple
    { angle: 330, color: "#A6192E" }, // RedPurple
    { angle: 360, color: "#FF1D25" }  // Wrap Red
];

const getSegmentColor = (angle) => {
    // angle is 0, 20, 40 ...
    // Find anchors
    for (let i = 0; i < rybAnchors.length - 1; i++) {
        const start = rybAnchors[i];
        const end = rybAnchors[i + 1];
        if (angle >= start.angle && angle < end.angle) {
            const range = end.angle - start.angle;
            const factor = (angle - start.angle) / range;
            return interpolateColor(start.color, end.color, factor);
        }
    }
    return rybAnchors[0].color; // Default/Wrap
};

// Pre-calculate segment colors once
const SEGMENTS = 18;
const ANGLE_PER_SEGMENT = 360 / SEGMENTS;
const SEGMENT_COLORS = Array.from({ length: SEGMENTS }).map((_, index) =>
    getSegmentColor(index * ANGLE_PER_SEGMENT)
);

const WheelRing = React.memo(({ radiusOuter, radiusInner, rotation, onRotate }) => {
    const cx = 200;
    const cy = 200;

    const handleClick = (e) => {
        // Prevent event bubbling if needed, though mostly okay here
        e.stopPropagation();

        // Find the center of the SVG
        const svgElement = e.currentTarget.closest('svg');
        if (!svgElement) return;

        const rect = svgElement.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;

        // Determine Left (CCW) or Right (CW)
        if (e.clientX < centerX) {
            onRotate(-20); // Left half -> CCW
        } else {
            onRotate(20);  // Right half -> CW
        }
    };

    return (
        <motion.g
            animate={{ rotate: rotation }}
            transition={{ type: "spring", stiffness: 60, damping: 15 }}
            style={{ transformBox: "view-box", transformOrigin: "200px 200px" }} // Rotate around center of viewBox
            onClick={handleClick}
            className="cursor-pointer hover:opacity-90 transition-opacity"
        >
            {SEGMENT_COLORS.map((color, index) => {
                const startAngle = index * ANGLE_PER_SEGMENT;
                const endAngle = (index + 1) * ANGLE_PER_SEGMENT;

                return (
                    <path
                        key={index}
                        d={createSegmentPath(startAngle, endAngle, radiusInner, radiusOuter, cx, cy)}
                        fill={color}
                        stroke="white"
                        strokeWidth="1"
                    />
                );
            })}
        </motion.g>
    );
});

WheelRing.displayName = 'WheelRing';

export const RotatableColorWheel = () => {
    const [rotMiddle, setRotMiddle] = useState(0);
    const [rotInner, setRotInner] = useState(0);

    const handleRotateMiddle = React.useCallback((delta) => setRotMiddle(prev => prev + delta), []);
    const handleRotateInner = React.useCallback((delta) => setRotInner(prev => prev + delta), []);
    // Stable no-op function for outer ring
    const noOp = React.useCallback(() => { }, []);

    const reset = () => {
        setRotMiddle(0);
        setRotInner(0);
    };

    return (
        <div className="my-8 flex flex-col items-center p-6 bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800">
            <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-gray-100">交互式 18 色轮</h3>
            <p className="text-sm text-gray-500 mb-6 text-center max-w-md">
                点击圆环左侧逆时针旋转，点击右侧顺时针旋转。尝试对齐不同的颜色来观察色彩关系。
            </p>

            <div className="relative w-[320px] h-[320px] sm:w-[400px] sm:h-[400px]">
                <svg viewBox="0 0 400 400" className="w-full h-full drop-shadow-xl select-none">
                    {/* Ring 1 (Outer) - Fixed */}
                    <WheelRing
                        radiusOuter={190}
                        radiusInner={140}
                        rotation={0}
                        onRotate={noOp} // Fixed
                    />

                    {/* Ring 2 (Middle) - Rotatable */}
                    <WheelRing
                        radiusOuter={140}
                        radiusInner={90}
                        rotation={rotMiddle}
                        onRotate={handleRotateMiddle}
                    />

                    {/* Ring 3 (Inner) - Rotatable */}
                    <WheelRing
                        radiusOuter={90}
                        radiusInner={40}
                        rotation={rotInner}
                        onRotate={handleRotateInner}
                    />

                    {/* Center Hole */}
                    <circle cx="200" cy="200" r="40" fill="currentColor" className="text-white dark:text-zinc-900" />
                </svg>

                {/* Decoration: Indicator arrow at top */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 pointer-events-none">
                    <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[12px] border-t-gray-800 dark:border-t-white"></div>
                </div>
            </div>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-lg">
                <button
                    onClick={() => {
                        // Triadic (RGB Model): Red (0), Green (120), Blue (240)
                        setRotMiddle(-120);
                        setRotInner(-240);
                    }}
                    className="flex flex-col items-center p-3 bg-gray-50 hover:bg-blue-50 dark:bg-zinc-800/50 dark:hover:bg-blue-900/20 rounded-xl border border-gray-200 dark:border-zinc-700 transition-colors group"
                >
                    <span className="font-bold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400">三色组</span>
                    <span className="text-xs text-gray-400 mt-1">Triadic</span>
                </button>

                <button
                    onClick={() => {
                        // Split Complementary: Red (0) -> Cyan (180). Split: 160 (-8 steps) & 200 (-10 steps)
                        setRotMiddle(-160);
                        setRotInner(-200);
                    }}
                    className="flex flex-col items-center p-3 bg-gray-50 hover:bg-purple-50 dark:bg-zinc-800/50 dark:hover:bg-purple-900/20 rounded-xl border border-gray-200 dark:border-zinc-700 transition-colors group"
                >
                    <span className="font-bold text-gray-900 dark:text-gray-100 group-hover:text-purple-600 dark:group-hover:text-purple-400">分裂互补</span>
                    <span className="text-xs text-gray-400 mt-1">Split-Comp</span>
                </button>

                <button
                    onClick={() => {
                        // Analogous: Red (0), Orange-Red (20), Orange (40)
                        setRotMiddle(-20);
                        setRotInner(-40);
                    }}
                    className="flex flex-col items-center p-3 bg-gray-50 hover:bg-orange-50 dark:bg-zinc-800/50 dark:hover:bg-orange-900/20 rounded-xl border border-gray-200 dark:border-zinc-700 transition-colors group"
                >
                    <span className="font-bold text-gray-900 dark:text-gray-100 group-hover:text-orange-600 dark:group-hover:text-orange-400">类似色</span>
                    <span className="text-xs text-gray-400 mt-1">Analogous</span>
                </button>
            </div>

            <button
                onClick={reset}
                className="mt-4 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 underline"
            >
                重置位置
            </button>
        </div>
    );
};
