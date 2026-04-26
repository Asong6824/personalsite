// src/app/layout.js
import Navbar from '@/components/layout/Navbar'; // 确保路径正确
import PerformanceMonitor from '@/components/debug/PerformanceMonitor';
import './globals.css'; // 您的全局样式

// 假设您有字体设置
import { Inter, Newsreader } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const newsreader = Newsreader({ 
    subsets: ['latin'],
    style: ['normal', 'italic'],
    variable: '--font-newsreader'
});

export const metadata = {
    title: '且听松涛',
    description: '阿松个人主页',
};

export default function RootLayout({ children }) {
    return (
        <html lang="zh-CN">
            <body className={`${inter.variable} ${newsreader.variable} ${inter.className} bg-background text-foreground`} suppressHydrationWarning>
                <PerformanceMonitor />
                <Navbar />
                <main>{children}</main>
            </body>
        </html>
    );
}
