// src/app/blog/tech/[columnSlug]/[postSlug]/page.jsx
import { getPostData, getPostsByColumn } from '@/lib/post';
import { generatePostStaticParams, generatePostMetadata, validateChannelColumn } from '@/lib/route-utils';
import { generateArticleStructuredData } from '@/lib/seo-utils';
import { CHANNELS_CONFIG } from '@/lib/channels';
import PostLayout from '@/components/features/PostLayout';
import StructuredData from '@/components/StructuredData';
import { notFound } from 'next/navigation';

const CHANNEL_KEY = 'tech';

// 生成静态参数
export async function generateStaticParams() {
    return generatePostStaticParams(CHANNEL_KEY);
}

// 生成元数据
export async function generateMetadata({ params }) {
    const { columnSlug, postSlug } = await params;
    const post = getPostData(postSlug);
    return generatePostMetadata(post, 'tech', columnSlug);
}

export default async function TechPostPage({ params }) {
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
    
    // 获取相关文章（同专栏的其他文章）
    const relatedPosts = getPostsByColumn(CHANNEL_KEY, columnSlug)
        .filter(p => p.slug !== postSlug)
        .slice(0, 3);
    
    // 生成结构化数据
    const structuredData = generateArticleStructuredData(post, CHANNEL_KEY, columnSlug, channelConfig, columnConfig);
    
    return (
        <>
            <StructuredData data={structuredData} id="tech-post-structured-data" />
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