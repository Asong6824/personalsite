// src/components/features/HeroSection.jsx
"use client";
import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Canvas } from "@react-three/fiber";
import dynamic from "next/dynamic";

const GradientOrbCanvas = dynamic(() => import("./HeroSection/GradientOrbCanvas"), {
    ssr: false,
    loading: () => <div style={{ width: 80, height: 80, borderRadius: "50%", background: "#eee" }} />,
});

const FlowBackground = dynamic(() => import("./HeroSection/FlowBackground"), {
    ssr: false,
    loading: () => null,
});

const HeroSection = () => {
    const containerRef = useRef(null);

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"],
    });

    // Phase 1-2: Color wheel rotation and scale
    const colorWheelRotation = useTransform(scrollYProgress, [0, 0.40], [0, Math.PI * 4]);
    const colorWheelScale = useTransform(scrollYProgress, [0, 0.18], [1, 1.4]);
    const textOpacity = useTransform(scrollYProgress, [0.16, 0.26], [1, 0]);

    // Color wheel total scale (combined Phase 2 + Phase 3)
    const colorWheelTotalScale = useTransform(
        scrollYProgress,
        [0, 0.18, 0.40, 0.55],
        [1, 1.4, 1.4, 80]
    );

    // Fade out after expansion
    const colorWheelOpacity = useTransform(scrollYProgress, [0.55, 0.65], [1, 0]);

    // FlowBackground progress — starts when color wheel expands past 0.42
    const flowProgress = useTransform(scrollYProgress, [0.42, 0.60], [0, 1]);

    // Phase 4: Chinese quote reveal - words float up from below with larger offset
    const quote1Opacity = useTransform(scrollYProgress, [0.48, 0.56], [0, 1]);
    const quote2Opacity = useTransform(scrollYProgress, [0.56, 0.64], [0, 1]);
    const quote3Opacity = useTransform(scrollYProgress, [0.64, 0.72], [0, 1]);
    const quote4Opacity = useTransform(scrollYProgress, [0.72, 0.80], [0, 1]);

    // Larger Y offset for more dramatic float-up effect
    const quote1Y = useTransform(scrollYProgress, [0.48, 0.56], [60, 0]);
    const quote2Y = useTransform(scrollYProgress, [0.56, 0.64], [60, 0]);
    const quote3Y = useTransform(scrollYProgress, [0.64, 0.72], [60, 0]);
    const quote4Y = useTransform(scrollYProgress, [0.72, 0.80], [60, 0]);

    const scrollHintOpacity = useTransform(scrollYProgress, [0, 0.06], [1, 0]);

    return (
        <div ref={containerRef} className="relative h-[500vh]">
            <div className="sticky top-0 h-screen w-full overflow-hidden">
                {/* White background */}
                <div className="absolute inset-0 bg-white" />

                {/* FlowBackground R3F Canvas */}
                <div className="absolute inset-0 z-0">
                    <Canvas gl={{ alpha: true, antialias: true }}>
                        <FlowBackground uProgress={flowProgress} scrollYProgress={scrollYProgress} />
                    </Canvas>
                </div>

                {/* Main content */}
                <div className="absolute inset-0 flex items-center justify-center">
                    {/* Asong text with animated color wheel "o" */}
                    <motion.div
                        className="relative flex items-center justify-center select-none z-10"
                        style={{
                            scale: colorWheelScale,
                            opacity: textOpacity,
                        }}
                    >
                        <span
                            className="text-7xl md:text-8xl lg:text-9xl font-bold text-gray-900 tracking-tight"
                            style={{ fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif" }}
                        >
                            As
                        </span>

                        {/* Gradient Orb "o" */}
                        <motion.div
                            style={{
                                width: 80,
                                height: 80,
                                rotate: colorWheelRotation,
                                scale: colorWheelTotalScale,
                                opacity: colorWheelOpacity,
                            }}
                        >
                            <GradientOrbCanvas size={80} />
                        </motion.div>

                        <span
                            className="text-7xl md:text-8xl lg:text-9xl font-bold text-gray-900 tracking-tight"
                            style={{ fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif" }}
                        >
                            ng
                        </span>
                    </motion.div>

                    {/* Chinese quotes - float up from below */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-20">
                        <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
                            <motion.span
                                className="text-3xl md:text-4xl lg:text-5xl font-medium tracking-[0.15em] text-white"
                                style={{
                                    opacity: quote1Opacity,
                                    y: quote1Y,
                                    textShadow: "0 4px 30px rgba(0,0,0,0.2)",
                                    filter: "drop-shadow(0 2px 10px rgba(255,255,255,0.3))",
                                }}
                            >
                                大成若缺
                            </motion.span>

                            <motion.span
                                className="text-3xl md:text-4xl lg:text-5xl font-medium tracking-[0.15em] text-white"
                                style={{
                                    opacity: quote2Opacity,
                                    y: quote2Y,
                                    textShadow: "0 4px 30px rgba(0,0,0,0.2)",
                                    filter: "drop-shadow(0 2px 10px rgba(255,255,255,0.3))",
                                }}
                            >
                                其用不弊
                            </motion.span>

                            <motion.span
                                className="text-3xl md:text-4xl lg:text-5xl font-medium tracking-[0.15em] text-white"
                                style={{
                                    opacity: quote3Opacity,
                                    y: quote3Y,
                                    textShadow: "0 4px 30px rgba(0,0,0,0.2)",
                                    filter: "drop-shadow(0 2px 10px rgba(255,255,255,0.3))",
                                }}
                            >
                                大盈若冲
                            </motion.span>

                            <motion.span
                                className="text-3xl md:text-4xl lg:text-5xl font-medium tracking-[0.15em] text-white"
                                style={{
                                    opacity: quote4Opacity,
                                    y: quote4Y,
                                    textShadow: "0 4px 30px rgba(0,0,0,0.2)",
                                    filter: "drop-shadow(0 2px 10px rgba(255,255,255,0.3))",
                                }}
                            >
                                其用不穷
                            </motion.span>
                        </div>
                    </div>
                </div>

                {/* Scroll hint */}
                <motion.div
                    className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 z-30"
                    style={{ opacity: scrollHintOpacity }}
                >
                    <span className="text-sm text-gray-400 tracking-[0.3em] uppercase font-light">
                        Scroll
                    </span>
                    <motion.div
                        animate={{ y: [0, 8, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    >
                        <svg
                            className="w-5 h-5 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M19 14l-7 7m0 0l-7-7m7 7V3"
                            />
                        </svg>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
};

export default HeroSection;