
import Link from 'next/link';
import Image from 'next/image'; // 用于显示封面图
import { notFound } from 'next/navigation'; // 用于返回 404
import { format, parseISO } from 'date-fns'; // 用于格式化日期
import { zhCN } from 'date-fns/locale'; // 中文日期格式
import { BookOpen, CalendarDays, Clock3, Map, Newspaper, UserRound } from 'lucide-react';

import { getAllPostSlugs, getPostData } from '@/lib/post'; // 确保路径相对于您的项目结构正确
import { CHANNELS_CONFIG } from '@/lib/channels';
import { MDXRemote } from 'next-mdx-remote/rsc'; // 用于 App Router (RSC)渲染 MDX
import { TableOfContents } from '@/components/ui/TableOfContents';
import { MusicPlayer } from '@/components/ui/MusicPlayer'; // 导入目录组件
import { ArticleInfoItem } from '@/components/article/ArticleInfoItem';
import { ArticleRecommendations } from '@/components/article/ArticleRecommendations';
import { getArticleChannelStyle } from '@/components/article/article-channel-styles';
import {
    createArticleMdxComponents,
    SketchyRAGOverview,
} from '@/components/article/mdx-components';
import { articleMdxOptions } from '@/lib/article/mdx-options';
import { getArticleRecommendations } from '@/lib/article/recommendations';
import {
    estimateReadingMinutes,
    getArticleMediaLabel,
    getArticleMediaType,
    getPlaylistFromFrontmatter,
} from '@/lib/article/rendering';

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
    const isLifeChannel = frontmatter.channel === 'life';
    const isFinanceChannel = frontmatter.channel === 'finance';

    const articleSlug = slug.join('/');
    const currentStyle = getArticleChannelStyle(frontmatter.channel);
    const mdxComponents = createArticleMdxComponents({
        useChannelInkHeadings: isTechChannel || isLifeChannel,
    });
    const channelConfig = frontmatter.channel ? CHANNELS_CONFIG[frontmatter.channel as keyof typeof CHANNELS_CONFIG] : null;
    const columnConfig = channelConfig && frontmatter.column ? channelConfig.columns[frontmatter.column] : null;
    const formattedDate = frontmatter.date ? format(parseISO(frontmatter.date), 'yyyy年MM月dd日', { locale: zhCN }) : '未知日期';
    const readingMinutes = estimateReadingMinutes(content);
    const mediaType = getArticleMediaType(articleSlug, frontmatter);
    const mediaLabel = getArticleMediaLabel(mediaType);
    const musicPlaylist = getPlaylistFromFrontmatter(frontmatter);
    const recommendations = getArticleRecommendations(frontmatter, articleSlug);

    return (
        <div
            className={`min-h-screen ${currentStyle.containerBg}`}
            style={currentStyle.containerStyle}
            {...(isTechChannel && { 'data-tech-page': true })}
            {...(isLifeChannel && { 'data-life-page': true })}
        >
            <div className="pt-20">
                <div className="flex h-16 w-full items-center px-8 sm:px-10 lg:px-16 xl:px-24">
                    <div className={`flex flex-wrap items-center gap-x-2 gap-y-2 text-sm md:text-base ${currentStyle.headerMeta}`}>
                        <Link href="/blog" className="font-medium text-[var(--channel-ink,#141413)] hover:text-[var(--channel-muted,#68645d)]">博客</Link>
                        {channelConfig && (
                            <>
                                <span>/</span>
                                <Link
                                    href={`/blog/${frontmatter.channel}`}
                                    className="font-medium text-[var(--channel-ink,#141413)] hover:text-[var(--channel-muted,#68645d)]"
                                >
                                    {channelConfig.name}
                                </Link>
                            </>
                        )}
                        {columnConfig && (
                            <>
                                <span>/</span>
                                <Link
                                    href={`/blog/${frontmatter.channel}/${frontmatter.column}`}
                                    className="font-medium text-[var(--channel-ink,#141413)] hover:text-[var(--channel-muted,#68645d)]"
                                >
                                    {columnConfig.name}
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <main className="mx-auto w-[calc(100vw-2.5rem)] pb-10 pt-12 md:pb-14 md:pt-[9vh] xl:w-[75vw]">
                <div className="mx-auto article-container space-y-20 md:space-y-24 xl:space-y-[12vh]">
                    <section className="xl:min-h-[39vh]">
                        <header className="grid items-start gap-12 xl:grid-cols-12 xl:gap-x-[2.2%]">
                            <div className="xl:col-span-8 xl:col-start-2">
                                <h1 className={`text-[clamp(3rem,6.4vw,5.6rem)] font-bold mb-0 leading-[0.98] break-words tracking-normal ${currentStyle.headerTitle}`}>
                                    {frontmatter.title}
                                </h1>
                                {frontmatter.excerpt && (
                                    <p className={`mt-8 max-w-[46rem] text-xl leading-9 md:text-2xl md:leading-10 ${currentStyle.headerMeta}`}>
                                        {frontmatter.excerpt}
                                    </p>
                                )}
                                {frontmatter.tags && frontmatter.tags.length > 0 && (
                                    <div className="mt-6 flex flex-wrap gap-2">
                                        {frontmatter.tags.map(tag => (
                                            <span
                                                key={tag}
                                                className={`text-xs px-2.5 py-1 rounded-md cursor-default ${currentStyle.tagBg}`}
                                            >
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <aside className="grid gap-4 text-left xl:col-span-2 xl:col-start-10 xl:self-end">
                                <ArticleInfoItem icon={BookOpen} label="专栏" value={columnConfig?.name || frontmatter.column} />
                                <ArticleInfoItem icon={UserRound} label="作者" value={frontmatter.author || '佚名'} />
                                <ArticleInfoItem icon={CalendarDays} label="发布" value={formattedDate} />
                                <ArticleInfoItem icon={Clock3} label="阅读时间" value={`${readingMinutes} 分钟`} />
                                {mediaType && (
                                    <ArticleInfoItem
                                        icon={mediaType === 'interactive' ? Map : Newspaper}
                                        label="媒体"
                                        value={mediaLabel}
                                    />
                                )}
                            </aside>
                        </header>
                    </section>

                    {mediaType && (
                        <section className="mx-auto grid w-full xl:grid-cols-12 xl:gap-x-[2.2%]">
                            {mediaType === 'interactive' && (
                                <div className="not-prose article-top-media rounded-xl border border-[var(--channel-border,#D8D0C3)] bg-[color-mix(in_srgb,var(--channel-card,#E2DBCE)_42%,transparent)] p-4 md:p-6 xl:col-span-10 xl:col-start-2 [&>div]:my-0">
                                    <SketchyRAGOverview />
                                </div>
                            )}
                            {mediaType === 'video' && (
                                <div className="article-top-media overflow-hidden rounded-xl border border-[var(--channel-border,#D8D0C3)] bg-black xl:col-span-10 xl:col-start-2">
                                    <iframe
                                        src={frontmatter.heroVideo || frontmatter.videoUrl}
                                        title={`${frontmatter.title} 视频`}
                                        className="aspect-video w-full"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    />
                                </div>
                            )}
                            {mediaType === 'image' && (
                                <div className="article-top-media relative aspect-[16/9] overflow-hidden rounded-xl border border-[var(--channel-border,#D8D0C3)] xl:col-span-10 xl:col-start-2">
                                    <Image
                                        src={frontmatter.coverImage}
                                        alt={`${frontmatter.title} 封面图`}
                                        fill
                                        style={{ objectFit: 'cover' }}
                                        priority
                                        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 88vw, 1120px"
                                    />
                                </div>
                            )}
                        </section>
                    )}

                    <div className="xl:grid xl:grid-cols-12 xl:gap-x-[2.2%]">
                        <article className="mx-auto w-full min-w-0 xl:col-span-8 xl:col-start-2 xl:mx-0">
                            <div
                                className={`prose article-reading-prose dark:prose-invert max-w-none
            ${currentStyle.prose}

            [&_:not(pre)>code]:text-pink-600 dark:[&_:not(pre)>code]:text-pink-400
            [&_:not(pre)>code]:bg-neutral-200/50 dark:[&_:not(pre)>code]:bg-neutral-800/50
            [&_:not(pre)>code]:px-1.5 [&_:not(pre)>code]:py-0.5 [&_:not(pre)>code]:rounded-md
            [&_:not(pre)>code]:font-mono [&_:not(pre)>code]:text-sm
            [&_:not(pre)>code]:before:content-none [&_:not(pre)>code]:after:content-none

            prose-pre:bg-[#E2DBCE] dark:prose-pre:bg-[#E2DBCE] 
            prose-pre:text-[#141413] 
            prose-pre:rounded-xl 
            prose-pre:shadow-[inset_2px_2px_6px_rgba(0,0,0,0.05),inset_-1px_-1px_2px_rgba(255,255,255,0.5)] 
            prose-pre:border prose-pre:border-[#D8D0C3]
            prose-pre:p-4
            prose-pre:my-6`}
                            >
                                <MDXRemote
                                    source={content}
                                    components={mdxComponents}
                                    options={articleMdxOptions}
                                />
                            </div>

                            <ArticleRecommendations recommendations={recommendations} />

                            <div className="mt-14 pt-8 border-t border-[#D8D0C3] text-center">
                                <Link href="/blog" className={`font-medium ${isFinanceChannel ? 'text-[#506354] hover:text-[#1a1c19]' : isTechChannel || isLifeChannel ? 'text-[#141413] hover:text-[#68645d]' : 'text-blue-400 hover:text-blue-300'}`}>
                                    &larr; 返回博客列表
                                </Link>
                            </div>
                        </article>

                        <aside className="relative hidden xl:col-span-2 xl:col-start-11 xl:block">
                            <div className="sticky top-28 max-h-[calc(100vh-8rem)] overflow-y-auto space-y-4 pr-2">
                                {!isTechChannel && (
                                    <MusicPlayer playlist={musicPlaylist} />
                                )}
                                <TableOfContents />
                            </div>
                        </aside>
                    </div>
                </div>
            </main>
        </div>
    );
}
