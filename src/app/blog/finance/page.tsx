// src/app/blog/finance/page.jsx
import FinanceHomeClient from '@/components/finance/FinanceHomeClient';
import { CHANNELS_CONFIG } from '@/lib/channels';
import { getPostsByChannel, getPostsByColumn } from '@/lib/post';
import { getFeaturedMarketStudy } from '@/lib/finance/market-study-loader';
import MarketStudySection from '@/components/finance/market-study/MarketStudySection';

export const metadata = {
    title: '金融频道 | 阿松的个人网站',
    description: '投资交易与金融市场分析，包含交易策略、投资理财、市场分析等专栏内容。',
};

export default async function FinanceChannelPage() {
    const channelConfig = CHANNELS_CONFIG['finance'];
    const allPosts = getPostsByChannel('finance');

    // 按专栏获取文章
    const postsByColumn = {};
    for (const columnKey of Object.keys(channelConfig.columns)) {
        postsByColumn[columnKey] = getPostsByColumn('finance', columnKey);
    }
    const featuredMarketStudy = await getFeaturedMarketStudy();

    return (
        <FinanceHomeClient
            channelConfig={channelConfig}
            postsByColumn={postsByColumn}
            allPosts={allPosts}
            marketStudySection={featuredMarketStudy ? <MarketStudySection study={featuredMarketStudy} compact /> : null}
        />
    );
}
