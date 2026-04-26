
import Link from 'next/link';
import Image from 'next/image'; // 用于显示封面图
import { notFound } from 'next/navigation'; // 用于返回 404
import { format, parseISO } from 'date-fns'; // 用于格式化日期
import { zhCN } from 'date-fns/locale'; // 中文日期格式

import { getAllPostSlugs, getPostData } from '@/lib/post'; // 确保路径相对于您的项目结构正确
import { MDXRemote } from 'next-mdx-remote/rsc'; // 用于 App Router (RSC)渲染 MDX
import { InlineExplanation } from '@/components/ui/InlineExplanation'; // 导入InlineExplanation组件
import { TableOfContents } from '@/components/ui/TableOfContents';
import { MusicPlayer, defaultPlaylist } from '@/components/ui/MusicPlayer'; // 导入目录组件
import { Highlighter } from '@/components/magicui/highlighter';
import { BentoGrid, BentoGridItem } from '@/components/ui/bento-grid';
import { BeforeAfter } from '@/components/ui/BeforeAfter'; // 导入BeforeAfter组件
import { HSBSliders } from '@/components/mdx/HSBSliders';
import { ColorWheelSteps } from '@/components/mdx/ColorWheelSteps';
import { RotatableColorWheel } from '@/components/mdx/RotatableColorWheel';

// 导入 remark/rehype 插件 (用于 MDXRemote 的 options)
import remarkGfm from 'remark-gfm'; // 支持 GitHub Flavored Markdown (表格、删除线等)
import rehypeSlug from 'rehype-slug'; // 为标题生成 id
import rehypeAutolinkHeadings from 'rehype-autolink-headings'; // 为标题添加锚点链接
import rehypePrismPlus from 'rehype-prism-plus'; // 代码块语法高亮

// 1. (必需) 为动态路由生成静态参数 (SSG)
// 这个函数告诉 Next.js 在构建时要为哪些 slug 生成静态页面
export async function generateStaticParams() {
    const paths = await getAllPostSlugs();
    return paths;
}

// 2. 生成页面元数据
export async function generateMetadata({ params }) {
    const { slug } = await params;
    const postData = await getPostData(slug.join('/'));
    if (!postData) {
        return {
            title: 'Post Not Found',
        };
    }
    return {
        title: postData.frontmatter.title,
        description: postData.frontmatter.description || postData.frontmatter.excerpt,
        openGraph: {
            title: postData.frontmatter.title,
            description: postData.frontmatter.description || postData.frontmatter.excerpt,
            images: postData.frontmatter.coverImage ? [postData.frontmatter.coverImage] : [],
        },
    };
}

// 3. 页面组件
export default async function PostPage({ params }) {
    const { slug } = await params;
    const postData = await getPostData(slug.join('/'));

    if (!postData) {
        notFound();
    }

    const { frontmatter, content } = postData;
    const isTechChannel = frontmatter.channel === 'tech';

    // 频道特定样式配置
    const isCreateChannel = frontmatter.channel === 'create';

    const channelStyles = {
        tech: {
            containerBg: 'bg-[#f8f1ee] dark:bg-[#1a1a1a]',
            prose: 'prose-headings:text-gray-900 dark:prose-headings:text-gray-100 prose-a:text-[#a18072] dark:prose-a:text-[#c4a495] hover:prose-a:text-[#8b6b5d] dark:hover:prose-a:text-[#debbaf] prose-strong:text-[#FF7A45] dark:prose-strong:text-[#FF7A45] prose-blockquote:border-l-[#a18072] prose-blockquote:text-gray-700 dark:prose-blockquote:text-gray-300',
            headerTitle: 'text-gray-900 dark:text-white',
            headerMeta: 'text-gray-500 dark:text-gray-400',
            tagBg: 'bg-[#eaddd7] hover:bg-[#d8c5bc] text-[#5e4b42]',
        },
        create: {
            containerBg: 'bg-[#0a0a1a]',
            prose: 'prose-headings:text-white prose-a:text-purple-300 hover:prose-a:text-purple-200 prose-strong:text-purple-200 prose-blockquote:border-l-purple-400/60 prose-blockquote:text-white/70',
            headerTitle: 'text-white',
            headerMeta: 'text-white/40',
            tagBg: 'bg-white/5 hover:bg-white/10 text-white/60 border border-white/10',
        },
        default: {
            containerBg: 'bg-white dark:bg-neutral-950',
            prose: 'prose-headings:text-neutral-800 dark:prose-headings:text-sky-300 prose-a:text-blue-600 dark:prose-a:text-blue-400 hover:prose-a:text-blue-500 dark:hover:prose-a:text-blue-300 prose-strong:text-neutral-900 dark:prose-strong:text-neutral-100 prose-blockquote:border-l-sky-500 prose-blockquote:text-neutral-600 dark:prose-blockquote:text-neutral-300',
            headerTitle: 'text-neutral-900 dark:text-white',
            headerMeta: 'text-neutral-400',
            tagBg: 'bg-sky-700/70 hover:bg-sky-600/70 text-sky-200',
        }
    };

    const currentStyle = isTechChannel ? channelStyles.tech : isCreateChannel ? channelStyles.create : channelStyles.default;
    const mdxComponents = {
        // 添加InlineExplanation组件
        InlineExplanation: InlineExplanation,
        BentoGrid: BentoGrid,
        BentoGridItem: BentoGridItem,
        BeforeAfter: BeforeAfter,
        HSBSliders: HSBSliders,
        ColorWheelSteps: ColorWheelSteps,
        RotatableColorWheel: RotatableColorWheel,
        h2: ({ children, ...props }) => (
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4" {...props}>
                {children}
            </h2>
        ),
        h3: ({ children, ...props }) => (
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3" {...props}>
                {children}
            </h3>
        ),

        // 添加Highlighter组件，根据频道类型决定是否可用
        Highlighter: ({ children, color = isTechChannel ? "#a18072" : "#a18072", action = "highlight", ...props }) => (
            <Highlighter
                color={color}
                action={action}
                isView={true}
                animationDuration={800}
                {...props}
            >
                {children}
            </Highlighter>
        ),
    };

    return (
        <div className={`min-h-screen ${currentStyle.containerBg}`}>
            <div className="container mx-auto px-4 pb-8 pt-16 md:pb-12 md:pt-20">
                <div className="max-w-7xl mx-auto">
                    <div className="hidden xl:grid xl:grid-cols-[1fr_768px_1fr] xl:gap-8">
                        {/* 左侧空白区域 */}
                        <div></div>

                        {/* 文章内容 - 居中显示 */}
                        <article className="max-w-3xl"> {/* 控制文章最大宽度以提高可读性 */}
                            <header className="mb-8 md:mb-12 text-left">
                                <h1 className={`text-3xl sm:text-4xl md:text-5xl font-extrabold mb-4 leading-tight break-words ${currentStyle.headerTitle}`}>
                                    {frontmatter.title}
                                </h1>
                                <div className={`text-sm space-x-2 ${currentStyle.headerMeta}`}>
                                    <span>作者：{frontmatter.author || '佚名'}</span>
                                    <span>·</span>
                                    <span>
                                        发布于 {frontmatter.date ? format(parseISO(frontmatter.date), 'yyyy年MM月dd日', { locale: zhCN }) : '未知日期'}
                                    </span>
                                </div>
                                {frontmatter.tags && frontmatter.tags.length > 0 && (
                                    <div className="mt-4 flex flex-wrap justify-start items-center gap-2">
                                        {frontmatter.tags.map(tag => (
                                            <Link
                                                href={`/blog/tag/${tag}`} // 假设您未来会有标签页
                                                key={tag}
                                                className={`text-xs px-2.5 py-1 rounded-full transition-colors ${currentStyle.tagBg}`}
                                            >
                                                #{tag}
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </header>

                            {frontmatter.coverImage && (
                                <div
                                    className="mb-8 md:mb-12 rounded-lg overflow-hidden shadow-xl aspect-[16/9] relative"> {/* aspect-video 或其他比例 */}
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
                                className={`prose prose-lg dark:prose-invert max-w-none
            ${currentStyle.prose}

            // 行内代码样式 (使用 :not(pre) > code 避免影响代码块)
            [&_:not(pre)>code]:text-pink-600 dark:[&_:not(pre)>code]:text-pink-400
            [&_:not(pre)>code]:bg-neutral-200/50 dark:[&_:not(pre)>code]:bg-neutral-800/50
            [&_:not(pre)>code]:px-1.5 [&_:not(pre)>code]:py-0.5 [&_:not(pre)>code]:rounded-md
            [&_:not(pre)>code]:font-mono [&_:not(pre)>code]:text-sm
            [&_:not(pre)>code]:before:content-none [&_:not(pre)>code]:after:content-none

            // 代码块样式：Solarized/GitHub Light 风格 (纸张凹陷效果)
            prose-pre:bg-[#EAE8E0] dark:prose-pre:bg-[#EAE8E0] 
            prose-pre:text-[#24292e] 
            prose-pre:rounded-xl 
            prose-pre:shadow-[inset_2px_2px_6px_rgba(0,0,0,0.05),inset_-1px_-1px_2px_rgba(255,255,255,0.5)] 
            prose-pre:border prose-pre:border-[#d1d5da]
            prose-pre:p-4
            prose-pre:my-6`}
                            >
                                <MDXRemote
                                    source={content}
                                    components={mdxComponents}
                                    options={{
                                        mdxOptions: {
                                            remarkPlugins: [[remarkGfm, { breaks: true }]],
                                            rehypePlugins: [
                                                rehypeSlug,
                                                [rehypeAutolinkHeadings, {
                                                    behavior: 'append', // 或 'append' 或 'prepend'
                                                    properties: { className: ['anchor-link', 'opacity-0', 'group-hover:opacity-100', 'transition-opacity', 'duration-200'] }, // 自定义锚点链接样式
                                                    content: { // 自定义锚点链接图标 (可选)
                                                        type: 'element',
                                                        tagName: 'span',
                                                        properties: { className: ['inline-block', 'ml-2', 'text-neutral-500'] },
                                                        children: [{ type: 'text', value: '#' }]
                                                    }
                                                }],
                                                [rehypePrismPlus, { ignoreMissing: true, showLineNumbers: true }],
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

                        {/* 右侧目录区域 */}
                        <div className="relative">
                            <div className="sticky top-24 max-h-[calc(100vh-6rem)] overflow-y-auto space-y-4">
                                {!isTechChannel && (
                                    <MusicPlayer playlist={
                                        frontmatter.music
                                            ? Array.isArray(frontmatter.music)
                                                ? frontmatter.music.map((url, index) => ({
                                                    title: `背景音乐 ${index + 1}`,
                                                    artist: "博客配乐",
                                                    src: url
                                                }))
                                                : [{
                                                    title: "背景音乐 1",
                                                    artist: "博客配乐",
                                                    src: frontmatter.music
                                                }]
                                            : defaultPlaylist
                                    } />
                                )}
                                <TableOfContents />
                            </div>
                        </div>
                    </div>

                    {/* 小屏幕时的布局 */}
                    <article className="xl:hidden max-w-3xl mx-auto">
                        <header className="mb-8 md:mb-12 text-center">
                            <h1 className={`text-3xl sm:text-4xl md:text-5xl font-extrabold mb-4 leading-tight break-words ${currentStyle.headerTitle}`}>
                                {frontmatter.title}
                            </h1>
                            <div className={`text-sm space-x-2 ${currentStyle.headerMeta}`}>
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
                                            className={`text-xs px-2.5 py-1 rounded-full transition-colors ${currentStyle.tagBg}`}
                                        >
                                            #{tag}
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </header>

                        {frontmatter.coverImage && (
                            <div
                                className="mb-8 md:mb-12 rounded-lg overflow-hidden shadow-xl aspect-[16/9] relative"> {/* aspect-video 或其他比例 */}
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
                            className={`prose prose-lg dark:prose-invert max-w-none
            ${currentStyle.prose}

            // 行内代码样式 (使用 :not(pre) > code 避免影响代码块)
            [&_:not(pre)>code]:text-pink-600 dark:[&_:not(pre)>code]:text-pink-400
            [&_:not(pre)>code]:bg-neutral-200/50 dark:[&_:not(pre)>code]:bg-neutral-800/50
            [&_:not(pre)>code]:px-1.5 [&_:not(pre)>code]:py-0.5 [&_:not(pre)>code]:rounded-md
            [&_:not(pre)>code]:font-mono [&_:not(pre)>code]:text-sm
            [&_:not(pre)>code]:before:content-none [&_:not(pre)>code]:after:content-none

            // 代码块样式：Solarized/GitHub Light 风格 (纸张凹陷效果)
            prose-pre:bg-[#EAE8E0] dark:prose-pre:bg-[#EAE8E0] 
            prose-pre:text-[#24292e] 
            prose-pre:rounded-xl 
            prose-pre:shadow-[inset_2px_2px_6px_rgba(0,0,0,0.05),inset_-1px_-1px_2px_rgba(255,255,255,0.5)] 
            prose-pre:border prose-pre:border-[#d1d5da]
            prose-pre:p-4
            prose-pre:my-6`}
                        >
                            <MDXRemote
                                source={content}
                                components={mdxComponents}
                                options={{
                                    mdxOptions: {
                                        remarkPlugins: [[remarkGfm, { breaks: true }]],
                                        rehypePlugins: [
                                            rehypeSlug,
                                            [rehypeAutolinkHeadings, {
                                                behavior: 'append', // 或 'append' 或 'prepend'
                                                properties: { className: ['anchor-link', 'opacity-0', 'group-hover:opacity-100', 'transition-opacity', 'duration-200'] }, // 自定义锚点链接样式
                                                content: { // 自定义锚点链接图标 (可选)
                                                    type: 'element',
                                                    tagName: 'span',
                                                    properties: { className: ['inline-block', 'ml-2', 'text-neutral-500'] },
                                                    children: [{ type: 'text', value: '#' }]
                                                }
                                            }],
                                            [rehypePrismPlus, { ignoreMissing: true, showLineNumbers: true }],
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
            </div>
        </div>
    );
}