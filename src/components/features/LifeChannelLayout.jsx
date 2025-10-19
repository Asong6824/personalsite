// src/components/features/LifeChannelLayout.jsx
"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { getColumnByTags } from '@/lib/channels';
import { PixelImage } from '@/components/magicui/pixel-image';
import { TypingAnimation } from '@/components/magicui/typing-animation';
import TravelSection from '@/components/features/TravelSection';

export default function LifeChannelLayout({ channelKey, channelConfig, posts }) {
    const [showTitle, setShowTitle] = React.useState(false);
    
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
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="relative h-screen flex items-center justify-center" style={{backgroundColor: '#F5F3F0'}}>
                {/* 背景图片 - 像素化加载效果 */}
                <div className="absolute inset-0">
                    <PixelImage 
                        src="https://blog-assets-asong.tos-cn-beijing.volces.com/life/cover/xifangsi.jpeg"
                        grid="6x4"
                        grayscaleAnimation={true}
                        pixelFadeInDuration={1000}
                        maxAnimationDelay={1200}
                        colorRevealDelay={1500}
                        className="w-full h-full"
                        onAnimationComplete={() => setShowTitle(true)}
                    />
                </div>
                
                {/* 中心文字 */}
                <div className="relative z-10 text-center px-4">
                    {/* 主标题 */}
                    {showTitle && (
                        <TypingAnimation
                            className="text-3xl md:text-5xl lg:text-6xl text-slate-200 font-light mb-6 drop-shadow-lg"
                            style={{letterSpacing: '0.05em', textShadow: '2px 2px 4px rgba(0,0,0,0.8)'}}
                            duration={150}
                            delay={500}
                        >
                            阿松的生活杂记
                        </TypingAnimation>
                    )}
                </div>
            </section>

            {/* 旅行记忆 */}
            <TravelSection />

            {/* 精选专栏 */}
            <section className="py-16 md:py-32" style={{backgroundColor: '#F5F3F0'}}>
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12 md:mb-20">
                        <h2 className="text-2xl md:text-4xl font-light mb-4 md:mb-6" style={{color: '#8B7355', letterSpacing: '0.02em'}}>
                            精选专栏
                        </h2>
                        <p className="text-base md:text-lg font-light max-w-2xl mx-auto px-4" style={{color: '#A0927D', letterSpacing: '0.01em'}}>
                            深度探索生活的各个维度
                        </p>
                        <div className="mt-8 w-12 h-px mx-auto" style={{backgroundColor: '#C8B99C', opacity: 0.6}}></div>
                    </div>

                    <div className="space-y-6">
                        {Object.entries(postsByColumn).map(([columnKey, { config, posts: columnPosts }], index) => (
                            <div
                                key={columnKey}
                                className="overflow-hidden transition-all duration-300"
                                style={{
                                    backgroundColor: '#FEFCFA',
                                    border: '1px solid #E5DDD5',
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
                                        <h3 className="text-2xl font-light mb-4" style={{color: 'rgb(139, 90, 60)', letterSpacing: '0.02em'}}>
                            {config.name}
                        </h3>
                                        <p className="font-light mb-6 line-clamp-3 leading-relaxed" style={{color: '#A0927D', letterSpacing: '0.01em'}}>
                                            {config.description}
                                        </p>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-light flex items-center" style={{color: '#B8A690'}}>
                                                <span className="w-1 h-1 mr-2" style={{backgroundColor: '#C8B99C'}}></span>
                                                {columnPosts.length} 篇文章
                                            </span>
                                            <Link
                                                href={`/blog/${channelKey}/${columnKey}`}
                                                className="inline-flex items-center px-6 py-3 font-light transition-all duration-300 min-h-[44px] min-w-[44px] justify-center"
                                                style={{
                                                    fontFamily: 'serif',
                                                    backgroundColor: '#8B7355',
                                                    color: '#FEFCFA',
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
            <section className="py-16 md:py-32" style={{backgroundColor: '#F9F7F4'}}>
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12 md:mb-20">
                        <h2 className="text-2xl md:text-4xl font-light mb-4 md:mb-6" style={{color: '#8B7355', letterSpacing: '0.02em'}}>
                            精选博文
                        </h2>
                        <p className="text-base md:text-lg font-light max-w-2xl mx-auto px-4" style={{color: '#A0927D', letterSpacing: '0.01em'}}>
                            最新的生活感悟与旅行记录
                        </p>
                        <div className="mt-8 w-12 h-px mx-auto" style={{backgroundColor: '#C8B99C', opacity: 0.6}}></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {featuredPosts.map((post, index) => {
                            const column = getColumnByTags(post);
                            return (
                                <article
                                    key={post.slug}
                                    className="overflow-hidden transition-all duration-300"
                                    style={{
                                        backgroundColor: '#FEFCFA',
                                        border: '1px solid #E5DDD5',
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
                                                            backgroundColor: '#F0EBE5',
                                                            color: '#8B7355',
                                                            border: '1px solid #E5DDD5'
                                                        }}>
                                                            置顶
                                                        </span>
                                                    )}
                                                    {column && (
                                                        <span className="text-xs px-3 py-1 font-light" style={{
                                                            backgroundColor: '#F0EBE5',
                                                            color: '#8B7355',
                                                            border: '1px solid #E5DDD5'
                                                        }}>
                                                            {postsByColumn[column.columnKey]?.config?.name}
                                                        </span>
                                                    )}
                                                </div>
                                                <h3 className="text-lg md:text-xl font-light mb-3 line-clamp-2" style={{color: '#8B7355', letterSpacing: '0.02em'}}>
                                                    {post.title}
                                                </h3>
                                                {post.excerpt && (
                                                    <p className="text-sm md:text-base font-light line-clamp-3 mb-4 leading-relaxed" style={{color: '#A0927D', letterSpacing: '0.01em'}}>
                                                        {post.excerpt}
                                                    </p>
                                                )}
                                            </div>
                                            
                                            <div className="flex items-center justify-between text-xs md:text-sm font-light pt-4" style={{borderTop: '1px solid #F0EBE5', color: '#B8A690'}}>
                                                <span className="flex items-center">
                                                    <span className="w-1 h-1 mr-2" style={{backgroundColor: '#C8B99C'}}></span>
                                                    {post.author || '阿松'}
                                                </span>
                                                <time dateTime={post.date} className="flex items-center">
                                                    <span className="w-1 h-1 mr-2" style={{backgroundColor: '#C8B99C'}}></span>
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
    );
}