// src/components/features/BlogListClient.jsx
"use client"; // 标记为客户端组件

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { format, parseISO } from 'date-fns';
// import { zhCN } from 'date-fns/locale'; // 如果日期格式化需要中文

export default function BlogListClient({ initialPosts, allTags }) {
    const [selectedTag, setSelectedTag] = useState(null); // null 表示显示所有文章
    const [filteredPosts, setFilteredPosts] = useState(initialPosts);

    // 当 selectedTag 或 initialPosts 变化时，重新计算筛选后的文章列表
    useEffect(() => {
        if (!selectedTag) {
            setFilteredPosts(initialPosts); // 如果没有选中标签，显示所有文章
        } else {
            setFilteredPosts(
                initialPosts.filter(post =>
                    post.tags && post.tags.some(tag => tag.trim().toLowerCase() === selectedTag.toLowerCase())
                )
            );
        }
    }, [selectedTag, initialPosts]);

    const handleTagClick = (tag) => {
        if (selectedTag === tag) {
            setSelectedTag(null); // 再次点击同一个标签则取消筛选
        } else {
            setSelectedTag(tag);
        }
    };

    // 用于显示的文章列表，避免在每次渲染时都重新计算
    const postsToDisplay = useMemo(() => filteredPosts, [filteredPosts]);

    return (
        <div>
            {/* 标签筛选器 UI */}
            {allTags && allTags.length > 0 && (
                <div className="mt-16 mb-10 flex flex-wrap justify-center gap-2 md:gap-3">
                    <button
                        onClick={() => handleTagClick(null)}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors duration-200
              ${!selectedTag
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-card hover:bg-muted text-card-foreground border border-border'
                        }`}
                    >
                        全部文章
                    </button>
                    {allTags.map(tag => (
                        <button
                            key={tag}
                            onClick={() => handleTagClick(tag)}
                            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors duration-200
                ${selectedTag === tag
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-card hover:bg-muted text-card-foreground border border-border'
                            }`}
                        >
                            {tag}
                        </button>
                    ))}
                </div>
            )}

            {/* 博文列表展示 */}
            {postsToDisplay.length > 0 ? (
                <div className="grid gap-8 md:gap-10">
                    {postsToDisplay.map(({ slug, title, date, excerpt, tags, coverImage, author, pinned }) => (
                        <article key={slug} className={`p-6 rounded-lg shadow-lg bg-card hover:shadow-xl transition-shadow duration-300 flex flex-col md:flex-row gap-6 items-start ${pinned ? 'ring-2 ring-yellow-400/50 bg-gradient-to-r from-yellow-50/50 to-transparent dark:from-yellow-900/20' : ''}`}>
                            {coverImage && (
                                <Link href={`/blog/${slug}`} className="block md:w-1/3 w-full aspect-video rounded overflow-hidden flex-shrink-0">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={coverImage} alt={title || 'Blog post cover'} className="w-full h-full object-cover transition-transform duration-300 hover:scale-105" />
                                </Link>
                            )}
                            <div className="flex-grow">
                                <h2 className="text-2xl font-semibold mb-2 text-primary hover:text-primary/80 flex items-center gap-2">
                                    <Link href={`/blog/${slug}`} className="flex items-center gap-2">
                                        {pinned && (
                                            <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 rounded-full whitespace-nowrap">
                                                📌 置顶
                                            </span>
                                        )}
                                        {title || '未命名文章'}
                                    </Link>
                                </h2>
                                <p className="text-muted-foreground text-sm mb-3">
                                    {author && <span>{author} · </span>}
                                    {date ? format(parseISO(date), 'yyyy年MM月dd日') : '未知日期'}
                                </p>
                                <p className="text-card-foreground mb-4 leading-relaxed text-sm">
                                    {excerpt ? `${excerpt.substring(0, 150)}${excerpt.length > 150 ? '...' : ''}` : '暂无摘要'}
                                </p>
                                {tags && tags.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {tags.map(tag => (
                                            <span key={tag} className="text-xs bg-accent/20 text-accent-foreground px-2.5 py-1 rounded-full">
                        #{tag}
                      </span>
                                        ))}
                                    </div>
                                )}
                                <Link href={`/blog/${slug}`} className="text-blue-400 hover:text-blue-300 font-medium text-sm">
                                    阅读全文 &rarr;
                                </Link>
                            </div>
                        </article>
                    ))}
                </div>
            ) : (
                <p className="text-center text-muted-foreground py-10">
                    {selectedTag ? `没有找到标签为 "${selectedTag}" 的文章。` : "暂无博文。"}
                </p>
            )}
        </div>
    );
}