// src/app/blog/life/[columnSlug]/[postSlug]/page.jsx
import { getPostData, getPostsByColumn } from '@/lib/post';
import { generatePostStaticParams, generatePostMetadata, validateChannelColumn } from '@/lib/route-utils';
import { generateArticleStructuredData } from '@/lib/seo-utils';
import { CHANNELS_CONFIG } from '@/lib/channels';
import PostLayout from '@/components/features/PostLayout';
import StructuredData from '@/components/StructuredData';
import { notFound } from 'next/navigation';

const CHANNEL_KEY = 'life';

// 生成静态参数
export async function generateStaticParams() {
    return generatePostStaticParams(CHANNEL_KEY);
}

// 生成元数据
export async function generateMetadata({ params }) {
    const { columnSlug, postSlug } = await params;
    const post = getPostData(postSlug);
    return generatePostMetadata(post, 'life', columnSlug);
}

export default async function LifePostPage({ params }) {
    const { columnSlug, postSlug } = await params;
    const validation = validateChannelColumn(CHANNEL_KEY, columnSlug);
    
    if (!validation) {
        notFound();
    }
    
    const { channelConfig, columnConfig } = validation;
    const post = getPostData(postSlug);
    
    if (!post) {
        notFound();
    }
    
    // 验证文章是否属于指定的频道和专栏
    const postTags = post.tags || [];
    const columnTags = columnConfig.tags || [];
    const hasMatchingTag = postTags.some(tag => columnTags.includes(tag));
    
    if (!hasMatchingTag) {
        notFound();
    }
    
    // 获取相关文章（同专栏的其他文章）
    const relatedPosts = getPostsByColumn(CHANNEL_KEY, columnSlug)
        .filter(p => p.slug !== postSlug)
        .slice(0, 3);
    
    // 生成结构化数据
    const structuredData = generateArticleStructuredData(post, CHANNEL_KEY, columnSlug, channelConfig, columnConfig);
    
    return (
        <>
            <StructuredData data={structuredData} id="life-post-structured-data" />
            <PostLayout
                post={post}
                channelKey={CHANNEL_KEY}
                columnKey={columnSlug}
                channelConfig={channelConfig}
                columnConfig={columnConfig}
                relatedPosts={relatedPosts}
            />
        </>
    );
}