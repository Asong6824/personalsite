import { SITE_WARM_BACKGROUND } from '@/lib/site-theme';

export const metadata = {
    title: '金融频道 | 阿松的个人网站',
    description: '金融频道内容筹备中。',
};

export default function FinanceChannelPage() {
    return (
        <main
            className="flex min-h-[calc(100svh-5rem)] items-center justify-center px-6 py-24 text-center"
            style={{ backgroundColor: SITE_WARM_BACKGROUND }}
        >
            <div className="max-w-md">
                <p className="mb-4 text-xs font-medium uppercase tracking-[0.28em] text-neutral-500">
                    Finance Channel
                </p>
                <h1
                    className="text-4xl font-semibold tracking-tight text-neutral-900 sm:text-5xl"
                    style={{ fontFamily: 'var(--font-noto-serif-sc)' }}
                >
                    金融
                </h1>
                <div className="mx-auto my-8 h-px w-16 bg-neutral-300" />
                <p className="text-base leading-7 text-neutral-500">暂无内容</p>
            </div>
        </main>
    );
}
