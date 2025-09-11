// app/blog/page.jsx
import { CHANNELS_CONFIG } from '@/lib/channels';
import { AnimatedTestimonials } from '@/components/ui/animated-testimonials';
import { Timeline } from '@/components/ui/timeline';
import { getSortedPostsData } from '@/lib/post';
import Link from 'next/link';

export const metadata = {
    title: '博客 | 阿松的个人网站',
    description: '浏览我的所有技术分享、学习笔记和生活感悟。',
};

export default function BlogIndexPage() {
    // 频道卡片数据
    const channelTestimonials = Object.entries(CHANNELS_CONFIG).map(([key, config]) => ({
        quote: config.description,
        name: config.name,
        designation: `${Object.keys(config.columns).length} 个专栏`,
        src: config.icon,
        link: `/blog/${key}`
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
            date: post.date,
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
            posts: posts.slice(0, 6) // 每年最多显示6篇文章
        }));
    
    return (
        <div className="min-h-screen">
            {/* 频道卡片区域 */}
            <div className="flex items-center justify-center min-h-screen">
                <div className="container mx-auto px-4 py-8 max-w-4xl">
                    <AnimatedTestimonials 
                        testimonials={channelTestimonials}
                        autoplay={false}
                    />
                </div>
            </div>
            
            {/* 时间轴区域 */}
            <Timeline data={timelineData} />
        </div>
    );
}