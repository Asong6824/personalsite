// src/components/features/LifeChannelLayout.jsx
"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { format, parseISO } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { getColumnByTags } from '@/lib/channels';
import { BookShelf } from '@/components/features/BookShelf3D';
import TravelSection from '@/components/features/TravelSection';
import SunlitBackground from '@/components/features/SunlitBackground';
import styles from '@/app/home.module.css';

export default function LifeChannelLayout({ channelKey, channelConfig, posts }) {
    // 按专栏分组文章
    const postsByColumn = React.useMemo(() => {
        const grouped = {};
        
        posts.forEach(post => {
            const column = getColumnByTags(post);
            if (column && column.channelKey === channelKey) {
                const columnKey = column.columnKey;
                if (!grouped[columnKey]) {
                    grouped[columnKey] = {
                        config: channelConfig.columns[columnKey],
                        posts: []
                    };
                }
                grouped[columnKey].posts.push(post);
            }
        });
        
        return grouped;
    }, [posts, channelKey, channelConfig]);

    // 获取精选博文（最多6篇）
    const featuredPosts = posts.slice(0, 6);

    return (
        <div
            className={`min-h-screen ${styles.scholarlyPalette}`}
            style={{ backgroundColor: '#F0EEE7' }}
            data-life-page
        >
            {/* Content Layers */}
            <div className="relative z-10">
                {/* Hero Section — 复制首页 Hero 结构 */}
                <section
                    id="hero"
                    className={`relative min-h-screen w-full overflow-hidden flex items-center justify-center ${styles.scholarlyTheme}`}
                    style={{ backgroundColor: 'transparent' }}
                >
                    <SunlitBackground />
                    <div className="relative z-10 flex flex-col items-center justify-center text-center">
                        <h1 className="serifFont displayHeadline text-5xl md:text-7xl font-bold tracking-tight text-[var(--theme-ink)] mb-4 drop-shadow-sm">
                            阿松的生活杂记
                        </h1>
                        <p className="font-mono text-sm tracking-widest text-[var(--theme-outline)] uppercase drop-shadow-sm">
                            Life & Travel
                        </p>
                    </div>
                </section>

                {/* 旅行记忆 */}
                <TravelSection />

            {/* 3D Digital Bookshelf Section */}
            <section className="relative w-full h-[100dvh]">
                <BookShelf />
            </section>

            {/* 精选专栏 */}
            <section className="py-16 md:py-32" style={{backgroundColor: 'var(--theme-surface)'}}>
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12 md:mb-20">
                        <h2 className="text-2xl md:text-4xl font-light mb-4 md:mb-6" style={{color: 'var(--theme-ink)', letterSpacing: '0.02em'}}>
                            精选专栏
                        </h2>
                        <p className="text-base md:text-lg font-light max-w-2xl mx-auto px-4" style={{color: 'var(--theme-outline)', letterSpacing: '0.01em'}}>
                            深度探索生活的各个维度
                        </p>
                        <div className="mt-8 w-12 h-px mx-auto" style={{backgroundColor: 'var(--theme-outline-variant)', opacity: 0.6}}></div>
                    </div>

                    <div className="space-y-6">
                        {Object.entries(postsByColumn).map(([columnKey, { config, posts: columnPosts }]: [string, any]) => (
                            <div
                                key={columnKey}
                                className="overflow-hidden transition-all duration-300"
                                style={{
                                    backgroundColor: 'var(--theme-surface-high)',
                                    border: '1px solid var(--theme-outline-variant)',
                                    borderRadius: '2px'
                                }}
                            >
                                <div className="flex flex-col md:flex-row h-auto md:h-64">
                                    {/* 左侧图片 */}
                                    <div className="w-full md:w-1/2 h-64 md:h-full relative overflow-hidden">
                                        {config.cover ? (
                                            <Image
                                                src={config.cover}
                                                alt={config.name || '专栏封面'}
                                                fill
                                                style={{objectFit: 'cover'}}
                                                className="transition-transform duration-300 hover:scale-105"
                                                sizes="(max-width: 768px) 100vw, 50vw"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                                <span className="text-gray-400">专栏首图占位 (16:9)</span>
                                            </div>
                                        )}
                                    </div>
                                    
                                    {/* 右侧内容 */}
                                    <div className="w-full md:w-1/2 p-8 flex flex-col justify-center">
                                        <h3 className="text-2xl font-light mb-4" style={{color: 'var(--theme-ink)', letterSpacing: '0.02em'}}>
                                            {config.name}
                                        </h3>
                                        <p className="font-light mb-6 line-clamp-3 leading-relaxed" style={{color: 'var(--theme-outline)', letterSpacing: '0.01em'}}>
                                            {config.description}
                                        </p>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-light flex items-center" style={{color: 'var(--theme-outline)'}}>
                                                <span className="w-1 h-1 mr-2" style={{backgroundColor: 'var(--theme-outline-variant)'}}></span>
                                                {columnPosts.length} 篇文章
                                            </span>
                                            <Link
                                                href={`/blog/${channelKey}/${columnKey}`}
                                                className="inline-flex items-center px-6 py-3 font-light transition-all duration-300 min-h-[44px] min-w-[44px] justify-center"
                                                style={{
                                                    fontFamily: 'serif',
                                                    backgroundColor: 'var(--theme-primary)',
                                                    color: 'var(--theme-surface)',
                                                    letterSpacing: '0.01em'
                                                }}
                                            >
                                                阅读更多 →
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 精选博文 */}
            <section className="py-16 md:py-32" style={{backgroundColor: 'var(--theme-surface)'}}>
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12 md:mb-20">
                        <h2 className="text-2xl md:text-4xl font-light mb-4 md:mb-6" style={{color: 'var(--theme-ink)', letterSpacing: '0.02em'}}>
                            精选博文
                        </h2>
                        <p className="text-base md:text-lg font-light max-w-2xl mx-auto px-4" style={{color: 'var(--theme-outline)', letterSpacing: '0.01em'}}>
                            最新的生活感悟与旅行记录
                        </p>
                        <div className="mt-8 w-12 h-px mx-auto" style={{backgroundColor: 'var(--theme-outline-variant)', opacity: 0.6}}></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {featuredPosts.map((post) => {
                            const column = getColumnByTags(post);
                            return (
                                <article
                                    key={post.slug}
                                    className="overflow-hidden transition-all duration-300"
                                    style={{
                                        backgroundColor: 'var(--theme-surface-high)',
                                        border: '1px solid var(--theme-outline-variant)',
                                        borderRadius: '2px'
                                    }}
                                >
                                    <Link href={column ? `/blog/${column.channelKey}/${column.columnKey}/${post.slug}` : `/blog/${post.slug}`}>
                                        {/* 文章图片 */}
                                        <div className="aspect-video bg-gray-200 dark:bg-gray-700 flex items-center justify-center relative overflow-hidden">
                                            {post.coverImage ? (
                                                <img
                                                    src={post.coverImage}
                                                    alt={post.title || '文章封面'}
                                                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                                                />
                                            ) : (
                                                <span className="text-gray-400">文章首图占位 (16:9)</span>
                                            )}
                                        </div>
                                        
                                        {/* 文章内容 */}
                                        <div className="p-6 md:p-8 flex flex-col justify-between min-h-[200px]">
                                            <div>
                                                <div className="flex items-center gap-3 mb-4">
                                                    {post.pinned && (
                                                        <span className="text-xs px-3 py-1 font-light" style={{
                                                            backgroundColor: 'var(--theme-surface-low)',
                                                            color: 'var(--theme-primary)',
                                                            border: '1px solid var(--theme-outline-variant)'
                                                        }}>
                                                            置顶
                                                        </span>
                                                    )}
                                                    {column && (
                                                        <span className="text-xs px-3 py-1 font-light" style={{
                                                            backgroundColor: 'var(--theme-surface-low)',
                                                            color: 'var(--theme-primary)',
                                                            border: '1px solid var(--theme-outline-variant)'
                                                        }}>
                                                            {postsByColumn[column.columnKey]?.config?.name}
                                                        </span>
                                                    )}
                                                </div>
                                                <h3 className="text-lg md:text-xl font-light mb-3 line-clamp-2" style={{color: 'var(--theme-ink)', letterSpacing: '0.02em'}}>
                                                    {post.title}
                                                </h3>
                                                {post.excerpt && (
                                                    <p className="text-sm md:text-base font-light line-clamp-3 mb-4 leading-relaxed" style={{color: 'var(--theme-outline)', letterSpacing: '0.01em'}}>
                                                        {post.excerpt}
                                                    </p>
                                                )}
                                            </div>
                                            
                                            <div className="flex items-center justify-between text-xs md:text-sm font-light pt-4" style={{borderTop: '1px solid var(--theme-outline-variant)', color: 'var(--theme-outline)'}}>
                                                <span className="flex items-center">
                                                    <span className="w-1 h-1 mr-2" style={{backgroundColor: 'var(--theme-outline-variant)'}}></span>
                                                    {post.author || '阿松'}
                                                </span>
                                                <time dateTime={post.date} className="flex items-center">
                                                    <span className="w-1 h-1 mr-2" style={{backgroundColor: 'var(--theme-outline-variant)'}}></span>
                                                    {format(parseISO(post.date), 'yyyy年MM月dd日', { locale: zhCN })}
                                                </time>
                                            </div>
                                        </div>
                                    </Link>
                                </article>
                            );
                        })}
                    </div>
                </div>
            </section>
            </div>
        </div>
    );
}
