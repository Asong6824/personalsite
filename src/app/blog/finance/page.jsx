// src/app/blog/finance/page.jsx
import FinanceChannelClient from './FinanceChannelClient';

export const metadata = {
    title: '金融频道 | 阿松的个人网站',
    description: '投资交易与金融市场分析，包含交易策略、投资理财、市场分析等专栏内容。',
};

export default function FinanceChannelPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900">
            <div className="container mx-auto px-4 py-12">
                <FinanceChannelClient />
            </div>
        </div>
    );
}