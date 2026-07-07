// src/components/features/BlogListClient.jsx
"use client"; // 标记为客户端组件

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { format, parseISO } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { CHANNELS_CONFIG } from '@/lib/channels';
// import { zhCN } from 'date-fns/locale'; // 如果日期格式化需要中文

export default function BlogListClient({ initialPosts, allTags }) {
    const [selectedChannel, setSelectedChannel] = useState(null); // 选中的频道
    const [selectedColumn, setSelectedColumn] = useState(null); // 选中的专栏
    const [selectedTag, setSelectedTag] = useState(null); // 选中的标签
    const [filteredPosts, setFilteredPosts] = useState(initialPosts);

    // 当筛选条件或 initialPosts 变化时，重新计算筛选后的文章列表
    useEffect(() => {
        let filtered = initialPosts;

        // 按频道筛选
        if (selectedChannel) {
            filtered = filtered.filter(post => post.channel === selectedChannel);
        }

        // 按专栏筛选
        if (selectedColumn) {
            filtered = filtered.filter(post =>
                post.channel === selectedChannel && post.column === selectedColumn
            );
        }

        // 按标签筛选
        if (selectedTag) {
            filtered = filtered.filter(post =>
                post.tags && post.tags.some(tag => tag.trim().toLowerCase() === selectedTag.toLowerCase())
            );
        }

        setFilteredPosts(filtered);
    }, [selectedChannel, selectedColumn, selectedTag, initialPosts]);

    const handleChannelClick = (channelKey) => {
        if (selectedChannel === channelKey) {
            setSelectedChannel(null);
            setSelectedColumn(null); // 清除专栏选择
        } else {
            setSelectedChannel(channelKey);
            setSelectedColumn(null); // 切换频道时清除专栏选择
        }
        setSelectedTag(null); // 清除标签选择
    };

    const handleColumnClick = (columnKey) => {
        if (selectedColumn === columnKey) {
            setSelectedColumn(null);
        } else {
            setSelectedColumn(columnKey);
        }
        setSelectedTag(null); // 清除标签选择
    };

    const handleTagClick = (tag) => {
        if (selectedTag === tag) {
            setSelectedTag(null);
        } else {
            setSelectedTag(tag);
        }
    };

    // 用于显示的文章列表，避免在每次渲染时都重新计算
    const postsToDisplay = useMemo(() => filteredPosts, [filteredPosts]);

    // 获取当前频道的专栏列表
    const currentChannelColumns = useMemo(() => {
        if (!selectedChannel) return [];
        return (Object.entries(CHANNELS_CONFIG[selectedChannel].columns) as [string, any][]).map(([key, column]) => ({
            key,
            ...column
        }));
    }, [selectedChannel]);

    return (
        <div>
            {/* 频道选择器 */}
            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="mt-20 mb-8 relative"
            >
                <h2 className="text-2xl font-bold text-center mb-6">频道</h2>
                {/* 背景装饰 */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent blur-3xl" />
                
                <div className="relative flex flex-wrap justify-center gap-4 md:gap-6 px-4">
                    <motion.button
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleChannelClick(null)}
                        className={`group relative px-8 py-4 rounded-2xl text-base font-semibold transition-all duration-300 backdrop-blur-sm
                            ${!selectedChannel
                                ? 'bg-gradient-to-r from-primary to-primary/80 text-white shadow-lg shadow-primary/25'
                                : 'bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 border border-gray-200/50 dark:border-gray-700/50 hover:bg-white dark:hover:bg-gray-800 hover:shadow-md'
                            }`}
                    >
                        {!selectedChannel && (
                            <motion.div
                                layoutId="activeChannel"
                                className="absolute inset-0 bg-gradient-to-r from-primary to-primary/80 rounded-2xl"
                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                            />
                        )}
                        <span className="relative z-10 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-current opacity-60" />
                            全部频道
                        </span>
                    </motion.button>
                    
                    {Object.entries(CHANNELS_CONFIG).map(([key, channel], index) => (
                        <motion.button
                            key={key}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1, duration: 0.4 }}
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleChannelClick(key)}
                            className={`group relative px-8 py-4 rounded-2xl text-base font-semibold transition-all duration-300 backdrop-blur-sm
                                ${selectedChannel === key
                                    ? 'bg-gradient-to-r from-primary to-primary/80 text-white shadow-lg shadow-primary/25'
                                    : 'bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 border border-gray-200/50 dark:border-gray-700/50 hover:bg-white dark:hover:bg-gray-800 hover:shadow-md'
                                }`}
                        >
                            {selectedChannel === key && (
                                <motion.div
                                    layoutId="activeChannel"
                                    className="absolute inset-0 bg-gradient-to-r from-primary to-primary/80 rounded-2xl"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                            <span className="relative z-10 flex items-center gap-2">
                                <span className="text-lg mr-1">{channel.icon}</span>
                                {channel.name}
                            </span>
                        </motion.button>
                    ))}
                </div>
            </motion.div>

            {/* 专栏选择器 - 仅在选择了频道时显示 */}
            {selectedChannel && currentChannelColumns.length > 0 && (
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="mb-8 relative"
                >
                    <h2 className="text-xl font-bold text-center mb-6">专栏</h2>
                    {/* 背景装饰 */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent blur-3xl" />
                    
                    <div className="relative flex flex-wrap justify-center gap-3 md:gap-4 px-4">
                        <motion.button
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setSelectedColumn(null)}
                            className={`group relative px-6 py-3 rounded-2xl text-sm font-semibold transition-all duration-300 backdrop-blur-sm
                                ${!selectedColumn
                                    ? 'bg-gradient-to-r from-primary to-primary/80 text-white shadow-lg shadow-primary/25'
                                    : 'bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 border border-gray-200/50 dark:border-gray-700/50 hover:bg-white dark:hover:bg-gray-800 hover:shadow-md'
                                }`}
                        >
                            {!selectedColumn && (
                                <motion.div
                                    layoutId="activeColumn"
                                    className="absolute inset-0 bg-gradient-to-r from-primary to-primary/80 rounded-2xl"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                            <span className="relative z-10 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-current opacity-60" />
                                全部专栏
                            </span>
                        </motion.button>
                        
                        {currentChannelColumns.map((column, index) => (
                            <motion.button
                                key={column.key}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.1, duration: 0.4 }}
                                whileHover={{ scale: 1.05, y: -2 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleColumnClick(column.key)}
                                className={`group relative px-6 py-3 rounded-2xl text-sm font-semibold transition-all duration-300 backdrop-blur-sm
                                    ${selectedColumn === column.key
                                        ? 'bg-gradient-to-r from-primary to-primary/80 text-white shadow-lg shadow-primary/25'
                                        : 'bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 border border-gray-200/50 dark:border-gray-700/50 hover:bg-white dark:hover:bg-gray-800 hover:shadow-md'
                                    }`}
                            >
                                {selectedColumn === column.key && (
                                    <motion.div
                                        layoutId="activeColumn"
                                        className="absolute inset-0 bg-gradient-to-r from-primary to-primary/80 rounded-2xl"
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                                <span className="relative z-10">
                                    {column.name}
                                </span>
                            </motion.button>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* 标签筛选器 UI */}
            {allTags && allTags.length > 0 && (
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="mb-16 relative"
                >
                    <h2 className="text-xl font-bold text-center mb-6">标签</h2>
                    {/* 背景装饰 */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent blur-3xl" />
                    
                    <div className="relative flex flex-wrap justify-center gap-3 md:gap-4 px-4">
                        <motion.button
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleTagClick(null)}
                            className={`group relative px-6 py-3 rounded-2xl text-sm font-semibold transition-all duration-300 backdrop-blur-sm
                                ${!selectedTag
                                    ? 'bg-gradient-to-r from-primary to-primary/80 text-white shadow-lg shadow-primary/25'
                                    : 'bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 border border-gray-200/50 dark:border-gray-700/50 hover:bg-white dark:hover:bg-gray-800 hover:shadow-md'
                                }`}
                        >
                            {!selectedTag && (
                                <motion.div
                                    layoutId="activeTag"
                                    className="absolute inset-0 bg-gradient-to-r from-primary to-primary/80 rounded-2xl"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                            <span className="relative z-10 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-current opacity-60" />
                                全部标签
                            </span>
                        </motion.button>
                        
                        {allTags.map((tag, index) => (
                            <motion.button
                                key={tag}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.1, duration: 0.4 }}
                                whileHover={{ scale: 1.05, y: -2 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleTagClick(tag)}
                                className={`group relative px-6 py-3 rounded-2xl text-sm font-semibold transition-all duration-300 backdrop-blur-sm
                                    ${selectedTag === tag
                                        ? 'bg-gradient-to-r from-primary to-primary/80 text-white shadow-lg shadow-primary/25'
                                        : 'bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 border border-gray-200/50 dark:border-gray-700/50 hover:bg-white dark:hover:bg-gray-800 hover:shadow-md'
                                    }`}
                            >
                                {selectedTag === tag && (
                                    <motion.div
                                        layoutId="activeTag"
                                        className="absolute inset-0 bg-gradient-to-r from-primary to-primary/80 rounded-2xl"
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                                <span className="relative z-10 flex items-center gap-2">
                                    <span className="text-xs opacity-60">#</span>
                                    {tag}
                                </span>
                            </motion.button>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* 博文列表展示 - 完全重新设计 */}
            <AnimatePresence mode="wait">
                {postsToDisplay.length > 0 ? (
                    <motion.div 
                        key="blog-list"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                        {postsToDisplay.map(({ slug, title, date, excerpt, tags, coverImage, author, pinned }, index) => (
                            <motion.article 
                                key={slug}
                                initial={{ opacity: 0, y: 50 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ 
                                    delay: index * 0.1, 
                                    duration: 0.6,
                                    ease: "easeOut"
                                }}
                                className={`group relative overflow-hidden rounded-3xl transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10
                                    ${pinned 
                                        ? 'bg-gradient-to-br from-amber-50/80 via-white to-orange-50/60 dark:from-amber-900/20 dark:via-gray-900 dark:to-orange-900/10 border-2 border-amber-200/50 dark:border-amber-800/30' 
                                        : 'bg-gradient-to-br from-white via-gray-50/50 to-blue-50/30 dark:from-gray-900 dark:via-gray-800/50 dark:to-blue-900/10 border border-gray-200/50 dark:border-gray-700/50'
                                    }
                                `}
                            >
                                {/* 置顶文章的特殊装饰 */}
                                {pinned && (
                                    <>
                                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500" />
                                        <motion.div 
                                            className="absolute top-6 right-6 z-20"
                                            initial={{ scale: 0, rotate: -180 }}
                                            animate={{ scale: 1, rotate: 0 }}
                                            transition={{ delay: 0.3, type: "spring", bounce: 0.6 }}
                                        >
                                            <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold rounded-full shadow-lg">
                                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                                                </svg>
                                                <span>精选</span>
                                            </div>
                                        </motion.div>
                                    </>
                                )}

                                <div className="flex flex-col">
                                    {/* 封面图片区域 */}
                                    {coverImage && (
                                        <div className="relative overflow-hidden">
                                            <Link href={`/blog/${slug}`} className="block relative group/image">
                                                <div className="aspect-video relative overflow-hidden">
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img 
                                                        src={coverImage} 
                                                        alt={title || 'Blog post cover'} 
                                                        className="w-full h-full object-cover transition-all duration-700 group-hover/image:scale-110 group-hover/image:brightness-110" 
                                                    />
                                                    {/* 图片遮罩 */}
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover/image:opacity-100 transition-opacity duration-500" />
                                                    {/* 阅读按钮 */}
                                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/image:opacity-100 transition-all duration-500">
                                                        <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm px-6 py-3 rounded-full text-sm font-semibold text-gray-900 dark:text-white shadow-lg transform translate-y-4 group-hover/image:translate-y-0">
                                                            阅读文章
                                                        </div>
                                                    </div>
                                                </div>
                                            </Link>
                                        </div>
                                    )}

                                    {/* 内容区域 */}
                                    <div className="p-8 lg:p-10">
                                        {/* 元信息 */}
                                        <div className="flex items-center gap-4 mb-6 text-sm text-gray-600 dark:text-gray-400">
                                            <div className="flex items-center gap-2">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                                <span>{date ? format(parseISO(date), 'yyyy年MM月dd日') : '未知日期'}</span>
                                            </div>
                                        </div>

                                        {/* 标题 */}
                                        <h2 className="text-2xl lg:text-3xl font-bold mb-4 leading-tight">
                                            <Link 
                                                href={`/blog/${slug}`} 
                                                className="text-gray-900 dark:text-white hover:text-primary dark:hover:text-primary transition-colors duration-300 group-hover:text-primary"
                                            >
                                                {title || '未命名文章'}
                                            </Link>
                                        </h2>

                                        {/* 摘要 */}
                                        <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed text-base lg:text-lg">
                                            {excerpt ? `${excerpt.substring(0, 180)}${excerpt.length > 180 ? '...' : ''}` : '暂无摘要'}
                                        </p>

                                        {/* 标签 */}
                                        {tags && tags.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mb-8">
                                                {tags.slice(0, 4).map(tag => (
                                                    <span 
                                                        key={tag} 
                                                        className="inline-flex items-center px-3 py-1.5 text-xs font-medium bg-primary/10 text-primary rounded-full border border-primary/20 hover:bg-primary/20 transition-colors duration-200"
                                                    >
                                                        <span className="mr-1 opacity-60">#</span>
                                                        {tag}
                                                    </span>
                                                ))}
                                                {tags.length > 4 && (
                                                    <span className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-gray-500 dark:text-gray-400">
                                                        +{tags.length - 4} 更多
                                                    </span>
                                                )}
                                            </div>
                                        )}


                                    </div>
                                </div>

                                {/* 悬浮效果装饰 */}
                                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                            </motion.article>
                        ))}
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="no-posts"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.4 }}
                        className="text-center py-20"
                    >
                        <div className="max-w-md mx-auto">
                            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-full flex items-center justify-center">
                                <svg className="w-10 h-10 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                未找到相关文章
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                {(() => {
                                    if (selectedTag) {
                                        return `没有找到标签为 "${selectedTag}" 的文章，试试其他标签吧`;
                                    }
                                    if (selectedColumn) {
                                        const channelName = CHANNELS_CONFIG[selectedChannel]?.name;
                                        const columnName = CHANNELS_CONFIG[selectedChannel]?.columns[selectedColumn]?.name;
                                        return `"${channelName} - ${columnName}" 专栏暂无文章，敬请期待`;
                                    }
                                    if (selectedChannel) {
                                        const channelName = CHANNELS_CONFIG[selectedChannel]?.name;
                                        return `"${channelName}" 频道暂无文章，敬请期待`;
                                    }
                                    return '还没有发布任何文章，敬请期待';
                                })()}
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}