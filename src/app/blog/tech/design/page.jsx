import { getPostsByColumn } from '@/lib/post';
import { CHANNELS_CONFIG } from '@/lib/channels';
import { BentoGrid, BentoGridItem } from '@/components/ui/bento-grid';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export const metadata = {
    title: '设计美学 | 技术频道',
    description: '像素、逻辑与美学的交汇',
};

export default function DesignColumnPage() {
    const channelKey = 'tech';
    const columnKey = 'design';
    const columnConfig = CHANNELS_CONFIG[channelKey]?.columns?.[columnKey];

    if (!columnConfig) {
        notFound();
    }

    const posts = getPostsByColumn(channelKey, columnKey);

    return (
        <div className="min-h-screen bg-white dark:bg-neutral-950 pt-24 pb-12 px-4 sm:px-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-16 text-center">
                    <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-pink-500 mb-4 tracking-tight">
                        {columnConfig.name}
                    </h1>
                    <p className="text-lg md:text-xl text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto font-light">
                        {columnConfig.description}
                    </p>
                </div>

                {/* Grid */}
                {posts.length > 0 ? (
                    <BentoGrid className="max-w-7xl mx-auto">
                        {posts.map((post, i) => (
                            <BentoGridItem
                                key={post.slug}
                                title={post.title}
                                description={post.excerpt}
                                header={
                                    <Link href={`/blog/${channelKey}/${columnKey}/${post.slug}`} className="block w-full h-full min-h-[6rem] rounded-xl overflow-hidden relative">
                                        {post.coverImage ? (
                                            <Image
                                                src={post.coverImage}
                                                alt={post.title}
                                                fill
                                                className="object-cover transition duration-200 group-hover/bento:scale-105"
                                            />
                                        ) : (
                                            <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-neutral-200 dark:from-neutral-900 dark:to-neutral-800 to-neutral-100" />
                                        )}
                                    </Link>
                                }
                                className={i === 3 || i === 6 ? "md:col-span-2" : ""}
                                icon={
                                    <div className="h-4 w-4 rounded-full bg-neutral-200 dark:bg-neutral-800 mb-2" />
                                }
                            />
                        ))}
                    </BentoGrid>
                ) : (
                    <div className="text-center py-20">
                        <p className="text-neutral-500 dark:text-neutral-400">
                            暂无文章，敬请期待...
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
