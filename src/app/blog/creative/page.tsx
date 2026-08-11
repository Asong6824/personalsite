import { CreativeInfiniteCanvas } from '@/components/creative/CreativeInfiniteCanvas';
import { CHANNELS_CONFIG } from '@/lib/channels';
import { getPostsByChannel } from '@/lib/post';

export default function CreativePage() {
    const posts = getPostsByChannel('creative');
    const columns = Object.entries(CHANNELS_CONFIG.creative.columns).map(([key, column]) => ({
        key,
        name: column.name,
        description: column.description,
        cover: column.cover ?? '',
        articles: posts
            .filter((post) => post.column === key)
            .map((post) => ({
                slug: post.slug,
                title: post.title,
                date: post.date,
                excerpt: post.excerpt ?? '',
                coverImage: post.coverImage ?? '',
                tags: post.tags,
            })),
    }));

    return <CreativeInfiniteCanvas columns={columns} />;
}
