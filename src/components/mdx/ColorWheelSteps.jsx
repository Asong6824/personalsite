"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const ColorWheelSteps = () => {
    const [step, setStep] = useState(1); // 1: Primary, 2: Secondary, 3: Tertiary

    const nextStep = () => setStep(prev => Math.min(prev + 1, 3));
    const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

    // RYB Model Colors (approximate for display)
    // Primary
    const cRed = "#FF1D25";
    const cYellow = "#FFDE00"; // Warmer yellow
    const cBlue = "#0057B7";

    // Secondary
    const cOrange = "#FF8C00";
    const cGreen = "#008E41"; // Standard Green
    const cPurple = "#6A329F";

    // Tertiary (Simplified for visual)
    const cRedOrange = "#FF4500";
    const cYellowOrange = "#FFAE00";
    const cYellowGreen = "#8FD400";
    const cBlueGreen = "#009AA6";
    const cBluePurple = "#403A99";
    const cRedPurple = "#A6192E";

    // Gradient Definitions
    const getGradient = (currentStep) => {
        // We use transparent stops to create "gaps" or just solid transitions.
        // Let's use solid blocks for clear "palette" feel.

        let stops = [];
        const gap = 2; // gap degrees

        if (currentStep === 1) {
            // 3 segments: 0(Red), 120(Yellow), 240(Blue)
            // Each takes ~60deg to look like a block? Or 120 full?
            // Image showed blocks with white space. Let's do 60deg blocks centered.
            // Red: 330-30. Yellow: 90-150. Blue: 210-270.
            stops = [
                `${cRed} 0deg 30deg`,
                `transparent 30deg 90deg`,
                `${cYellow} 90deg 150deg`,
                `transparent 150deg 210deg`,
                `${cBlue} 210deg 270deg`,
                `transparent 270deg 330deg`,
                `${cRed} 330deg 360deg`
            ];
        } else if (currentStep === 2) {
            // 6 segments: Red, Orange, Yellow, Green, Blue, Purple
            // 60deg each.
            // Red: 330-30. Orange: 30-90. Yellow: 90-150. Green: 150-210. Blue: 210-270. Purple: 270-330.
            stops = [
                `${cRed} 0deg 30deg`,
                `${cOrange} 30deg 90deg`,
                `${cYellow} 90deg 150deg`,
                `${cGreen} 150deg 210deg`,
                `${cBlue} 210deg 270deg`,
                `${cPurple} 270deg 330deg`,
                `${cRed} 330deg 360deg`
            ];
        } else {
            // 12 segments: 30deg each.
            // Red centered at 0 (345-15).
            stops = [
                `${cRed} 0deg 15deg`,
                `${cRedOrange} 15deg 45deg`,
                `${cOrange} 45deg 75deg`,
                `${cYellowOrange} 75deg 105deg`,
                `${cYellow} 105deg 135deg`,
                `${cYellowGreen} 135deg 165deg`,
                `${cGreen} 165deg 195deg`,
                `${cBlueGreen} 195deg 225deg`,
                `${cBlue} 225deg 255deg`,
                `${cBluePurple} 255deg 285deg`,
                `${cPurple} 285deg 315deg`,
                `${cRedPurple} 315deg 345deg`,
                `${cRed} 345deg 360deg`
            ];
        }

        return `conic-gradient(${stops.join(', ')})`;
    };

    const getDescription = () => {
        if (step === 1) return "第一步：三原色 (Primary)。红、黄、蓝是色彩的基石，均匀分布在色轮上。";
        if (step === 2) return "第二步：三间色 (Secondary)。在两个原色之间混合，得到了橙、绿、紫。";
        return "第三步：复色 (Tertiary)。继续混合相邻的颜色，色轮变得更加丰富，形成了 12 色环。";
    };

    return (
        <div className="my-8 py-8 px-4 bg-gray-50 dark:bg-zinc-900/50 rounded-2xl border border-gray-100 dark:border-zinc-800 flex flex-col items-center">

            <div className="relative w-64 h-64 mb-8">
                {/* Visual Ring Track - Outer Border */}
                <div className="absolute inset-0 rounded-full border border-gray-200 dark:border-zinc-700"></div>

                {/* The Color Wheel Gradient */}
                <motion.div
                    className="absolute inset-2 rounded-full shadow-sm transition-all duration-700 ease-in-out"
                    style={{ background: getGradient(step) }}
                    initial={false}
                    animate={{ rotate: 0 }} // Re-trigger reflow if needed, or rely on state update
                >
                </motion.div>

                {/* Inner Mask to create Ring */}
                <div className="absolute inset-16 bg-gray-50 dark:bg-zinc-900 rounded-full shadow-inner flex items-center justify-center p-4 text-center z-10">
                    <span className="text-gray-400 text-xs font-mono">
                        {step === 1 ? "3 Colors" : step === 2 ? "6 Colors" : "12 Colors"}
                    </span>
                </div>

                {/* Labels (Simplified positioning for Primary) */}
                {step >= 1 && (
                    <>
                        {/* Red Top */}
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold text-gray-500">R</div>
                    </>
                )}
            </div>

            <div className="text-center space-y-4 max-w-lg">
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    {step === 1 ? "Primary Colors" : step === 2 ? "Secondary Colors" : "Tertiary Colors"}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 min-h-[3rem]">
                    {getDescription()}
                </p>

                <div className="flex gap-4 justify-center">
                    <button
                        onClick={prevStep}
                        disabled={step === 1}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${step === 1
                                ? "bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-zinc-800 dark:text-zinc-600"
                                : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-zinc-700 dark:text-gray-200"
                            }`}
                    >
                        上一步
                    </button>
                    <button
                        onClick={nextStep}
                        disabled={step === 3}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${step === 3
                                ? "bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-zinc-800 dark:text-zinc-600"
                                : "bg-blue-600 text-white hover:bg-blue-700"
                            }`}
                    >
                        {step === 2 ? "下一步：复色" : "下一步：混合"}
                    </button>
                </div>
            </div>
        </div>
    );
};
