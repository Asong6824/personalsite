"use client";

import React, { useRef } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Palette } from 'lucide-react';
import { CHANNELS_CONFIG } from '@/lib/channels';
import { SITE_WARM_BACKGROUND } from '@/lib/site-theme';

const creativeConfig = CHANNELS_CONFIG.creative;
const CARD_W = 300;
const CARD_H = 200;

function CardContent({ column, index, icon }) {
    return (
        <div style={{ width: CARD_W, height: CARD_H, padding: '32px 40px' }} className="flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-5">
                <span className="text-neutral-700">{icon}</span>
                <span className="text-xs font-mono tracking-wider text-neutral-400 uppercase">
                    {String(index + 1).padStart(2, '0')}
                </span>
            </div>
            <h2 className="text-2xl font-semibold text-neutral-900 mb-2">{column.name}</h2>
            <p className="text-sm text-neutral-500 leading-relaxed mb-8">{column.description}</p>
            <div className="flex items-center gap-2 text-neutral-700 group-hover:text-indigo-600 transition-colors duration-300">
                <span className="text-sm font-medium">进入专栏</span>
                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            </div>
        </div>
    );
}

/* 加载完成前的 fallback — 保持同样的尺寸和位置 */
function CardFallback({ children }) {
    return (
        <div className="absolute inset-0 rounded-[32px] border border-neutral-200/50 shadow-[0_1px_3px_rgba(0,0,0,0.05),0_4px_12px_rgba(0,0,0,0.03)]">
            {children}
        </div>
    );
}

import { LiquidGlassWrapper } from '@/components/creative/LiquidGlassWrapper';

function ColumnCard({ columnKey, column, index, icon }) {
    const cardRef = useRef(null);

    return (
        <motion.div
            ref={cardRef}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 + index * 0.15, duration: 0.7 }}
            className="relative"
            style={{ width: CARD_W, height: CARD_H }}
        >
            <Link href={`/blog/creative/${columnKey}`} className="block group">
                <LiquidGlassWrapper
                    mouseContainer={cardRef}
                    displacementScale={60}
                    blurAmount={0.3}
                    saturation={140}
                    aberrationIntensity={2}
                    elasticity={0.15}
                    cornerRadius={32}
                    overLight={false}
                    mode="standard"
                    padding="0"
                    style={{ position: 'absolute', top: '50%', left: '50%' }}
                    fallback={
                        <CardFallback>
                            <CardContent column={column} index={index} icon={icon} />
                        </CardFallback>
                    }
                >
                    <CardContent column={column} index={index} icon={icon} />
                </LiquidGlassWrapper>

                {/* hover 时增强边界可见性 */}
                <div className="pointer-events-none absolute inset-0 rounded-[32px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 border border-neutral-300/50 shadow-[0_4px_20px_rgba(0,0,0,0.06)]" />
            </Link>
        </motion.div>
    );
}

export default function CreativePage() {
    const columns = Object.entries(creativeConfig.columns);

    const columnIconMap = {
        design: <Palette className="w-6 h-6" />,
        product: <Sparkles className="w-6 h-6" />,
    };

    return (
        <div
            className="relative min-h-screen overflow-hidden"
            style={{ backgroundColor: SITE_WARM_BACKGROUND }}
        >
            {/* 极淡的环境光晕 — 不破坏米色纸感 */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-10%] right-[-5%] w-[50%] h-[50%] rounded-full bg-white/35 blur-[100px]" />
                <div className="absolute bottom-[-10%] left-[-5%] w-[50%] h-[50%] rounded-full bg-[#E2DBCE]/45 blur-[100px]" />
            </div>

            <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 py-20">
                {/* Title */}
                <motion.div
                    initial={{ opacity: 0, y: -30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="text-center mb-6"
                >
                    <span className="inline-block px-4 py-1.5 mb-6 text-xs font-mono tracking-[0.3em] uppercase text-neutral-400 border border-neutral-200 rounded-full">
                        Creative Channel
                    </span>
                    <h1 className="text-6xl sm:text-7xl md:text-8xl font-extralight tracking-tight text-neutral-900 mb-4">
                        创意
                    </h1>
                    <p className="text-lg md:text-xl text-neutral-500 font-light tracking-wide">
                        逻辑与感性的液态交汇
                    </p>
                </motion.div>

                <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.4, duration: 0.8 }}
                    className="w-24 h-px bg-gradient-to-r from-transparent via-neutral-300 to-transparent mb-16"
                />

                {/* Cards */}
                <div className="flex flex-col sm:flex-row gap-6 items-center justify-center max-w-4xl w-full">
                    {columns.map(([columnKey, column], index) => (
                        <ColumnCard
                            key={columnKey}
                            columnKey={columnKey}
                            column={column}
                            index={index}
                            icon={columnIconMap[columnKey]}
                        />
                    ))}
                </div>

                {/* Bottom nav */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2, duration: 0.6 }}
                    className="mt-20"
                >
                    <Link
                        href="/blog"
                        className="inline-flex items-center gap-2 px-6 py-3 text-sm text-neutral-400 hover:text-neutral-700 transition-colors border border-neutral-200 hover:border-neutral-300 rounded-full"
                    >
                        <ArrowRight className="w-4 h-4 rotate-180" />
                        返回博客主页
                    </Link>
                </motion.div>
            </div>
        </div>
    );
}
