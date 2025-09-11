// src/app/blog/tech/page.jsx
import { getPostsByChannel } from '@/lib/post';
import { CHANNELS_CONFIG } from '@/lib/channels';
import TechChannelLayout from '@/components/features/TechChannelLayout';

export const metadata = {
    title: '技术频道 | 阿松的个人网站',
    description: '技术分享与学习笔记，包含Go语言、通用技术等专栏内容。',
};

export default function TechChannelPage() {
    const channelKey = 'tech';
    const channelConfig = CHANNELS_CONFIG[channelKey];
    const posts = getPostsByChannel(channelKey);

    return (
        <TechChannelLayout
            channelKey={channelKey}
            channelConfig={channelConfig}
            posts={posts}
        />
    );
}