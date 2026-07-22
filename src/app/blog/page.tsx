import Link from 'next/link';

import { BlogKnowledgeMap } from '@/components/features/BlogKnowledgeMap';
import { CONTENT_GRAPH_SLUGS } from '@/data/content-graph';
import { CHANNELS_CONFIG } from '@/lib/channels';
import { getSortedPostsData } from '@/lib/post';

export const metadata = {
    title: '博客 | 大盈若冲',
    description: '阿松的个人主页：技术、创作、生活与投资记录。',
};

const dateFormatter = new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
});

function formatDate(date: string) {
    return dateFormatter.format(new Date(date)).replaceAll('/', '.');
}

export default function BlogIndexPage() {
    const allPosts = getSortedPostsData();
    const latestPosts = [...allPosts]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 12);
    const contentGraphSlugs = new Set(CONTENT_GRAPH_SLUGS);
    const knowledgeMapPosts = allPosts
        .filter((post) => contentGraphSlugs.has(post.slug))
        .map((post) => ({
            slug: post.slug,
            title: post.title,
            date: post.date,
            channel: post.channel,
            column: post.column,
            tags: post.tags,
            excerpt: post.excerpt,
        }));

    const channels = Object.entries(CHANNELS_CONFIG).map(([key, config]) => ({
        key,
        ...config,
        count: allPosts.filter((post) => post.channel === key).length,
    }));

    return (
        <div className="min-h-screen bg-[#F0EEE7] text-[#141413]">
            <main className="mx-auto w-full max-w-[1480px] px-6 pb-24 pt-32 sm:px-10 lg:px-16 lg:pb-32 lg:pt-40">
                <header className="grid gap-8 pb-12 lg:grid-cols-12 lg:gap-8 lg:pb-14">
                    <div className="lg:col-span-4">
                        <p className="mb-5 font-mono text-xs uppercase tracking-[0.24em] text-[#68645d]">
                            Blog / 文章目录
                        </p>
                        <p className="text-base leading-7 text-[#4f4b45] sm:text-lg sm:leading-8">
                            大盈若冲
                        </p>
                    </div>
                    <div className="lg:col-span-8 lg:pt-7">
                        <div className="max-w-2xl space-y-2 text-base leading-7 text-[#4f4b45] sm:text-lg sm:leading-8">
                            <p>我致力于探索新技术，让生活变得更有趣、更丰富、更有质感。</p>
                            <p>我喜欢旅行、收集，也享受接触新事物的过程。</p>
                            <p>这里是我的数字花园，记录我想记录的内容。</p>
                        </div>
                        <p className="mt-5 font-mono text-xs tracking-[0.12em] text-[#68645d]">
                            共 {allPosts.length} 篇文章 · 持续更新
                        </p>
                    </div>
                </header>

                <section aria-labelledby="channels-heading" className="border-b border-[#141413]/25 py-12 lg:py-16">
                    <div className="mb-8 flex items-baseline justify-between gap-6">
                        <h2 id="channels-heading" className="text-sm font-semibold tracking-[0.12em]">按频道浏览</h2>
                        <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-[#68645d]">Four directions</span>
                    </div>
                    <div className="grid border-l border-t border-[#141413]/20 sm:grid-cols-2 lg:grid-cols-4">
                        {channels.map((channel, index) => (
                            <Link
                                key={channel.key}
                                href={`/blog/${channel.key}`}
                                className="group flex min-h-60 flex-col justify-between border-b border-r border-[#141413]/20 p-6 transition-colors duration-200 hover:bg-[#E2DBCE] focus-visible:bg-[#E2DBCE] focus-visible:outline-none lg:min-h-72 lg:p-8"
                            >
                                <div className="flex items-start justify-between font-mono text-xs text-[#68645d]">
                                    <span>0{index + 1}</span>
                                    <span>{channel.count} 篇</span>
                                </div>
                                <div>
                                    <h3 className="mb-3 font-serif text-4xl tracking-[-0.04em] lg:text-5xl">{channel.name}</h3>
                                    <p className="max-w-[15rem] text-sm leading-6 text-[#68645d]">{channel.description}</p>
                                    <span className="mt-6 inline-block text-sm transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true">进入频道 →</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>

                <BlogKnowledgeMap posts={knowledgeMapPosts} />

                <section aria-labelledby="latest-heading" className="pt-12 lg:pt-16">
                    <div className="grid gap-8 lg:grid-cols-12 lg:gap-8">
                        <div className="lg:col-span-3">
                            <h2 id="latest-heading" className="text-sm font-semibold tracking-[0.12em]">最近更新</h2>
                            <p className="mt-3 max-w-52 text-sm leading-6 text-[#68645d]">按发布时间排列，标题就是全部线索。</p>
                        </div>
                        <div className="border-t border-[#141413]/25 lg:col-span-9">
                            {latestPosts.map((post, index) => {
                                const channelName = CHANNELS_CONFIG[post.channel as keyof typeof CHANNELS_CONFIG]?.name ?? post.channel;

                                return (
                                    <Link
                                        key={post.slug}
                                        href={`/blog/${post.slug}`}
                                        className="group grid gap-3 border-b border-[#141413]/20 py-5 transition-colors hover:bg-[#E2DBCE]/60 focus-visible:bg-[#E2DBCE]/60 focus-visible:outline-none sm:grid-cols-[4.5rem_1fr_auto] sm:items-baseline sm:gap-6 sm:px-3 lg:py-6"
                                    >
                                        <span className="font-mono text-[11px] text-[#68645d]">{String(index + 1).padStart(2, '0')}</span>
                                        <span className="font-serif text-xl leading-snug tracking-[-0.02em] sm:text-2xl lg:text-[1.7rem]">{post.title}</span>
                                        <span className="flex items-center gap-4 text-xs text-[#68645d]">
                                            <span>{channelName}</span>
                                            <time dateTime={post.date} className="font-mono">{formatDate(post.date)}</time>
                                            <span className="hidden transition-transform group-hover:translate-x-1 sm:inline" aria-hidden="true">→</span>
                                        </span>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}
