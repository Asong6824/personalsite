// app/blog/page.jsx
import { CHANNELS_CONFIG } from '@/lib/channels';
import TakeoverLinks from '@/components/ui/takeover-links';
import { Timeline } from '@/components/ui/timeline';
import { getSortedPostsData } from '@/lib/post';
import Link from 'next/link';

export const metadata = {
    title: '博客 | 阿松的个人网站',
    description: '浏览我的所有技术分享、学习笔记和生活感悟。',
};

export default function BlogIndexPage() {
    // 频道卡片数据 -> TakeoverLinks items
    const channelItems = Object.entries(CHANNELS_CONFIG).map(([key, config]) => ({
        title: config.name,
        // 简化为仅展示频道名称，取消副文以符合参考风格
        href: `/blog/${key}`,
        image: (Object.values(config.columns) as any[])?.[0]?.cover || config.icon,
        accent: ({ tech: '#141413', life: '#141413', finance: '#10b981' }[key]) || 'rgb(56 189 248)'
    }));

    // 获取所有文章数据并按年份分组
    const allPosts = getSortedPostsData();
    const postsByYear = allPosts.reduce((acc, post) => {
        const year = new Date(post.date).getFullYear().toString();
        if (!acc[year]) {
            acc[year] = [];
        }
        acc[year].push({
            title: post.title,
            description: post.excerpt || post.title,
            date: new Date(post.date).toISOString().slice(0, 10),
            channel: CHANNELS_CONFIG[post.channel]?.name || post.channel,
            image: post.coverImage,
            href: `/blog/${post.channel}/${post.column}/${post.slug}`
        });
        return acc;
    }, {});

    // 转换为时间轴数据格式，按年份降序排列
    const timelineData = Object.entries(postsByYear)
        .sort(([a], [b]) => parseInt(b) - parseInt(a))
        .map(([year, posts]) => ({
            title: year,
            posts,
        }));

    return (
        <div className="min-h-screen bg-white dark:bg-neutral-950">
            <TakeoverLinks items={channelItems} variant="fullscreen" />
            <div className="mt-10">
                <Timeline data={timelineData} />
            </div>
        </div>
    );
}
