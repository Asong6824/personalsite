"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { SITE_WARM_BACKGROUND } from '@/lib/site-theme';

const FADE_UP = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const STAGGER = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.08 }
    }
};

export default function FinanceColumnLayout({ channelConfig, columnConfig, posts, columnKey }) {
    const [activeTag, setActiveTag] = useState('全部文章');

    // 从文章中提取标签
    const allTags = ['全部文章'];
    posts.forEach(post => {
        (post.tags || []).forEach(tag => {
            if (!allTags.includes(tag)) allTags.push(tag);
        });
    });
    const displayTags = allTags.slice(0, 6);

    const filteredPosts = activeTag === '全部文章'
        ? posts
        : posts.filter(p => (p.tags || []).includes(activeTag));

    const totalCount = posts.length;
    const uniqueAuthors = [...new Set(posts.map(p => p.author).filter(Boolean))];

    return (
        <div className="min-h-screen" style={{ backgroundColor: SITE_WARM_BACKGROUND, color: '#1a1c19', fontFamily: 'var(--font-inter), Inter, sans-serif' }}>
            <main className="max-w-7xl mx-auto px-6 pt-24 pb-12">
                {/* Breadcrumbs */}
                <nav className="flex items-center space-x-2 text-sm mb-8" style={{ color: '#444748' }}>
                    <Link href="/" className="hover:text-[#1a1c19] transition-colors">首页</Link>
                    <span>›</span>
                    <Link href="/blog" className="hover:text-[#1a1c19] transition-colors">博客</Link>
                    <span>›</span>
                    <Link href="/blog/finance" className="hover:text-[#1a1c19] transition-colors">金融</Link>
                    <span>›</span>
                    <span className="font-medium" style={{ color: '#1a1c19' }}>{columnConfig.name}</span>
                </nav>

                {/* Column Header */}
                <motion.header
                    className="mb-16 md:mb-20"
                    initial="hidden"
                    animate="visible"
                    variants={FADE_UP}
                >
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div className="max-w-2xl">
                            <h1 className="text-5xl md:text-6xl font-black tracking-tighter mb-6" style={{ fontFamily: 'var(--font-noto-serif-sc), "Noto Serif SC", serif', color: '#1a1c19' }}>
                                {columnConfig.name}
                            </h1>
                            <p className="text-xl leading-relaxed" style={{ color: '#444748' }}>
                                {columnConfig.description}
                            </p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                            <span className="text-sm uppercase tracking-widest font-bold" style={{ fontFamily: 'var(--font-jetbrains-mono), "JetBrains Mono", monospace', color: '#506354' }}>Editorial Column</span>
                            <div className="h-1 w-24" style={{ backgroundColor: '#1a1c19' }}></div>
                        </div>
                    </div>
                </motion.header>

                {/* Filters / Tags */}
                {displayTags.length > 1 && (
                    <motion.section
                        className="mb-12 flex flex-wrap items-center gap-3"
                        initial="hidden"
                        animate="visible"
                        variants={{ ...FADE_UP, visible: { ...FADE_UP.visible, transition: { delay: 0.15, duration: 0.5 } } }}
                    >
                        {displayTags.map(tag => (
                            <button
                                key={tag}
                                onClick={() => setActiveTag(tag)}
                                className="px-5 py-2 rounded-full text-sm font-medium transition-all"
                                style={{
                                    backgroundColor: activeTag === tag ? '#1a1c19' : '#f4f4ef',
                                    color: activeTag === tag ? '#ffffff' : '#1a1c19'
                                }}
                            >
                                {tag}
                            </button>
                        ))}
                    </motion.section>
                )}

                {/* Article List Layout */}
                {filteredPosts.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
                        {/* Main Content Area */}
                        <motion.div
                            className="lg:col-span-8 space-y-12 md:space-y-16"
                            initial="hidden"
                            animate="visible"
                            variants={STAGGER}
                        >
                            {filteredPosts.map((post) => (
                                <motion.article key={post.slug} variants={FADE_UP} className="group relative flex flex-col md:flex-row gap-6 md:gap-8 items-start">
                                    <div className="w-full md:w-1/3 aspect-[4/3] rounded-xl overflow-hidden flex-shrink-0" style={{ backgroundColor: '#f4f4ef' }}>
                                        {post.coverImage ? (
                                            <Image
                                                src={post.coverImage}
                                                alt={post.title}
                                                width={400}
                                                height={300}
                                                className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
                                            />
                                        ) : (
                                            <div className="w-full h-full" style={{ background: 'linear-gradient(135deg, #e3e3de, #c4c7c7)' }} />
                                        )}
                                    </div>
                                    <div className="flex-1 flex flex-col">
                                        <div className="flex items-center gap-4 mb-3">
                                            <span className="text-xs tracking-widest uppercase" style={{ fontFamily: 'var(--font-jetbrains-mono), "JetBrains Mono", monospace', color: '#506354' }}>
                                                {(post.tags || [])[0] || 'Article'}
                                            </span>
                                            <span className="text-xs font-medium" style={{ color: '#747878' }}>
                                                {post.date ? format(parseISO(post.date), 'yyyy.MM.dd') : ''}
                                            </span>
                                        </div>
                                        <Link href={`/blog/${post.slug}`}>
                                            <h2 className="text-2xl font-bold leading-tight mb-4 group-hover:underline underline-offset-8 transition-all" style={{ fontFamily: 'var(--font-noto-serif-sc), "Noto Serif SC", serif', color: '#1a1c19', textDecorationColor: '#ffdea5' }}>
                                                {post.title}
                                            </h2>
                                        </Link>
                                        {post.excerpt && (
                                            <p className="text-base leading-relaxed mb-6 line-clamp-2" style={{ color: '#444748' }}>
                                                {post.excerpt}
                                            </p>
                                        )}
                                        <div className="flex items-center justify-between mt-auto">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full" style={{ backgroundColor: '#e3e3de' }}></div>
                                                <span className="text-sm font-medium" style={{ color: '#1a1c19' }}>{post.author || '阿松'}</span>
                                            </div>
                                            <Link href={`/blog/${post.slug}`} className="text-xs font-bold uppercase tracking-widest flex items-center gap-1 group-hover:gap-2 transition-all" style={{ color: '#1a1c19' }}>
                                                READ ARTICLE <span>→</span>
                                            </Link>
                                        </div>
                                    </div>
                                </motion.article>
                            ))}

                            {/* Load More Button */}
                            <div className="pt-8 flex justify-center">
                                <button className="px-12 py-4 text-sm font-bold tracking-widest uppercase transition-all duration-300 hover:text-white rounded-lg" style={{ border: '1px solid rgba(196,199,199,0.3)', color: '#1a1c19' }}>
                                    View Archive
                                </button>
                            </div>
                        </motion.div>

                        {/* Sidebar */}
                        <aside className="lg:col-span-4 space-y-12 md:space-y-16">
                            {/* Column Stats */}
                            <div className="p-8 rounded-xl" style={{ backgroundColor: '#f4f4ef', border: '1px solid rgba(196,199,199,0.1)' }}>
                                <h3 className="text-lg font-bold mb-6" style={{ fontFamily: 'var(--font-noto-serif-sc), "Noto Serif SC", serif' }}>专栏洞察</h3>
                                <div className="space-y-6">
                                    <div className="flex justify-between items-center pb-4" style={{ borderBottom: '1px solid rgba(196,199,199,0.2)' }}>
                                        <span className="text-sm font-medium" style={{ color: '#444748' }}>文章数量</span>
                                        <span className="text-sm font-bold" style={{ fontFamily: 'var(--font-jetbrains-mono), "JetBrains Mono", monospace', color: '#506354' }}>{totalCount} 篇</span>
                                    </div>
                                    <div className="flex justify-between items-center pb-4" style={{ borderBottom: '1px solid rgba(196,199,199,0.2)' }}>
                                        <span className="text-sm font-medium" style={{ color: '#444748' }}>作者</span>
                                        <span className="text-sm font-bold" style={{ fontFamily: 'var(--font-jetbrains-mono), "JetBrains Mono", monospace', color: '#506354' }}>{uniqueAuthors.length} 位</span>
                                    </div>
                                    <div className="flex justify-between items-center pb-4">
                                        <span className="text-sm font-medium" style={{ color: '#444748' }}>最近更新</span>
                                        <span className="text-sm font-bold" style={{ fontFamily: 'var(--font-jetbrains-mono), "JetBrains Mono", monospace', color: '#506354' }}>
                                            {posts[0]?.date ? format(parseISO(posts[0].date), 'yyyy.MM') : '-'}
                                        </span>
                                    </div>
                                </div>
                                <button className="w-full mt-6 py-3 text-sm font-bold rounded-lg transition-all hover:opacity-90" style={{ backgroundColor: '#1a1c19', color: '#ffffff' }}>
                                    订阅此专栏
                                </button>
                            </div>

                            {/* Trending Topics */}
                            {posts.length > 0 && (
                                <div>
                                    <h3 className="text-lg font-bold mb-8" style={{ fontFamily: 'var(--font-noto-serif-sc), "Noto Serif SC", serif' }}>热点议题</h3>
                                    <div className="space-y-6">
                                        {posts.slice(0, 3).map((post, idx) => (
                                            <Link key={post.slug} href={`/blog/${post.slug}`} className="group block">
                                                <p className="text-xs mb-2" style={{ fontFamily: 'var(--font-jetbrains-mono), "JetBrains Mono", monospace', color: '#506354' }}>0{idx + 1} / TOPIC</p>
                                                <h4 className="font-medium group-hover:text-[#1a1c19] transition-colors" style={{ color: '#1a1c19' }}>{post.title}</h4>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Quote Card */}
                            <div className="relative overflow-hidden rounded-xl aspect-[3/4]" style={{ backgroundColor: '#1a1c19' }}>
                                <div className="absolute inset-0 p-8 flex flex-col justify-end">
                                    <p className="italic text-xl mb-4 leading-relaxed text-white" style={{ fontFamily: 'var(--font-noto-serif-sc), "Noto Serif SC", serif' }}>
                                        &ldquo;在别人的恐惧中贪婪，在别人的贪婪中恐惧。&rdquo;
                                    </p>
                                    <span className="text-xs uppercase tracking-widest text-white/60" style={{ fontFamily: 'var(--font-jetbrains-mono), "JetBrains Mono", monospace' }}>— Warren Buffett</span>
                                </div>
                            </div>
                        </aside>
                    </div>
                ) : (
                    /* Empty State */
                    <motion.div
                        className="flex flex-col items-center justify-center py-40 text-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        <span className="text-6xl mb-6" style={{ color: '#c4c7c7' }}>📭</span>
                        <h3 className="text-2xl font-bold mb-2" style={{ fontFamily: 'var(--font-noto-serif-sc), "Noto Serif SC", serif', color: '#1a1c19' }}>该专栏暂无文章</h3>
                        <p className="max-w-sm" style={{ color: '#444748' }}>作者正在深度研究中，请耐心等待新的见解发布。</p>
                    </motion.div>
                )}
            </main>

            {/* Footer */}
            <footer className="w-full py-16 mt-20" style={{ backgroundColor: '#f4f4ef' }}>
                <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 md:grid-cols-3 gap-12 text-sm leading-relaxed">
                    <div className="space-y-6">
                        <div className="text-lg italic" style={{ fontFamily: 'var(--font-newsreader), Newsreader, serif', color: '#1a1c19' }}>金融 Editorial</div>
                        <p className="max-w-xs" style={{ color: '#444748' }}>
                            专注于提供高品质的财经投资深度见解。我们不提供交易建议，只提供思考的坐标。
                        </p>
                    </div>
                    <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <h4 className="font-bold uppercase tracking-widest text-xs" style={{ color: '#1a1c19' }}>Navigation</h4>
                            <ul className="space-y-2">
                                <li><Link href="/blog/finance" className="transition-colors duration-300 hover:text-[#d4af37]" style={{ color: '#444748' }}>About</Link></li>
                                <li><Link href="/blog/finance/finance" className="transition-colors duration-300 hover:text-[#d4af37]" style={{ color: '#444748' }}>Archive</Link></li>
                            </ul>
                        </div>
                        <div className="space-y-4">
                            <h4 className="font-bold uppercase tracking-widest text-xs" style={{ color: '#1a1c19' }}>Legal</h4>
                            <ul className="space-y-2">
                                <li><span className="transition-colors duration-300 hover:text-[#d4af37]" style={{ color: '#444748' }}>Privacy</span></li>
                                <li><span className="transition-colors duration-300 hover:text-[#d4af37]" style={{ color: '#444748' }}>Terms</span></li>
                            </ul>
                        </div>
                    </div>
                    <div className="flex flex-col justify-between items-end h-full">
                        <div className="text-right">
                            <p style={{ color: '#444748' }}>© 2024 金融 Editorial. All rights reserved.</p>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
