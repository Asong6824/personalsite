"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.5,
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

export default function TempoGrid({ columns }) {
    return (
        <section className="relative py-24 px-4 sm:px-6 lg:px-8 z-10">
            <div className="max-w-7xl mx-auto">
                <motion.div
                    className="mb-16"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                        Selected Columns
                    </h2>
                    <div className="h-1 w-20 bg-blue-500 rounded-full" />
                </motion.div>

                <motion.div
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                >
                    {Object.entries(columns).map(([key, column]: [string, any], index) => (
                        <motion.div
                            key={key}
                            variants={itemVariants}
                            whileHover={{ y: -5 }}
                            className="group relative bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden hover:bg-white/10 transition-colors duration-300"
                        >
                            <Link href={`/blog/finance/${key}`} className="block p-8 h-full">
                                <div className="flex flex-col h-full">
                                    <div className="mb-6">
                                        <span className="text-sm font-mono text-blue-400">
                                            0{index + 1} ::
                                        </span>
                                        <h3 className="text-2xl font-bold text-white mt-2 group-hover:text-blue-300 transition-colors">
                                            {column.name}
                                        </h3>
                                    </div>

                                    <p className="text-gray-400 mb-8 flex-grow leading-relaxed">
                                        {column.description}
                                    </p>

                                    <div className="flex items-center justify-between text-sm text-gray-500 border-t border-white/10 pt-6">
                                        <span>{column.posts?.length || 0} Articles</span>
                                        <span className="group-hover:translate-x-1 transition-transform duration-300">
                                            →
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
