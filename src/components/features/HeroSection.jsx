// src/components/features/HeroSection.jsx
"use client";
import React from 'react';
import { motion } from "motion/react";
import { AuroraBackground } from "../ui/aurora-background";

const HeroSection = () => {
    return (
        <AuroraBackground>
            <motion.div
                initial={{ opacity: 0.0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{
                    delay: 0.3,
                    duration: 0.8,
                    ease: "easeInOut",
                }}
                className="relative flex flex-col gap-4 items-center justify-center px-4"
            >
                <div className="text-3xl md:text-7xl font-bold dark:text-white text-center font-cursive">
                    且听松涛
                </div>
                <div className="font-extralight text-base md:text-4xl dark:text-neutral-200 py-4">
                    大成若缺 其用不弊 大盈若冲 其用不穷
                </div>
            </motion.div>
        </AuroraBackground>
    );
};

export default HeroSection;