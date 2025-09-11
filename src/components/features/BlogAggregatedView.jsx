// src/components/features/BlogAggregatedView.jsx
"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { getColumnByTags } from '@/lib/channels';

export default function BlogAggregatedView({ 
    allPosts, 
    channels, 
    channelsConfig, 
    techPosts, 
    lifePosts, 
    featuredPosts, 
    allTags 
}) {
    return (
        <div className="container mx-auto px-4 pt-16 pb-8 md:py-12">
            {/* 页面标题 */}
            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center mb-16"
            >
                <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                    博客
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                    技术分享、学习笔记与生活感悟
                </p>
                
                {/* 面包屑导航 */}
                <nav className="mt-6 text-sm text-gray-500 dark:text-gray-400">
                    <Link href="/" className="hover:text-primary transition-colors">首页</Link>
                    <span className="mx-2">{'>'}</span>
                    <span className="text-primary">博客</span>
                </nav>
            </motion.div>

            {/* 频道导航 */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="mb-16"
            >
                <h2 className="text-2xl font-bold text-center mb-8">频道导航</h2>
                <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                    {Object.entries(channelsConfig).map(([channelKey, channel], index) => {
                        const channelPosts = channelKey === 'tech' ? techPosts : lifePosts;
                        return (
                            <motion.div
                                key={channelKey}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
                                className="group"
                            >
                                <Link href={`/blog/${channelKey}`}>
                                    <div className="bg-white/50 dark:bg-gray-800/50 rounded-2xl p-6 md:p-8 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 hover:bg-white/80 dark:hover:bg-gray-800/80 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 group-hover:scale-105">
                                        <div className="flex items-center gap-4 mb-4">
                                            <span className="text-4xl">{channel.icon}</span>
                                            <div>
                                                <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-primary transition-colors">
                                                    {channel.name}
                                                </h3>
                                                <p className="text-gray-600 dark:text-gray-400 text-sm">
                                                    {channel.description}
                                                </p>
                                            </div>
                                        </div>
                                        
                                        {/* 专栏预览 */}
                                        <div className="space-y-2 mb-4">
                                            {Object.entries(channel.columns).slice(0, 2).map(([columnKey, column]) => (
                                                <div key={columnKey} className="flex items-center justify-between text-sm">
                                                    <span className="text-gray-600 dark:text-gray-400">{column.name}</span>
                                                    <span className="text-gray-500 dark:text-gray-500">
                                                        {channelPosts.filter(post => {
                                                            const postColumn = getColumnByTags(post);
                                                            return postColumn?.columnKey === columnKey;
                                                        }).length} 篇
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                        
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                                共 {channelPosts.length} 篇文章
                                            </span>
                                            <svg className="w-5 h-5 text-gray-400 group-hover:text-primary group-hover:translate-x-1 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        );
                    })}
                </div>
            </motion.section>

            {/* 精选专栏 */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="mb-16"
            >
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold">精选专栏</h2>
                    <span className="text-sm text-gray-500 dark:text-gray-400">热门推荐</span>
                </div>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Object.entries(channelsConfig).map(([channelKey, channel]) => {
                        return Object.entries(channel.columns).map(([columnKey, column], index) => {
                            const channelPosts = channelKey === 'tech' ? techPosts : lifePosts;
                            const columnPosts = channelPosts.filter(post => {
                                const postColumn = getColumnByTags(post);
                                return postColumn?.columnKey === columnKey;
                            });
                            
                            if (columnPosts.length === 0) return null;
                            
                            const latestPost = columnPosts[0];
                            
                            return (
                                <motion.div
                                    key={`${channelKey}-${columnKey}`}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
                                    className="group"
                                >
                                    <Link href={`/blog/${channelKey}/${columnKey}`}>
                                        <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-6 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 hover:bg-white/80 dark:hover:bg-gray-800/80 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 h-full">
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-2xl">{channel.icon}</span>
                                                    <div>
                                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-primary transition-colors">
                                                            {column.name}
                                                        </h3>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                                            {channel.name}
                                                        </p>
                                                    </div>
                                                </div>
                                                <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded">
                                                    {columnPosts.length} 篇
                                                </span>
                                            </div>
                                            
                                            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                                                {column.description}
                                            </p>
                                            
                                            {latestPost && (
                                                <div className="border-t border-gray-200/50 dark:border-gray-700/50 pt-3">
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">最新文章</p>
                                                    <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">
                                                        {latestPost.title}
                                                    </p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                        {latestPost.date ? format(parseISO(latestPost.date), 'MM月dd日', { locale: zhCN }) : '未知日期'}
                                                    </p>
                                                </div>
                                            )}
                                            
                                            <div className="flex items-center justify-end mt-4">
                                                <svg className="w-5 h-5 text-gray-400 group-hover:text-primary group-hover:translate-x-1 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </div>
                                        </div>
                                    </Link>
                                </motion.div>
                            );
                        });
                    }).flat().filter(Boolean)}
                </div>
            </motion.section>

            {/* 最新文章 */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
                className="mb-16"
            >
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold">最新文章</h2>
                    <Link 
                        href="/blog/all" 
                        className="text-primary hover:text-primary/80 transition-colors text-sm font-medium"
                    >
                        查看全部 →
                    </Link>
                </div>
                
                <div className="grid gap-4">
                    {allPosts.slice(0, 5).map((post, index) => {
                        const column = getColumnByTags(post);
                        const channelConfig = column ? channelsConfig[column.channelKey] : null;
                        const columnConfig = channelConfig?.columns?.[column.columnKey];
                        
                        return (
                            <motion.article
                                key={post.slug}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.7 + index * 0.05, duration: 0.4 }}
                                className="group"
                            >
                                <Link href={column ? `/blog/${column.channelKey}/${column.columnKey}/${post.slug}` : `/blog/${post.slug}`}>
                                    <div className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                {channelConfig && (
                                                    <span className="text-sm">{channelConfig.icon}</span>
                                                )}
                                                {columnConfig && (
                                                    <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">
                                                        {columnConfig.name}
                                                    </span>
                                                )}
                                                {post.pinned && (
                                                    <span className="text-xs px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded">
                                                        置顶
                                                    </span>
                                                )}
                                            </div>
                                            <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-primary transition-colors line-clamp-1">
                                                {post.title}
                                            </h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                {post.date ? format(parseISO(post.date), 'yyyy年MM月dd日', { locale: zhCN }) : '未知日期'}
                                            </p>
                                        </div>
                                        <svg className="w-5 h-5 text-gray-400 group-hover:text-primary group-hover:translate-x-1 transition-all duration-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                </Link>
                            </motion.article>
                        );
                    })}
                </div>
            </motion.section>

            {/* 统计信息 */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.6 }}
                className="text-center"
            >
                <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl p-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div>
                            <div className="text-2xl font-bold text-primary mb-1">{allPosts.length}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">总文章数</div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-primary mb-1">{Object.keys(channelsConfig).length}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">频道数</div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-primary mb-1">
                                {Object.values(channelsConfig).reduce((total, channel) => total + Object.keys(channel.columns).length, 0)}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">专栏数</div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-primary mb-1">{allTags.length}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">标签数</div>
                        </div>
                    </div>
                </div>
            </motion.section>
        </div>
    );
}