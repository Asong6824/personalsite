// src/app/layout.js
import Navbar from '@/components/layout/Navbar'; // 确保路径正确
import './globals.css'; // 您的全局样式

// 假设您有字体设置
import { Inter } from 'next/font/google';
const inter = Inter({ subsets: ['latin'] });

export const metadata = {
    title: '且听松涛',
    description: '阿松个人主页',
};

export default function RootLayout({ children }) {
    return (
        <html lang="zh-CN">
        <body className={`${inter.className} bg-background text-foreground`}>
        <Navbar/>
        <main>{children}</main>
        </body>
        </html>
    );
}

