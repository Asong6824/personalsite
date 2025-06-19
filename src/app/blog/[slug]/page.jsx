// src/app/blog/[slug]/page.jsx

import Link from 'next/link';
import Image from 'next/image'; // 用于显示封面图
import { notFound } from 'next/navigation'; // 用于返回 404
import { format, parseISO } from 'date-fns'; // 用于格式化日期
import { zhCN } from 'date-fns/locale'; // 中文日期格式

import { getAllPostSlugs, getPostData } from '@/lib/post'; // 确保路径相对于您的项目结构正确
import { MDXRemote } from 'next-mdx-remote/rsc'; // 用于 App Router (RSC)渲染 MDX

// 导入 remark/rehype 插件 (用于 MDXRemote 的 options)
import remarkGfm from 'remark-gfm'; // 支持 GitHub Flavored Markdown (表格、删除线等)
import rehypeSlug from 'rehype-slug'; // 为标题生成 id
import rehypeAutolinkHeadings from 'rehype-autolink-headings'; // 为标题添加锚点链接
import rehypePrismPlus from 'rehype-prism-plus'; // 代码块语法高亮

// 1. (必需) 为动态路由生成静态参数 (SSG)
// 这个函数告诉 Next.js 在构建时要为哪些 slug 生成静态页面
export async function generateStaticParams() {
    const paths = await getAllPostSlugs(); // 从 lib/posts.js 获取所有 slug
    // paths 的格式应该是: [{ slug: 'my-first-post' }, { slug: 'another-post' }, ...]
    return paths;
}

// 2. (推荐) 为每篇博文动态生成 SEO 元数据
export async function generateMetadata({ params }) {
    const postData = await getPostData(params.slug); // getPostData 是同步的，如果改为异步则这里用 await

    if (!postData) {
        // 如果博文不存在，可以返回一个通用的“未找到”标题
        return {
            title: '博文未找到',
        };
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const ogImageUrl = postData.frontmatter.coverImage
        ? new URL(postData.frontmatter.coverImage, siteUrl).toString()
        : new URL('/default-og-image.png', siteUrl).toString(); // 准备一个默认的 OG 图片

    return {
        title: `${postData.frontmatter.title} | 您的博客名`, // 替换“您的博客名”
        description: postData.frontmatter.excerpt || '阅读这篇精彩的文章...',
        authors: [{ name: postData.frontmatter.author || '站点作者' }],
        openGraph: {
            title: postData.frontmatter.title,
            description: postData.frontmatter.excerpt || '',
            url: `${siteUrl}/blog/${params.slug}`,
            siteName: '您的网站名', // 替换“您的网站名”
            images: [
                {
                    url: ogImageUrl,
                    width: 1200, // 推荐的 OG 图片宽度
                    height: 630, // 推荐的 OG 图片高度
                    alt: postData.frontmatter.title,
                },
            ],
            locale: 'zh_CN',
            type: 'article',
            publishedTime: postData.frontmatter.date ? new Date(postData.frontmatter.date).toISOString() : undefined,
            modifiedTime: postData.frontmatter.lastModified || postData.frontmatter.date ? new Date(postData.frontmatter.lastModified || postData.frontmatter.date).toISOString() : undefined,
            authors: postData.frontmatter.author ? [postData.frontmatter.author] : undefined,
            tags: postData.frontmatter.tags || [],
        },
        twitter: { // (可选) Twitter 卡片元数据
            card: 'summary_large_image',
            title: postData.frontmatter.title,
            description: postData.frontmatter.excerpt || '',
            images: [ogImageUrl],
            // creator: '@你的TwitterHandle',
        },
    };
}

// 3. 定义页面组件
export default function PostPage({ params }) { // params 中会包含 { slug: 'your-post-slug' }
    const postData = getPostData(params.slug); // getPostData 是同步的

    if (!postData) {
        notFound(); // 如果 getPostData 返回 null (表示文章不存在)，则调用 notFound() 显示 Next.js 的 404 页面
        return null; // notFound() 会抛出错误并中断渲染，所以这里 return null 理论上不会执行
    }

    const { frontmatter, content } = postData;

    // MDX 内容渲染时使用的自定义组件 (可选)
    const mdxComponents = {
        // 例如，如果您想自定义图片渲染，可以这样做：
        // img: (props) => (
        //   <span className="block my-6 rounded-lg overflow-hidden shadow-lg">
        //     {/* 使用 next/image 可能更好，但这需要更多关于图片尺寸的信息 */}
        //     {/* eslint-disable-next-line @next/next/no-img-element */}
        //     <img {...props} className="w-full h-auto" />
        //   </span>
        // ),
        // a: ({ href, children }) => { // 自定义链接处理
        //   if (href && href.startsWith('/')) {
        //     return <Link href={href}>{children}</Link>;
        //   }
        //   if (href && href.startsWith('#')) {
        //     return <a href={href}>{children}</a>;
        //   }
        //   return <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>;
        // },
        // 注意：代码块高亮已通过 rehypePlugins 处理，通常不需要在这里为 pre/code 自定义
    };

    return (
        <div className="container mx-auto px-4 py-8 md:py-12">
            <article className="max-w-3xl mx-auto flex flex-col"> {/* 控制文章最大宽度以提高可读性 */}
                <header className="mb-8 md:mb-12 text-center">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-4 text-neutral-900 dark:text-white leading-tight break-words">
                        {frontmatter.title}
                    </h1>
                    <div className="text-neutral-400 text-sm space-x-2">
                        <span>作者：{frontmatter.author || '佚名'}</span>
                        <span>·</span>
                        <span>
              发布于 {frontmatter.date ? format(parseISO(frontmatter.date), 'yyyy年MM月dd日', { locale: zhCN }) : '未知日期'}
            </span>
                    </div>
                    {frontmatter.tags && frontmatter.tags.length > 0 && (
                        <div className="mt-4 flex flex-wrap justify-center items-center gap-2">
                            {frontmatter.tags.map(tag => (
                                <Link
                                    href={`/blog/tag/${tag}`} // 假设您未来会有标签页
                                    key={tag}
                                    className="text-xs bg-sky-700/70 hover:bg-sky-600/70 text-sky-200 px-2.5 py-1 rounded-full transition-colors"
                                >
                                    #{tag}
                                </Link>
                            ))}
                        </div>
                    )}
                </header>

                {frontmatter.coverImage && (
                    <div className="mb-8 md:mb-12 rounded-lg overflow-hidden shadow-xl aspect-[16/9] relative"> {/* aspect-video 或其他比例 */}
                        <Image
                            src={frontmatter.coverImage}
                            alt={`${frontmatter.title} 封面图`}
                            fill
                            style={{ objectFit: 'cover' }}
                            priority // 对于首屏或重要的图片，建议添加 priority
                            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 80vw, 60vw" // 根据您的布局调整 sizes
                        />
                    </div>
                )}

                {/* 应用 Tailwind Typography 插件的样式，并可进一步自定义 */}
                <div
                    className="prose prose-lg dark:prose-invert max-w-none
        // 标题：亮色模式为深灰，暗色模式为天蓝
        prose-headings:text-neutral-800 dark:prose-headings:text-sky-300

        // 链接：亮色模式为深蓝，暗色模式为浅蓝
        prose-a:text-blue-600 dark:prose-a:text-blue-400
        hover:prose-a:text-blue-500 dark:hover:prose-a:text-blue-300

        // 粗体：亮色模式为纯黑，暗色模式为亮灰
        prose-strong:text-neutral-900 dark:prose-strong:text-neutral-100

        // 引用块：边框颜色不变，文本在亮色模式为中灰，暗色模式为浅灰
        prose-blockquote:border-l-sky-500
        prose-blockquote:text-neutral-600 dark:prose-blockquote:text-neutral-300

        // 行内代码：为两种模式分别设置文本和背景色
        prose-code:text-pink-600 dark:prose-code:text-pink-400
        prose-code:bg-neutral-200/50 dark:prose-code:bg-neutral-800/50
        prose-code:p-0.5 prose-code:px-1.5 prose-code:rounded-md prose-code:font-mono prose-code:text-sm

        // 代码块：背景在两种模式下都用暗色，因为有语法高亮
        prose-pre:bg-neutral-800/70 prose-pre:rounded-md prose-pre:shadow-md"
                >
                    <MDXRemote
                        source={content}
                        components={mdxComponents}
                        options={{
                            mdxOptions: {
                                remarkPlugins: [remarkGfm],
                                rehypePlugins: [
                                    rehypeSlug,
                                    [rehypeAutolinkHeadings, {
                                        behavior: 'wrap', // 或 'append' 或 'prepend'
                                        properties: {className: ['anchor-link', 'opacity-0', 'group-hover:opacity-100', 'transition-opacity', 'duration-200']}, // 自定义锚点链接样式
                                        content: { // 自定义锚点链接图标 (可选)
                                            type: 'element',
                                            tagName: 'span',
                                            properties: {className: ['inline-block', 'ml-2', 'text-neutral-500']},
                                            children: [{type: 'text', value: '#'}]
                                        }
                                    }],
                                    [rehypePrismPlus, {ignoreMissing: true, showLineNumbers: true}]
                                ],
                            },
                        }}
                    />
                </div>

                <div className="mt-12 pt-8 border-t border-neutral-700 text-center">
                    <Link href="/blog" className="text-blue-400 hover:text-blue-300 font-medium">
                        &larr; 返回博客列表
                    </Link>
                </div>
            </article>
        </div>
    );
}