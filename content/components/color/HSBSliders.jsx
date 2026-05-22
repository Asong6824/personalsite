"use client";

import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Helper to convert HSB to HSL for CSS display
const hsbToHsl = (h, s, b) => {
    // HSB/HSV to HSL conversion
    // s and b are in 0-100 range

    const sNorm = s / 100;
    const bNorm = b / 100;

    // Lightness Calculation
    let l = bNorm * (1 - sNorm / 2);

    // Saturation Calculation
    let sHsl = 0;
    if (l !== 0 && l !== 1) {
        sHsl = (bNorm - l) / Math.min(l, 1 - l);
    }

    return {
        h: h,
        s: Math.round(sHsl * 100),
        l: Math.round(l * 100)
    };
};

const Slider = React.memo(({ label, subLabel, description, gradient, min, max, unit = "", value, onChange }) => {
    const barRef = useRef(null);
    const [isHovering, setIsHovering] = useState(false);
    const [hoverValue, setHoverValue] = useState(0);
    const [hoverX, setHoverX] = useState(0);

    const calculateValue = (e) => {
        if (!barRef.current) return { value: min, percentage: 0 };
        const rect = barRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percentage = Math.min(Math.max(x / rect.width, 0), 1);
        const newValue = Math.round(min + percentage * (max - min));
        return { value: newValue, percentage };
    };

    const handleMouseMove = (e) => {
        const { value, percentage } = calculateValue(e);
        setHoverX(percentage * 100);
        setHoverValue(value);
    };

    const handleClick = (e) => {
        const { value } = calculateValue(e);
        onChange(value);
    };

    // Calculate position for current value indicator
    const currentPercentage = ((value - min) / (max - min)) * 100;

    return (
        <div className="space-y-2 select-none">
            <div className="flex justify-between items-center">
                <span className="font-bold text-gray-900 dark:text-gray-100">{label}</span>
                <span className="text-xs text-gray-500 font-mono bg-gray-100 dark:bg-zinc-800 px-2 py-0.5 rounded">
                    {value}{unit}
                </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
                {description}
            </p>

            <div
                className="relative h-6 w-full cursor-crosshair group touch-none"
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
                onMouseMove={handleMouseMove}
                onClick={handleClick}
            >
                {/* Background Track with rounded ends */}
                <div
                    ref={barRef}
                    className="absolute inset-0 rounded-full shadow-inner overflow-hidden"
                    style={{ background: gradient }}
                />

                {/* Current Value Indicator (Thumb) */}
                <div
                    className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.1)] ring-1 ring-black/20 pointer-events-none transition-all duration-75 ease-out z-10"
                    style={{
                        left: `${currentPercentage}%`,
                        transform: 'translateX(-50%)'
                    }}
                >
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-transparent border-2 border-white rounded-full shadow-sm"></div>
                </div>

                {/* Hover Tooltip */}
                <AnimatePresence>
                    {isHovering && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: -30 }}
                            exit={{ opacity: 0, scale: 0.8, y: 10 }}
                            transition={{ duration: 0.15, ease: "easeOut" }}
                            className="absolute top-0 transform -translate-x-1/2 pointer-events-none z-20"
                            style={{ left: `${hoverX}%` }}
                        >
                            <div className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs font-bold px-2 py-1 rounded shadow-lg whitespace-nowrap">
                                {hoverValue}{unit}
                            </div>
                            {/* Arrow */}
                            <div className="w-2 h-2 bg-gray-900 dark:bg-white rotate-45 absolute left-1/2 -translate-x-1/2 -bottom-1"></div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
});

Slider.displayName = 'Slider';

export const HSBSliders = () => {
    // Initial state: "Classic Web Blue" like color
    const [hsb, setHsb] = useState({ h: 210, s: 70, b: 90 });
    const [hsl, setHsl] = useState({ h: 210, s: 70, l: 90 }); // Initial placeholder

    useEffect(() => {
        setHsl(hsbToHsl(hsb.h, hsb.s, hsb.b));
    }, [hsb]);

    const updateHsb = React.useCallback((key, value) => {
        setHsb(prev => ({ ...prev, [key]: value }));
    }, []);

    const onHueChange = React.useCallback((v) => updateHsb('h', v), [updateHsb]);
    const onSatChange = React.useCallback((v) => updateHsb('s', v), [updateHsb]);
    const onBriChange = React.useCallback((v) => updateHsb('b', v), [updateHsb]);

    const hexColor = (() => {
        // HSL to hex for display purpose (using CSS variable hack or just displaying HSB is fine,
        // but users might want to see how to use it)
        // For simplicity, we just show HSB values, but a color block is nice.
        return `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
    })();

    return (
        <div className="space-y-8 my-8 p-6 bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm">

            {/* Sliders Area */}
            <div className="space-y-6">
                <Slider
                    label="H (Hue) 色相"
                    min={0}
                    max={360}
                    unit="°"
                    value={hsb.h}
                    onChange={onHueChange}
                    description={<><span className="font-semibold">颜色的"身份证"</span>。它决定了是红色、蓝色还是绿色。</>}
                    gradient="linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)"
                />

                <Slider
                    label="S (Saturation) 饱和度"
                    min={0}
                    max={100}
                    unit="%"
                    value={hsb.s}
                    onChange={onSatChange}
                    description={<><span className="font-semibold">颜色的"浓度"</span>。饱和度越低越接近灰色，越高越鲜艳。</>}
                    gradient={`linear-gradient(to right, #808080, hsl(${hsb.h}, 100%, 50%))`} // Simplified visualization
                />

                <Slider
                    label="B (Brightness) 亮度"
                    min={0}
                    max={100}
                    unit="%"
                    value={hsb.b}
                    onChange={onBriChange}
                    description={<><span className="font-semibold">光照的"强弱"</span>。0% 是纯黑，100% 是最充足的光照。</>}
                    gradient={`linear-gradient(to right, #000000, hsl(${hsb.h}, ${hsb.s}%, 50%))`}
                />
            </div>

            {/* Preview Area */}
            <div className="pt-6 border-t border-gray-100 dark:border-zinc-800 flex flex-col sm:flex-row gap-6 items-center">
                <div
                    className="w-24 h-24 rounded-full shadow-lg ring-4 ring-white dark:ring-zinc-800 transition-colors duration-200"
                    style={{ backgroundColor: hexColor }}
                ></div>

                <div className="flex-1 w-full grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 dark:bg-zinc-800/50 p-3 rounded-lg flex flex-col justify-center">
                        <span className="text-xs text-gray-500 uppercase tracking-wider mb-1">Color Preview</span>
                        <span className="font-mono font-bold text-gray-900 dark:text-gray-100 text-lg">
                            HSB({hsb.h}, {hsb.s}%, {hsb.b}%)
                        </span>
                    </div>

                    <div className="bg-gray-50 dark:bg-zinc-800/50 p-3 rounded-lg flex flex-col justify-center">
                        <span className="text-xs text-gray-500 uppercase tracking-wider mb-1">Usage Suggestion</span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                            {hsb.b < 20 ? "适合深色背景 / Dark Mode" :
                                hsb.b > 90 && hsb.s < 10 ? "适合浅色背景 / 纸张白" :
                                    hsb.s > 80 && hsb.b > 80 ? "适合强调色 / 按钮" : "通用色彩"}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};
