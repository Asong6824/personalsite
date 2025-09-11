// src/lib/route-utils.js
// 通用路由生成工具函数

import { getPostsByColumn } from './post';
import { CHANNELS_CONFIG } from './channels';
import { validateChannelExists, validateColumnExists } from './config-validator';
import { generateEnhancedMetadata, generateColumnStructuredData, generateArticleStructuredData } from './seo-utils';

/**
 * 为指定频道生成专栏的静态参数
 * @param {string} channelKey - 频道键名
 * @returns {Array} 静态参数数组
 */
export function generateColumnStaticParams(channelKey) {
    const channelConfig = CHANNELS_CONFIG[channelKey];
    
    if (!channelConfig) return [];
    
    return Object.keys(channelConfig.columns).map(columnKey => ({
        columnSlug: columnKey
    }));
}

/**
 * 为指定频道生成文章的静态参数
 * @param {string} channelKey - 频道键名
 * @returns {Array} 静态参数数组
 */
export function generatePostStaticParams(channelKey) {
    const channelConfig = CHANNELS_CONFIG[channelKey];
    
    if (!channelConfig) return [];
    
    const params = [];
    
    for (const columnKey of Object.keys(channelConfig.columns)) {
        const posts = getPostsByColumn(channelKey, columnKey);
        for (const post of posts) {
            params.push({
                columnSlug: columnKey,
                postSlug: post.slug
            });
        }
    }
    
    return params;
}

/**
 * 生成专栏页面的元数据
 * @param {string} channelKey - 频道键名
 * @param {string} columnSlug - 专栏slug
 * @param {Array} posts - 专栏文章列表（可选）
 * @returns {Object} 元数据对象
 */
export function generateColumnMetadata(channelKey, columnSlug, posts = []) {
    const channelConfig = CHANNELS_CONFIG[channelKey];
    const columnConfig = channelConfig?.columns?.[columnSlug];
    
    if (!columnConfig) {
        return {
            title: '专栏未找到 | 阿松的个人网站'
        };
    }
    
    const url = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/blog/${channelKey}/${columnSlug}`;
    const tags = [channelConfig.name, columnConfig.name, '博客', '文章'];
    
    return generateEnhancedMetadata({
        title: `${columnConfig.name} | ${channelConfig.name} | 阿松的个人网站`,
        description: columnConfig.description,
        url,
        tags,
        section: channelConfig.name,
        type: 'website'
    });
}

/**
 * 生成文章页面的基础元数据
 * @param {Object} post - 文章数据
 * @param {string} channelKey - 频道键名（可选）
 * @param {string} columnSlug - 专栏slug（可选）
 * @returns {Object} 元数据对象
 */
export function generatePostMetadata(post, channelKey = null, columnSlug = null) {
    if (!post) {
        return {
            title: '文章未找到 | 阿松的个人网站'
        };
    }
    
    const channelConfig = channelKey ? CHANNELS_CONFIG[channelKey] : null;
    const columnConfig = channelConfig?.columns?.[columnSlug];
    
    const url = channelKey && columnSlug 
        ? `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/blog/${channelKey}/${columnSlug}/${post.slug}`
        : `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/posts/${post.slug}`;
    
    const tags = [
        ...(post.tags || []),
        ...(channelConfig ? [channelConfig.name] : []),
        ...(columnConfig ? [columnConfig.name] : []),
        '博客',
        '文章'
    ];
    
    return generateEnhancedMetadata({
        title: `${post.title} | 阿松的个人网站`,
        description: post.excerpt || post.title,
        url,
        image: post.coverImage,
        tags,
        section: columnConfig?.name || '博客',
        type: 'article',
        publishedTime: post.date,
        modifiedTime: post.lastModified || post.date,
        authors: post.author ? [post.author] : undefined
    });
}

/**
 * 验证频道和专栏配置
 * @param {string} channelKey - 频道键名
 * @param {string} columnSlug - 专栏slug
 * @returns {Object|null} 验证结果
 */
export function validateChannelColumn(channelKey, columnSlug) {
    // 使用配置验证器进行验证
    if (!validateChannelExists(CHANNELS_CONFIG, channelKey)) {
        console.warn(`⚠️  Channel '${channelKey}' does not exist`);
        return null;
    }
    
    if (!validateColumnExists(CHANNELS_CONFIG, channelKey, columnSlug)) {
        console.warn(`⚠️  Column '${columnSlug}' does not exist in channel '${channelKey}'`);
        return null;
    }
    
    const channelConfig = CHANNELS_CONFIG[channelKey];
    const columnConfig = channelConfig.columns[columnSlug];
    
    return {
        channelConfig,
        columnConfig
    };
}