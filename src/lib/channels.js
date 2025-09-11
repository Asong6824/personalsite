// src/lib/channels.js
// 频道和专栏配置

import { validateConfigInDevelopment } from './config-validator';

export const CHANNELS_CONFIG = {
    tech: {
        name: '技术',
        description: '技术分享与学习笔记',
        icon: '/tech_cover.svg',
        columns: {
            go: {
                name: 'Golang 精进之路',
                description: 'Go 语言相关技术文章',
                tags: ['Go', 'golang'],
                cover: 'https://blog-assets-asong.tos-cn-beijing.volces.com/tech/go/golang_cover.png'
            },
            general: {
                name: '通用技术',
                description: '通用技术分享',
                tags: ['技术', 'programming', 'tech'],
                cover: ''
            },
            product: {
                name: '产品设计',
                description: '产品设计与用户体验',
                tags: ['产品', 'product', '设计', 'UX', 'UI'],
                cover: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?q=80&w=2070&auto=format&fit=crop'
            },
        }
    },
    life: {
        name: '生活',
        description: '生活感悟与旅行记录',
        icon: 'https://blog-assets-asong.tos-cn-beijing.volces.com/travel/izu/xiuqiu_cover_1-1.jpg',
        columns: {
            japan: {
                name: '日本旅行',
                description: '日本旅行记录与文化体验',
                tags: ['日本', 'japan', '日本旅行', '日本文化'],
                cover: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=2070&auto=format&fit=crop'
            },
            thoughts: {
                name: '年度总结',
                description: '年度总结与回顾',
                tags: ['年度总结', 'thoughts', '总结', '回顾'],
                cover: 'https://blog-assets-asong.tos-cn-beijing.volces.com/travel/Hokkaido/hakodate_hachimanzaka_cover.jpg'
            },
            misc: {
                name: '杂记',
                description: '杂记与随想',
                tags: ['杂记', '随想', '记录'],
                cover: 'https://blog-assets-asong.tos-cn-beijing.volces.com/life/matsuri/kumogawa_beer_cover.jpeg'
            }
        }
    },
    finance: {
        name: '金融',
        description: '投资交易与金融市场分析',
        icon: '/placeholder-image.svg',
        columns: {
            finance: {
                name: '财经投资',
                description: '财经分析与投资心得',
                tags: ['财经', 'finance', '投资', 'investment'],
                cover: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=2070&auto=format&fit=crop'
            }
        }
    }
};

/**
 * 根据文章数据判断所属频道（优先使用手动指定，回退到标签匹配）
 * @param {Object|Array} postOrTags - 文章对象或标签数组
 * @returns {string|null} 频道key
 */
export function getChannelByTags(postOrTags) {
    // 如果传入的是文章对象且包含手动指定的频道
    if (postOrTags && typeof postOrTags === 'object' && !Array.isArray(postOrTags)) {
        if (postOrTags.channel && CHANNELS_CONFIG[postOrTags.channel]) {
            return postOrTags.channel;
        }
        // 使用文章的标签进行匹配
        const tags = postOrTags.tags;
        if (!tags || !Array.isArray(tags)) return null;
        
        for (const [channelKey, channel] of Object.entries(CHANNELS_CONFIG)) {
            for (const column of Object.values(channel.columns)) {
                if (tags.some(tag => column.tags.includes(tag))) {
                    return channelKey;
                }
            }
        }
        return null;
    }
    
    // 兼容原有的标签数组调用方式
    const tags = Array.isArray(postOrTags) ? postOrTags : null;
    if (!tags || !Array.isArray(tags)) return null;
    
    for (const [channelKey, channel] of Object.entries(CHANNELS_CONFIG)) {
        for (const column of Object.values(channel.columns)) {
            if (tags.some(tag => column.tags.includes(tag))) {
                return channelKey;
            }
        }
    }
    return null;
}

/**
 * 根据文章数据判断所属专栏（优先使用手动指定，回退到标签匹配）
 * @param {Object|Array} postOrTags - 文章对象或标签数组
 * @returns {Object|null} {channelKey, columnKey}
 */
export function getColumnByTags(postOrTags) {
    // 如果传入的是文章对象且包含手动指定的分类
    if (postOrTags && typeof postOrTags === 'object' && !Array.isArray(postOrTags)) {
        if (postOrTags.channel && postOrTags.column) {
            const channelConfig = CHANNELS_CONFIG[postOrTags.channel];
            if (channelConfig && channelConfig.columns[postOrTags.column]) {
                return { channelKey: postOrTags.channel, columnKey: postOrTags.column };
            }
        }
        
        // 使用文章的标签进行匹配
        const tags = postOrTags.tags;
        if (!tags || !Array.isArray(tags)) return null;
        
        for (const [channelKey, channel] of Object.entries(CHANNELS_CONFIG)) {
            for (const [columnKey, column] of Object.entries(channel.columns)) {
                if (tags.some(tag => column.tags.includes(tag))) {
                    return { channelKey, columnKey };
                }
            }
        }
        return null;
    }
    
    // 兼容原有的标签数组调用方式
    const tags = Array.isArray(postOrTags) ? postOrTags : null;
    if (!tags || !Array.isArray(tags)) return null;
    
    for (const [channelKey, channel] of Object.entries(CHANNELS_CONFIG)) {
        for (const [columnKey, column] of Object.entries(channel.columns)) {
            if (tags.some(tag => column.tags.includes(tag))) {
                return { channelKey, columnKey };
            }
        }
    }
    return null;
}

/**
 * 获取所有频道信息
 * @returns {Array} 频道信息数组
 */
export function getAllChannels() {
    return Object.entries(CHANNELS_CONFIG).map(([key, config]) => ({
        key,
        ...config
    }));
}

// 在开发环境中验证配置
validateConfigInDevelopment(CHANNELS_CONFIG);