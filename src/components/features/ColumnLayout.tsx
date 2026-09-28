// src/components/features/ColumnLayout.jsx
"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { GlassCard } from '@/components/creative/GlassCard';

export default function ColumnLayout({ channelKey, channelConfig, columnKey, columnConfig, posts }) {
    // 检查频道类型
    const isTechChannel = channelKey === 'tech';
    const isLifeChannel = channelKey === 'life';
    const isFinanceChannel = channelKey === 'finance';
    const isCreativeChannel = channelKey === 'creative';

    // 根据频道定义主题色
    const getChannelTheme = () => {
        switch (channelKey) {
            case 'life':
                return {
                    primary: 'var(--color-site-blue-700)',
                    primaryHover: 'var(--color-site-blue-800)',
                    cardRadius: 'rounded-none', // 直角
                };
            case 'tech':
                return {
                    primary: 'var(--color-site-ink)',
                    primaryHover: 'var(--color-site-stone-600)',
                    cardRadius: 'rounded-2xl',
                };
            case 'finance':
                return {
                    primary: 'var(--color-site-lime-700)',
                    primaryHover: 'var(--color-site-lime-800)',
                    cardRadius: 'rounded-2xl',
                };
            case 'creative':
                return {
                    primary: 'var(--color-site-violet-700)',
                    primaryHover: 'var(--color-site-violet-800)',
                    cardRadius: 'rounded-3xl',
                };
            default:
                return {
                    primary: 'var(--color-site-orange-700)',
                    primaryHover: 'var(--color-site-orange-800)',
                    cardRadius: 'rounded-2xl',
                };
        }
    };

    const theme = getChannelTheme();



    return (
        <div
            className="min-h-screen"
            style={{ backgroundColor: 'var(--site-page-bg)' }}
            {...(isTechChannel && { 'data-tech-page': true })}
            {...(isLifeChannel && { 'data-life-page': true })}
        >
            <div className="container mx-auto px-4 pt-24 pb-8 md:pt-28 md:pb-12">
                {/* 专栏标题 */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-12"
                >
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <h1 className="text-4xl md:text-5xl font-bold" style={{ color: theme.primary }}>
                            {columnConfig.name}
                        </h1>
                    </div>
                    <p className="text-lg max-w-2xl mx-auto" style={isTechChannel || isLifeChannel ? { color: 'var(--channel-muted)' } : {}}>
                        {columnConfig.description}
                    </p>

                    {/* 面包屑导航 */}
                    <nav className="mt-6 text-sm text-site-neutral-500 dark:text-site-slate-400" style={isTechChannel || isLifeChannel ? { color: 'var(--channel-muted)' } : {}}>
                        <Link href="/" className="transition-colors hover:text-primary" style={isTechChannel || isLifeChannel ? { color: 'var(--channel-muted)' } : {}}>首页</Link>
                        <span className="mx-2">{'>'}</span>
                        <Link href="/blog" className="transition-colors hover:text-primary" style={isTechChannel || isLifeChannel ? { color: 'var(--channel-muted)' } : {}}>博客</Link>
                        <span className="mx-2">{'>'}</span>
                        <Link href={`/blog/${channelKey}`} className="transition-colors hover:text-primary" style={isTechChannel || isLifeChannel ? { color: 'var(--channel-muted)' } : {}}>{channelConfig.name}</Link>
                        <span className="mx-2">{'>'}</span>
                        <span style={{ color: theme.primary }}>{columnConfig.name}</span>
                    </nav>

                    {/* 文章统计 */}
                    <div className="mt-4 text-sm text-site-neutral-500 dark:text-site-slate-400" style={isTechChannel || isLifeChannel ? { color: 'var(--channel-muted)' } : {}}>
                        共 {posts.length} 篇文章
                    </div>


                </motion.div>

                {/* 文章列表 */}
                {posts.length > 0 ? (
                    <div className="max-w-4xl mx-auto">
                        <div className="grid gap-6">
                            {posts.map((post, index) => (
                                <motion.article
                                    key={post.slug}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1, duration: 0.6 }}
                                    className="group"
                                >
                                    <Link href={`/blog/${post.slug}`}>
                                        {isCreativeChannel ? (
                                            <GlassCard hover className="p-6 md:p-8">
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="flex-1 min-w-0">
                                                        <h2 className="text-xl md:text-2xl font-bold text-site-stone-50 transition-colors mb-3 line-clamp-2 group-hover:text-site-violet-300">
                                                            {post.title}
                                                        </h2>

                                                        {post.excerpt && (
                                                            <p className="text-site-stone-50/50 mb-4 line-clamp-3">
                                                                {post.excerpt}
                                                            </p>
                                                        )}

                                                        <div className="flex items-center gap-4 text-sm text-site-stone-50/40">
                                                            <span className="flex items-center gap-1">
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                                </svg>
                                                                {post.date ? format(parseISO(post.date), 'yyyy年MM月dd日', { locale: zhCN }) : '未知日期'}
                                                            </span>

                                                            {post.author && (
                                                                <span className="flex items-center gap-1">
                                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                                    </svg>
                                                                    {post.author}
                                                                </span>
                                                            )}
                                                        </div>

                                                        {post.tags && post.tags.length > 0 && (
                                                            <div className="flex flex-wrap gap-2 mt-4">
                                                                {post.tags.slice(0, 4).map(tag => (
                                                                    <span key={tag} className="px-2.5 py-1 bg-site-stone-50/5 text-site-stone-50/40 border border-site-stone-50/10 rounded-full text-xs">
                                                                        #{tag}
                                                                    </span>
                                                                ))}
                                                                {post.tags.length > 4 && (
                                                                    <span className="px-2.5 py-1 bg-site-stone-50/5 text-site-stone-50/30 border border-site-stone-50/10 rounded-full text-xs">
                                                                        +{post.tags.length - 4}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="flex flex-col items-end gap-2">
                                                        {post.pinned && (
                                                            <span className="inline-flex items-center px-2 py-1 bg-site-violet-600/10 text-site-violet-300 text-xs font-medium rounded-full border border-site-violet-600/20">
                                                                置顶
                                                            </span>
                                                        )}
                                                        <svg className="w-6 h-6 text-site-stone-50/20 group-hover:text-site-violet-300/60 group-hover:translate-x-1 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                        </svg>
                                                    </div>
                                                </div>
                                            </GlassCard>
                                        ) : (
                                            <div
                                                className={`${theme.cardRadius} p-6 md:p-8 backdrop-blur-sm border transition-all duration-300 hover:shadow-lg`}
                                                style={isTechChannel || isLifeChannel ? { backgroundColor: 'var(--channel-card)', borderColor: 'var(--channel-border)' } : {}}
                                            >
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="flex-1 min-w-0">
                                                        <h2 className="text-xl md:text-2xl font-bold text-site-neutral-900 dark:text-site-stone-50 transition-colors mb-3 line-clamp-2 group-hover:text-primary" style={isTechChannel || isLifeChannel ? { color: 'var(--channel-ink)' } : {}}>
                                                            {post.title}
                                                        </h2>

                                                        {post.excerpt && (
                                                            <p className="text-site-neutral-600 dark:text-site-slate-400 mb-4 line-clamp-3" style={isTechChannel || isLifeChannel ? { color: 'var(--channel-muted)' } : {}}>
                                                                {post.excerpt}
                                                            </p>
                                                        )}

                                                        <div className="flex items-center gap-4 text-sm text-site-neutral-500 dark:text-site-slate-400" style={isTechChannel || isLifeChannel ? { color: 'var(--channel-muted)' } : {}}>
                                                            <span className="flex items-center gap-1">
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                                </svg>
                                                                {post.date ? format(parseISO(post.date), 'yyyy年MM月dd日', { locale: zhCN }) : '未知日期'}
                                                            </span>

                                                            {post.author && (
                                                                <span className="flex items-center gap-1">
                                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                                    </svg>
                                                                    {post.author}
                                                                </span>
                                                            )}
                                                        </div>

                                                        {post.tags && post.tags.length > 0 && (
                                                            <div className="flex flex-wrap gap-2 mt-4">
                                                                {post.tags.slice(0, 4).map(tag => (
                                                                    <span key={tag} className="px-2 py-1 bg-site-stone-100 dark:bg-site-slate-700 text-site-neutral-600 dark:text-site-slate-300 rounded text-xs" style={isTechChannel || isLifeChannel ? { backgroundColor: 'var(--channel-bg)', color: 'var(--channel-ink)', border: '1px solid var(--channel-border)' } : {}}>
                                                                        #{tag}
                                                                    </span>
                                                                ))}
                                                                {post.tags.length > 4 && (
                                                                    <span className="px-2 py-1 bg-site-stone-100 dark:bg-site-slate-700 text-site-neutral-500 dark:text-site-slate-400 rounded text-xs" style={isTechChannel || isLifeChannel ? { backgroundColor: 'var(--channel-bg)', color: 'var(--channel-muted)', border: '1px solid var(--channel-border)' } : {}}>
                                                                        +{post.tags.length - 4}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="flex flex-col items-end gap-2">
                                                        {post.pinned && (
                                                            <span className="inline-flex items-center px-2 py-1 bg-site-red-100 dark:bg-site-red-900/30 text-site-red-700 dark:text-site-red-400 text-xs font-medium rounded">
                                                                📌 置顶
                                                            </span>
                                                        )}
                                                        <svg className="w-6 h-6 text-site-neutral-400 group-hover:text-primary group-hover:translate-x-1 transition-all duration-300" style={isTechChannel || isLifeChannel ? { color: 'var(--channel-muted)' } : {}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                        </svg>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </Link>
                                </motion.article>
                            ))}
                        </div>
                    </div>
                ) : (
                    /* 空状态 */
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-12"
                    >
                        <div className="text-6xl mb-4">📝</div>
                        <h3 className="text-xl font-semibold text-site-neutral-900 dark:text-site-stone-50 mb-2">
                            暂无文章
                        </h3>
                        <p className="text-site-neutral-600 dark:text-site-slate-400 mb-6">
                            该专栏下暂时还没有文章，敬请期待！
                        </p>
                        <Link
                            href={`/blog/${channelKey}`}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            返回{channelConfig.name}频道
                        </Link>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
