// app/blog/page.jsx
import { getSortedPostsData, getAllUniqueTags } from '@/lib/post'; // 确保路径正确
import BlogListClient from '@/components/features/BlogListClient'; // 我们接下来会创建这个客户端组件

export const metadata = {
    title: '所有博文 | 您的博客名', // 替换 "您的博客名"
    description: '浏览我的所有技术分享、学习笔记和生活感悟。',
};

export default function BlogIndexPage() {
    const allPosts = getSortedPostsData(); // 在服务器端获取所有博文
    const uniqueTags = getAllUniqueTags();   // 在服务器端获取所有唯一标签

    return (
        <div className="container mx-auto px-4 pt-16 pb-8 md:py-12">
            {/* 将数据传递给客户端组件进行筛选和展示 */}
            <BlogListClient initialPosts={allPosts} allTags={uniqueTags} />
        </div>
    );
}