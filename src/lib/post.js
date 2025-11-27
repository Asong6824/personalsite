// lib/posts.js
import fs from 'fs'; // Node.js 文件系统模块
import path from 'path'; // Node.js 路径模块
import matter from 'gray-matter'; // 解析 Markdown/MDX frontmatter
import { withCache } from './cache';
import { listIndexedPosts, listIndexedSlugs, findPostPathBySlug, getOrBuildPostsIndex } from './post-index';

// 导入频道配置
import { getChannelByTags, getColumnByTags, CHANNELS_CONFIG } from './channels';

/**
 * 获取所有博文的元数据，并按日期降序排序（原始函数，不缓存）。
 * @returns {Array<Object>} 博文元数据数组，每个对象包含 slug 和 frontmatter 中的所有数据。
 */
function _getSortedPostsData() {
    const allPostsData = listIndexedPosts().filter(post => !post.hidden);
    return allPostsData;
}

/**
 * 获取所有博文的元数据，并按日期降序排序（带缓存）。
 * @returns {Array<Object>} 博文元数据数组，每个对象包含 slug 和 frontmatter 中的所有数据。
 */
export const getSortedPostsData = withCache(_getSortedPostsData, 'sorted-posts-data', 10 * 60 * 1000); // 10分钟缓存

/**
 * 获取所有博文的 slug 列表。
 * 这主要用于 Next.js 的 generateStaticParams 函数，以便在构建时生成动态路由。
 * @returns {Array<{ slug: string[] }>} slug 对象数组。
 */
export function getAllPostSlugs() {
    const slugs = listIndexedSlugs();
    // For [...slug], we need to return an array of path segments
    return slugs.map(slug => ({ slug: slug.split('/') }));
}

/**
 * 根据 slug 获取单篇博文的完整数据，包括 frontmatter 和 MDX 内容（原始函数，不缓存）。
 * @param {string} slug - 博文的 slug (不含文件扩展名)。
 * @returns {Promise<Object|null>} 包含 slug, frontmatter 和 content 的对象，如果找不到则返回 null。
 * 注意：虽然内部使用了同步的 fs 操作，但通常在 Next.js 的 async Server Components 或 generateMetadata 中调用，
 * 保持其为普通函数即可，调用方会用 await (如果调用它的函数是 async)。
 * 如果未来有异步操作（如数据库查询），此函数可改为 async。
 */
function _getPostData(slug) {
    console.log(`[Debug] _getPostData called for slug: ${slug}`);
    let fullPath = findPostPathBySlug(slug);
    if (!fullPath) {
        getOrBuildPostsIndex();
        fullPath = findPostPathBySlug(slug);
        if (!fullPath) {
            return null;
        }
    }
    try {
        console.log(`[Debug] Reading file: ${fullPath}`);
        const fileContents = fs.readFileSync(fullPath, 'utf8');
        const { data, content } = matter(fileContents);
        if (data.hidden) {
            console.log(`[Debug] Post hidden: ${slug}`);
            return null;
        }
        console.log(`[Debug] Successfully read post: ${slug}`);
        return {
            slug,
            frontmatter: data,
            content,
        };
    } catch (error) {
        console.error(`Error reading or parsing post with slug "${slug}":`, error);
        return null;
    }
}

/**
 * 根据 slug 获取单篇博文的完整数据，包括 frontmatter 和 MDX 内容（带缓存）。
 * @param {string} slug - 博文的 slug (不含文件扩展名)。
 * @returns {Promise<Object|null>} 包含 slug, frontmatter 和 content 的对象，如果找不到则返回 null。
 */
export const getPostData = withCache(_getPostData, 'post-data', 15 * 60 * 1000);

function _getPostSummary(slug) {
    const idx = getOrBuildPostsIndex();
    const hit = idx.items.find(i => i.slug === slug);
    if (!hit) return null;
    return { slug: hit.slug, ...hit.data };
}

export const getPostSummary = withCache(_getPostSummary, 'post-summary', 10 * 60 * 1000);

/**
 * 根据频道获取文章（原始函数，不缓存）
 * @param {string} channelKey - 频道key
 * @returns {Array} 文章数组
 */
function _getPostsByChannel(channelKey) {
    const allPosts = getSortedPostsData();
    if (!channelKey) return allPosts;

    return allPosts.filter(post => {
        const channel = getChannelByTags(post);
        return channel === channelKey;
    });
}

/**
 * 根据频道获取文章（带缓存）
 * @param {string} channelKey - 频道key
 * @returns {Array} 文章数组
 */
export const getPostsByChannel = withCache(_getPostsByChannel, 'posts-by-channel', 8 * 60 * 1000); // 8分钟缓存

/**
 * 根据专栏获取文章（原始函数，不缓存）
 * @param {string} channelKey - 频道key
 * @param {string} columnKey - 专栏key
 * @returns {Array} 文章数组
 */
function _getPostsByColumn(channelKey, columnKey) {
    const allPosts = getSortedPostsData();
    if (!channelKey || !columnKey) return allPosts;

    return allPosts.filter(post => {
        const column = getColumnByTags(post);
        return column && column.channelKey === channelKey && column.columnKey === columnKey;
    });
}

/**
 * 根据专栏获取文章（带缓存）
 * @param {string} channelKey - 频道key
 * @param {string} columnKey - 专栏key
 * @returns {Array} 文章数组
 */
export const getPostsByColumn = withCache(_getPostsByColumn, 'posts-by-column', 8 * 60 * 1000); // 8分钟缓存

export function getAllUniqueTags() {
    const allPosts = getSortedPostsData();
    const tagSet = new Set();
    allPosts.forEach(post => {
        if (post.tags && Array.isArray(post.tags)) {
            post.tags.forEach(tag => {
                if (tag && typeof tag === 'string') { // 确保标签存在且为字符串
                    tagSet.add(tag.trim()); // 可以转换为小写并去除首尾空格以统一
                }
            });
        }
    });
    return Array.from(tagSet).sort(); // 返回排序后的唯一标签数组
}