// src/app/layout.js
import { Suspense } from 'react';
import { Inter, JetBrains_Mono, Newsreader, Noto_Serif_SC } from 'next/font/google';
import Navbar from '@/components/layout/Navbar'; // 确保路径正确
import PerformanceMonitor from '@/components/debug/PerformanceMonitor';
import RouteTransitionFeedback from '@/components/layout/RouteTransitionFeedback';
import './globals.css'; // 您的全局样式

const inter = Inter({
    subsets: ['latin'],
    variable: '--font-inter',
    display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
    subsets: ['latin'],
    variable: '--font-jetbrains-mono',
    display: 'swap',
    preload: false,
});

const newsreader = Newsreader({
    subsets: ['latin'],
    variable: '--font-newsreader',
    style: ['normal', 'italic'],
    display: 'swap',
    preload: false,
});

const notoSerifSc = Noto_Serif_SC({
    subsets: ['latin'],
    variable: '--font-noto-serif-sc',
    display: 'swap',
    preload: false,
});

export const metadata = {
    title: '大盈若冲',
    description: '阿松个人主页',
};

export default function RootLayout({ children }) {
    return (
        <html
            lang="zh-CN"
            className={`${inter.variable} ${jetbrainsMono.variable} ${newsreader.variable} ${notoSerifSc.variable}`}
        >
            <body className="font-sans bg-background text-foreground" suppressHydrationWarning>
                <PerformanceMonitor />
                <Suspense fallback={null}>
                    <RouteTransitionFeedback />
                </Suspense>
                <Navbar />
                <main>{children}</main>
            </body>
        </html>
    );
}
