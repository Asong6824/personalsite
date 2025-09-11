// src/app/blog/finance/[columnSlug]/page.jsx
import { getPostsByColumn } from '@/lib/post';
import { generateColumnStaticParams, generateColumnMetadata, validateChannelColumn } from '@/lib/route-utils';
import { generateColumnStructuredData } from '@/lib/seo-utils';
import { CHANNELS_CONFIG } from '@/lib/channels';
import ColumnLayout from '@/components/features/ColumnLayout';
import StructuredData from '@/components/StructuredData';
import { notFound } from 'next/navigation';

const CHANNEL_KEY = 'finance';

// 生成静态参数
export async function generateStaticParams() {
    return generateColumnStaticParams(CHANNEL_KEY);
}

// 生成元数据
export async function generateMetadata({ params }) {
    const { columnSlug } = await params;
    const posts = getPostsByColumn(CHANNEL_KEY, columnSlug);
    return generateColumnMetadata(CHANNEL_KEY, columnSlug, posts);
}

export default async function FinanceColumnPage({ params }) {
    const { columnSlug } = await params;
    const validation = validateChannelColumn(CHANNEL_KEY, columnSlug);
    
    if (!validation) {
        notFound();
    }
    
    const { channelConfig, columnConfig } = validation;
    const posts = getPostsByColumn(CHANNEL_KEY, columnSlug);
    
    // 生成结构化数据
    const structuredData = generateColumnStructuredData(CHANNEL_KEY, columnSlug, channelConfig, columnConfig, posts);
    
    return (
        <>
            <StructuredData data={structuredData} id="finance-column-structured-data" />
            <ColumnLayout
                channelKey={CHANNEL_KEY}
                channelConfig={channelConfig}
                columnKey={columnSlug}
                columnConfig={columnConfig}
                posts={posts}
            />
        </>
    );
}