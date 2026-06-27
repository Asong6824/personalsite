// src/app/layout.js
import Navbar from '@/components/layout/Navbar'; // 确保路径正确
import PerformanceMonitor from '@/components/debug/PerformanceMonitor';
import './globals.css'; // 您的全局样式

export const metadata = {
    title: '大盈若冲',
    description: '阿松个人主页',
};

export default function RootLayout({ children }) {
    return (
        <html lang="zh-CN">
            <body className="font-sans bg-background text-foreground" suppressHydrationWarning>
                <PerformanceMonitor />
                <Navbar />
                <main>{children}</main>
            </body>
        </html>
    );
}
