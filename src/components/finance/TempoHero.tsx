"use client";

import React from 'react';
import { motion } from 'framer-motion';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.3,
        },
    },
};

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: {
            type: "spring" as any,
            stiffness: 100,
            damping: 10,
        },
    },
};

export default function TempoHero({ title, subtitle, description }) {
    return (
        <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 z-10 pointer-events-none">
            <motion.div
                className="max-w-4xl mx-auto text-center pointer-events-auto"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <motion.h1
                    className="text-5xl sm:text-7xl md:text-8xl font-bold tracking-tight text-white mb-6 leading-tight"
                    variants={itemVariants}
                >
                    {title}
                    <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                        {subtitle}
                    </span>
                </motion.h1>

                <motion.p
                    className="text-xl sm:text-2xl text-gray-300 max-w-2xl mx-auto mb-10 leading-relaxed"
                    variants={itemVariants}
                >
                    {description}
                </motion.p>

                <motion.div variants={itemVariants}>
                    <button className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-white bg-white/10 backdrop-blur-sm border border-white/20 rounded-full overflow-hidden transition-all hover:bg-white/20 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900">
                        <span className="relative z-10">Explore Content</span>
                        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
                    </button>
                </motion.div>
            </motion.div>
        </section>
    );
}
