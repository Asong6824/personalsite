// src/app/blog/life/page.jsx
import { getPostsByChannel } from '@/lib/post';
import { CHANNELS_CONFIG } from '@/lib/channels';
import LifeChannelLayout from '@/components/features/LifeChannelLayout';

export const metadata = {
    title: '生活频道 | 阿松的个人网站',
    description: '生活感悟与旅行记录，包含旅行记录、生活感悟等专栏内容。',
};

export default function LifeChannelPage() {
    const channelKey = 'life';
    const channelConfig = CHANNELS_CONFIG[channelKey];
    const posts = getPostsByChannel(channelKey);

    return (
        <LifeChannelLayout
            channelKey={channelKey}
            channelConfig={channelConfig}
            posts={posts}
        />
    );
}