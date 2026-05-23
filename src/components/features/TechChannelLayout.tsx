// src/components/features/TechChannelLayout.jsx
"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { getColumnByTags } from '@/lib/channels';
import ProgrammerDetails from '@/components/features/ProgrammerDetails';

export default function TechChannelLayout({ channelKey, channelConfig, posts }) {
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

    // 获取精选文章（最多6篇）
    const featuredPosts = posts.slice(0, 6);

    return (
        <div className="min-h-screen" style={{ backgroundColor: '#f8f1ee' }} data-tech-page>
            {/* Hero Section */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="relative min-h-screen flex items-center justify-center py-16 md:py-20 mt-8 md:mt-12 lg:mt-16"
                style={{ backgroundColor: '#f8f1ee' }}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8 md:gap-12">
                        {/* 左侧标语 */}
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            className="flex-1 flex flex-col justify-center text-center lg:text-left"
                        >
                            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 mb-4 md:mb-6 leading-tight">
                                探索技术前沿
                            </h1>
                            <p className="text-lg sm:text-xl md:text-2xl text-gray-600 mb-6 md:mb-8 leading-relaxed">
                                谦逊，自驱，持续
                            </p>
                            <p className="text-base md:text-lg text-gray-500 max-w-2xl mx-auto lg:mx-0">
                                在这里，我们深入探讨前端开发、后端架构、数据库设计等技术领域，
                                分享实战经验与最佳实践，与你一起在技术的道路上不断前行。
                            </p>
                        </motion.div>

                        {/* 右侧SVG图像 */}
                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 }}
                            className="flex-1 flex justify-center items-center mt-8 lg:mt-0 lg:pl-8 xl:pl-12"
                        >
                            <div className="w-full max-w-sm md:max-w-md lg:max-w-lg">
                                <Image
                                    src="/tech_cover.svg"
                                    alt="技术频道插图"
                                    width={500}
                                    height={400}
                                    className="w-full h-auto"
                                    priority
                                />
                            </div>
                        </motion.div>
                    </div>
                </div>
            </motion.section>

            {/* 技术世界栏目 */}
            <ProgrammerDetails />

            {/* 精选专栏 */}
            <section className="py-12 md:py-16 lg:py-24">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-8 md:mb-12"
                    >
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 md:mb-4">
                            精选专栏
                        </h2>
                        <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
                            深入探索各个技术领域，分享实战经验与最佳实践
                        </p>
                    </motion.div>

                    <div className="space-y-6 md:space-y-8">
                        {Object.entries(postsByColumn).map(([columnKey, { config, posts: columnPosts }]: [string, any], index) => (
                            <motion.div
                                key={columnKey}
                                initial={{ opacity: 0, x: -50 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.2, duration: 0.6 }}
                                className="rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
                                style={{ backgroundColor: '#eaddd7' }}
                            >
                                <div className="flex flex-col md:flex-row h-auto md:h-64">
                                    {/* 左侧图片 */}
                                    <div className="w-full md:w-1/2 h-48 sm:h-56 md:h-full relative overflow-hidden">
                                        {config.coverImage ? (
                                            <Image
                                                src={config.coverImage}
                                                alt={config.name || '专栏封面'}
                                                fill
                                                style={{ objectFit: 'cover' }}
                                                className="transition-transform duration-300 hover:scale-105"
                                                sizes="(max-width: 768px) 100vw, 50vw"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                                <span className="text-gray-400 text-sm">专栏首图占位 (16:9)</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* 右侧内容 */}
                                    <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col justify-center">
                                        <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 md:mb-4">
                                            {config.name}
                                        </h3>
                                        <p className="text-gray-600 mb-4 md:mb-6 line-clamp-3 text-sm md:text-base">
                                            {config.description}
                                        </p>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs md:text-sm text-gray-500">
                                                {columnPosts.length} 篇文章
                                            </span>
                                            <Link
                                                href={`/blog/${channelKey}/${columnKey}`}
                                                className="font-medium text-sm md:text-base"
                                                style={{ color: '#a18072' }}
                                            >
                                                Read More →
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 精选文章 */}
            <section className="py-12 md:py-16 lg:py-24" style={{ backgroundColor: '#f8f1ee' }}>
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-8 md:mb-12"
                    >
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 md:mb-4">
                            精选文章
                        </h2>
                        <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
                            最新的技术洞察与实践分享
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
                        {featuredPosts.map((post, index) => {
                            const column = getColumnByTags(post);
                            return (
                                <motion.article
                                    key={post.slug}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1, duration: 0.6 }}
                                    className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden"
                                >
                                    <Link href={`/blog/${post.slug}`}>
                                        {/* 文章图片 */}
                                        <div className="aspect-video relative overflow-hidden">
                                            {post.coverImage ? (
                                                <img
                                                    src={post.coverImage}
                                                    alt={post.title || '文章封面'}
                                                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                                    <span className="text-gray-400 text-xs sm:text-sm">文章首图占位 (16:9)</span>
                                                </div>
                                            )}

                                            {/* 置顶和分类标签 */}
                                            <div className="absolute top-2 sm:top-4 left-2 sm:left-4 flex gap-1 sm:gap-2">
                                                {post.pinned && (
                                                    <span className="bg-red-500 text-white px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium">
                                                        置顶
                                                    </span>
                                                )}
                                                {column && (
                                                    <span className="bg-blue-500 text-white px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium">
                                                        {postsByColumn[column.columnKey]?.config?.name}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* 文章内容 */}
                                        <div className="p-4 sm:p-6">
                                            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3 line-clamp-2">
                                                {post.title}
                                            </h3>
                                            {post.excerpt && (
                                                <p className="text-gray-600 mb-3 sm:mb-4 line-clamp-3 text-sm sm:text-base">
                                                    {post.excerpt}
                                                </p>
                                            )}

                                            <div className="flex items-center justify-between text-xs sm:text-sm text-gray-500">
                                                <span>{post.author || '阿松'}</span>
                                                <time dateTime={post.date}>
                                                    {format(parseISO(post.date), 'yyyy年MM月dd日', { locale: zhCN })}
                                                </time>
                                            </div>
                                        </div>
                                    </Link>
                                </motion.article>
                            );
                        })}
                    </div>
                </div>
            </section>
        </div>
    );
}