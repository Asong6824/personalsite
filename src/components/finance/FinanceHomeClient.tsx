"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import Image from 'next/image';
import { SITE_WARM_BACKGROUND } from '@/lib/site-theme';

const FADE_UP = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const STAGGER = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1 }
    }
};

export default function FinanceHomeClient({ channelConfig, postsByColumn, allPosts }) {
    const columns = channelConfig.columns || {};
    const columnEntries = Object.entries(columns);

    // 获取最近的文章
    const recentPosts = allPosts.slice(0, 6);
    const featuredPost = recentPosts[0];
    const secondPost = recentPosts[1];
    const smallPosts = recentPosts.slice(2, 5);

    // 分类文章
    const investmentPosts = allPosts.filter(p =>
        (p.tags || []).some(t => ['财经', 'finance', '投资', 'investment', '市场分析', 'A股', '港股', '美股'].includes(t))
    ).slice(0, 3);

    const methodologyPosts = allPosts.filter(p =>
        (p.tags || []).some(t => ['方法论', 'methodology', '价值投资', '理财', '策略'].includes(t))
    ).slice(0, 3);

    return (
        <div className="min-h-screen" style={{ backgroundColor: SITE_WARM_BACKGROUND, color: '#1a1c19', fontFamily: 'var(--font-inter), Inter, sans-serif' }}>
            {/* Hero Section */}
            <header className="max-w-7xl mx-auto px-6 pt-32 pb-16 md:pt-40 md:pb-24 grid grid-cols-1 lg:grid-cols-12 gap-12 items-end">
                <motion.div
                    className="lg:col-span-8"
                    initial="hidden"
                    animate="visible"
                    variants={FADE_UP}
                >
                    <p className="font-medium tracking-widest uppercase text-xs mb-6" style={{ color: '#506354' }}>
                        Smart investing, rational decisions
                    </p>
                    <h1 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter leading-[1.1] mb-8"
                        style={{ fontFamily: 'var(--font-noto-serif-sc), "Noto Serif SC", serif' }}>
                        在波动中寻找秩序，<br />
                        在不确定性中寻找确定性。
                    </h1>
                    <div className="flex items-center gap-4">
                        <div className="h-px w-12" style={{ backgroundColor: 'rgba(196,199,199,0.4)' }}></div>
                        <p className="italic max-w-md" style={{ color: '#444748' }}>
                            Exploring the nexus of human behavior, economic cycles, and capital growth through a minimalist lens.
                        </p>
                    </div>
                </motion.div>
                <motion.div
                    className="lg:col-span-4 flex flex-col items-end"
                    initial="hidden"
                    animate="visible"
                    variants={{ ...FADE_UP, visible: { ...FADE_UP.visible, transition: { delay: 0.2, duration: 0.6 } } }}
                >
                    <div className="text-right">
                        <span className="text-3xl font-light" style={{ fontFamily: 'var(--font-jetbrains-mono), "JetBrains Mono", monospace', color: '#506354' }}>0.618</span>
                        <p className="text-[10px] uppercase tracking-widest mt-1" style={{ color: '#c4c7c7' }}>Market Efficiency Ratio</p>
                    </div>
                </motion.div>
            </header>

            {/* Featured Section: Bento Grid */}
            <section className="max-w-7xl mx-auto px-6 mb-24 md:mb-32">
                <motion.div
                    className="flex justify-between items-end mb-12"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={FADE_UP}
                >
                    <h2 className="text-3xl font-bold" style={{ fontFamily: 'var(--font-noto-serif-sc), "Noto Serif SC", serif' }}>
                        精选专题 / <span style={{ color: '#747878' }}>Featured</span>
                    </h2>
                    <Link href="/blog/finance/finance" className="group flex items-center gap-2 text-sm uppercase tracking-widest">
                        See All <span className="transition-transform group-hover:translate-x-1">→</span>
                    </Link>
                </motion.div>

                <motion.div
                    className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-6"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={STAGGER}
                >
                    {/* Large Card */}
                    {featuredPost ? (
                        <motion.article variants={FADE_UP} className="md:col-span-6 lg:col-span-8 group relative overflow-hidden rounded-xl aspect-[16/9] lg:aspect-auto">
                            <div className="absolute inset-0" style={{ backgroundColor: '#f4f4ef' }}>
                                {featuredPost.coverImage ? (
                                    <Image
                                        src={featuredPost.coverImage}
                                        alt={featuredPost.title}
                                        fill
                                        className="object-cover transition-transform duration-700 group-hover:scale-105 opacity-80 mix-blend-multiply grayscale"
                                    />
                                ) : (
                                    <div className="w-full h-full" style={{ background: 'linear-gradient(135deg, #e3e3de 0%, #c4c7c7 100%)' }} />
                                )}
                            </div>
                            <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)' }}></div>
                            <div className="absolute bottom-0 p-8 text-white">
                                <span className="inline-block px-3 py-1 text-[10px] font-bold uppercase rounded mb-4" style={{ backgroundColor: '#ffdea5', color: '#261900' }}>
                                    Investment Strategy
                                </span>
                                <h3 className="text-2xl md:text-3xl font-bold mb-4" style={{ fontFamily: 'var(--font-noto-serif-sc), "Noto Serif SC", serif' }}>
                                    {featuredPost.title}
                                </h3>
                                {featuredPost.excerpt && (
                                    <p className="text-white/80 max-w-lg mb-6 leading-relaxed line-clamp-2">{featuredPost.excerpt}</p>
                                )}
                                <Link href={`/blog/${featuredPost.slug}`} className="group flex items-center gap-2 text-sm">
                                    Read Article <div className="w-8 h-px bg-white/50 group-hover:w-12 transition-all"></div>
                                </Link>
                            </div>
                        </motion.article>
                    ) : (
                        <motion.div variants={FADE_UP} className="md:col-span-6 lg:col-span-8 rounded-xl p-8 flex items-center justify-center" style={{ backgroundColor: '#f4f4ef', aspectRatio: '16/9' }}>
                            <p style={{ color: '#747878' }}>暂无精选文章</p>
                        </motion.div>
                    )}

                    {/* Vertical Card */}
                    {secondPost ? (
                        <motion.article variants={FADE_UP} className="md:col-span-3 lg:col-span-4 rounded-xl p-8 flex flex-col justify-between" style={{ backgroundColor: '#e3e3de' }}>
                            <div>
                                <h3 className="text-xl font-bold leading-tight mb-4" style={{ fontFamily: 'var(--font-noto-serif-sc), "Noto Serif SC", serif' }}>{secondPost.title}</h3>
                                {secondPost.excerpt && <p className="text-sm leading-relaxed line-clamp-3" style={{ color: '#444748' }}>{secondPost.excerpt}</p>}
                            </div>
                            <div className="mt-8 pt-8 flex justify-between items-center" style={{ borderTop: '1px solid rgba(196,199,199,0.2)' }}>
                                <span className="text-xs" style={{ fontFamily: 'var(--font-jetbrains-mono), "JetBrains Mono", monospace', color: '#747878' }}>
                                    {secondPost.date ? format(parseISO(secondPost.date), 'MMM yyyy', { locale: zhCN }).toUpperCase() : ''}
                                </span>
                            </div>
                        </motion.article>
                    ) : (
                        <motion.div variants={FADE_UP} className="md:col-span-3 lg:col-span-4 rounded-xl p-8 flex flex-col justify-center" style={{ backgroundColor: '#e3e3de' }}>
                            <p className="text-sm" style={{ color: '#747878' }}>敬请期待更多内容</p>
                        </motion.div>
                    )}

                    {/* Small Grid Items */}
                    {smallPosts.map((post, i) => (
                        <motion.div key={post.slug} variants={FADE_UP} className="md:col-span-3 lg:col-span-4 rounded-xl p-6" style={{ backgroundColor: '#f4f4ef', borderBottom: `4px solid ${i === 0 ? 'rgba(80,99,84,0.2)' : i === 1 ? 'rgba(233,193,118,0.4)' : 'rgba(186,26,26,0.2)'}` }}>
                            <h4 className="text-lg font-bold mb-2" style={{ fontFamily: 'var(--font-noto-serif-sc), "Noto Serif SC", serif' }}>{post.title}</h4>
                            {post.excerpt && <p className="text-xs line-clamp-2" style={{ color: '#444748' }}>{post.excerpt}</p>}
                        </motion.div>
                    ))}
                    {smallPosts.length < 3 && Array.from({ length: 3 - smallPosts.length }).map((_, i) => (
                        <motion.div key={`empty-${i}`} variants={FADE_UP} className="md:col-span-3 lg:col-span-4 rounded-xl p-6 flex items-center justify-center" style={{ backgroundColor: '#f4f4ef', borderBottom: `4px solid rgba(196,199,199,0.2)` }}>
                            <p className="text-xs" style={{ color: '#747878' }}>即将发布</p>
                        </motion.div>
                    ))}
                </motion.div>
            </section>

            {/* Two Column Archive Section */}
            <section className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 mb-24 md:mb-32">
                {/* Category One: 财经投资 */}
                <div>
                    <div className="flex items-center justify-between mb-12 pb-4" style={{ borderBottom: '1px solid rgba(196,199,199,0.15)' }}>
                        <h3 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-noto-serif-sc), "Noto Serif SC", serif' }}>
                            财经投资 <span className="text-sm font-normal ml-2 opacity-40" style={{ fontFamily: 'var(--font-jetbrains-mono), "JetBrains Mono", monospace' }}>/ {investmentPosts.length} Articles</span>
                        </h3>
                        <span>↗</span>
                    </div>
                    <div className="space-y-10">
                        {investmentPosts.length > 0 ? investmentPosts.map((post, index) => (
                            <div key={post.slug} className="group flex gap-6">
                                <div className="shrink-0 w-24 h-24 rounded-lg overflow-hidden" style={{ backgroundColor: '#e3e3de' }}>
                                    {post.coverImage ? (
                                        <Image src={post.coverImage} alt={post.title} width={96} height={96} className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 transition-all" />
                                    ) : (
                                        <div className="w-full h-full" style={{ background: 'linear-gradient(135deg, #e3e3de, #c4c7c7)' }} />
                                    )}
                                </div>
                                <div>
                                    <span className="text-[10px] uppercase tracking-widest" style={{ fontFamily: 'var(--font-jetbrains-mono), "JetBrains Mono", monospace', color: '#c4c7c7' }}>Insight #0{index + 1}</span>
                                    <Link href={`/blog/${post.slug}`}>
                                        <h4 className="text-lg font-semibold mt-1 mb-2 group-hover:text-[#506354] transition-colors" style={{ fontFamily: 'var(--font-noto-serif-sc), "Noto Serif SC", serif' }}>{post.title}</h4>
                                    </Link>
                                    {post.excerpt && <p className="text-sm line-clamp-1" style={{ color: '#444748' }}>{post.excerpt}</p>}
                                </div>
                            </div>
                        )) : (
                            <p className="text-sm" style={{ color: '#747878' }}>暂无文章</p>
                        )}
                    </div>
                    <Link href="/blog/finance/finance">
                        <button className="mt-12 w-full py-4 text-xs tracking-widest uppercase rounded-lg transition-colors hover:opacity-80" style={{ backgroundColor: '#eeeee9', color: '#444748' }}>
                            View Category Archive
                        </button>
                    </Link>
                </div>

                {/* Category Two: 投资方法论 */}
                <div>
                    <div className="flex items-center justify-between mb-12 pb-4" style={{ borderBottom: '1px solid rgba(196,199,199,0.15)' }}>
                        <h3 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-noto-serif-sc), "Noto Serif SC", serif' }}>
                            投资方法论 <span className="text-sm font-normal ml-2 opacity-40" style={{ fontFamily: 'var(--font-jetbrains-mono), "JetBrains Mono", monospace' }}>/ {methodologyPosts.length} Articles</span>
                        </h3>
                        <span>◎</span>
                    </div>
                    <div className="space-y-6">
                        {methodologyPosts.length > 0 ? methodologyPosts.map((post, index) => (
                            <article key={post.slug} className="p-6 rounded-xl group cursor-pointer transition-all hover:border-l-2" style={{ backgroundColor: '#f4f4ef', borderLeft: '2px solid transparent' }}>
                                <span className="text-[10px]" style={{ fontFamily: 'var(--font-jetbrains-mono), "JetBrains Mono", monospace', color: '#506354' }}>METHOD_0{index + 1}</span>
                                <Link href={`/blog/${post.slug}`}>
                                    <h4 className="text-xl font-bold mt-2 mb-3" style={{ fontFamily: 'var(--font-noto-serif-sc), "Noto Serif SC", serif' }}>{post.title}</h4>
                                </Link>
                                {post.excerpt && <p className="text-sm leading-relaxed" style={{ color: '#444748' }}>{post.excerpt}</p>}
                            </article>
                        )) : (
                            <p className="text-sm" style={{ color: '#747878' }}>暂无文章</p>
                        )}
                    </div>
                    <Link href="/blog/finance/finance">
                        <button className="mt-12 w-full py-4 text-xs tracking-widest uppercase rounded-lg transition-colors hover:opacity-80" style={{ border: '1px solid rgba(196,199,199,0.3)', color: '#444748' }}>
                            Explore All Frameworks
                        </button>
                    </Link>
                </div>
            </section>

            {/* Columns Grid */}
            <section className="max-w-7xl mx-auto px-6 mb-24 md:mb-32">
                <motion.div
                    className="flex justify-between items-end mb-12"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={FADE_UP}
                >
                    <h2 className="text-3xl font-bold" style={{ fontFamily: 'var(--font-noto-serif-sc), "Noto Serif SC", serif' }}>
                        专栏 / <span style={{ color: '#747878' }}>Columns</span>
                    </h2>
                </motion.div>
                <motion.div
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={STAGGER}
                >
                    {columnEntries.map(([key, column]: [string, any], index) => {
                        const colPosts = postsByColumn[key] || [];
                        return (
                            <motion.div key={key} variants={FADE_UP}>
                                <Link href={`/blog/finance/${key}`} className="group block rounded-xl p-8 h-full transition-all duration-300 hover:shadow-lg" style={{ backgroundColor: '#f4f4ef' }}>
                                    <div className="flex flex-col h-full">
                                        <div className="mb-6">
                                            <span className="text-sm" style={{ fontFamily: 'var(--font-jetbrains-mono), "JetBrains Mono", monospace', color: '#506354' }}>
                                                0{index + 1} ::
                                            </span>
                                            <h3 className="text-2xl font-bold mt-2 group-hover:text-[#506354] transition-colors" style={{ fontFamily: 'var(--font-noto-serif-sc), "Noto Serif SC", serif' }}>
                                                {column.name}
                                            </h3>
                                        </div>
                                        <p className="mb-8 flex-grow leading-relaxed text-sm" style={{ color: '#444748' }}>
                                            {column.description}
                                        </p>
                                        <div className="flex items-center justify-between text-sm pt-6" style={{ borderTop: '1px solid rgba(196,199,199,0.2)', color: '#747878' }}>
                                            <span>{colPosts.length} Articles</span>
                                            <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        );
                    })}
                </motion.div>
            </section>

            {/* Newsletter / Minimalist CTA */}
            <section className="max-w-7xl mx-auto px-6 mb-24 md:mb-32">
                <div className="py-24 px-12 rounded-xl text-center relative overflow-hidden" style={{ backgroundColor: '#1a1c19' }}>
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <span className="text-white text-9xl">📈</span>
                    </div>
                    <div className="relative z-10 max-w-2xl mx-auto">
                        <h2 className="text-white text-4xl font-bold mb-6" style={{ fontFamily: 'var(--font-noto-serif-sc), "Noto Serif SC", serif' }}>
                            每周一次的冷静思考。
                        </h2>
                        <p className="text-white/60 mb-10 leading-relaxed">
                            加入读者的行列，每周接收一份深度市场分析与投资方法论推送。无垃圾信息，只有理性的洞见。
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <input
                                type="email"
                                placeholder="Your email address"
                                className="flex-grow px-6 py-4 rounded-lg outline-none transition-all"
                                style={{ backgroundColor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white' }}
                            />
                            <button className="px-10 py-4 font-bold rounded-lg transition-colors" style={{ backgroundColor: '#ffdea5', color: '#261900' }}>
                                Subscribe Now
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="w-full py-16" style={{ backgroundColor: '#f4f4ef' }}>
                <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 md:grid-cols-3 gap-12 text-sm leading-relaxed">
                    <div>
                        <p className="text-lg italic mb-6" style={{ fontFamily: 'var(--font-newsreader), Newsreader, serif', color: '#1a1c19' }}>金融 Editorial</p>
                        <p className="max-w-xs" style={{ color: '#444748' }}>
                            致力通过理性的视角解析复杂的金融世界，为专业投资者提供具有洞察力的深度内容。
                        </p>
                    </div>
                    <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <p className="font-bold" style={{ color: '#1a1c19' }}>Navigation</p>
                            <ul className="space-y-2">
                                <li><Link href="/blog/finance/finance" className="transition-colors duration-300 hover:text-[#d4af37]" style={{ color: '#444748' }}>Archive</Link></li>
                                <li><Link href="/blog" className="transition-colors duration-300 hover:text-[#d4af37]" style={{ color: '#444748' }}>Categories</Link></li>
                            </ul>
                        </div>
                        <div className="space-y-4">
                            <p className="font-bold" style={{ color: '#1a1c19' }}>Legal</p>
                            <ul className="space-y-2">
                                <li><span className="transition-colors duration-300 hover:text-[#d4af37]" style={{ color: '#444748' }}>Privacy</span></li>
                                <li><span className="transition-colors duration-300 hover:text-[#d4af37]" style={{ color: '#444748' }}>Terms</span></li>
                            </ul>
                        </div>
                    </div>
                    <div className="flex flex-col md:items-end gap-6">
                        <p style={{ color: '#444748' }}>© 2024 金融 Editorial. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
