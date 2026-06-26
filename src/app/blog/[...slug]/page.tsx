
import Link from 'next/link';
import Image from 'next/image'; // 用于显示封面图
import { notFound } from 'next/navigation'; // 用于返回 404
import { format, parseISO } from 'date-fns'; // 用于格式化日期
import { zhCN } from 'date-fns/locale'; // 中文日期格式
import { BookOpen, CalendarDays, Clock3, Map, Newspaper, UserRound } from 'lucide-react';

import { getAllPostSlugs, getPostData } from '@/lib/post'; // 确保路径相对于您的项目结构正确
import { CHANNELS_CONFIG, getColumnByTags } from '@/lib/channels';
import { MDXRemote } from 'next-mdx-remote/rsc'; // 用于 App Router (RSC)渲染 MDX
import { InlineExplanation } from '@/components/ui/InlineExplanation'; // 导入InlineExplanation组件
import { TableOfContents } from '@/components/ui/TableOfContents';
import { MusicPlayer, defaultPlaylist } from '@/components/ui/MusicPlayer'; // 导入目录组件
import { Highlighter } from '@/components/magicui/highlighter';
import { BentoGrid, BentoGridItem } from '@/components/ui/bento-grid';
import { BeforeAfter } from '@/components/ui/BeforeAfter'; // 导入BeforeAfter组件
import { SITE_WARM_BACKGROUND } from '@/lib/site-theme';
import { HSBSliders } from '@content/components/color/HSBSliders';
import { ColorWheelSteps } from '@content/components/color/ColorWheelSteps';
import { RotatableColorWheel } from '@content/components/color/RotatableColorWheel';
import { DualTimeline } from '@content/components/rag/DualTimeline';
import { RAGFlowDiagram } from '@content/components/rag/RAGFlowDiagram';
import { RAGSidesOverview } from '@content/components/rag/RAGSidesOverview';
import { SketchyRAGOverview } from '@content/components/rag/SketchyRAGOverview';
import { Word2VecVectorSpace } from '@content/components/rag/Word2VecVectorSpace';
import { InContextLearningChart } from '@content/components/rag/InContextLearningChart';
import {
    SketchySvg,
    SketchyLine,
    SketchyArrow,
    SketchyRect,
    SketchyCircle,
    SketchyEllipse,
    SketchyPath,
    SketchyDashedLine,
    SketchyText,
} from '@content/components/sketchy';
import { TravelRouteMap, CityWalkMap } from '@content/components/travel';

// 导入 remark/rehype 插件 (用于 MDXRemote 的 options)
import remarkGfm from 'remark-gfm'; // 支持 GitHub Flavored Markdown (表格、删除线等)
import rehypeSlug from 'rehype-slug'; // 为标题生成 id
import rehypeAutolinkHeadings from 'rehype-autolink-headings'; // 为标题添加锚点链接
import rehypePrismPlus from 'rehype-prism-plus'; // 代码块语法高亮

function estimateReadingMinutes(content) {
    const compact = content
        .replace(/```[\s\S]*?```/g, '')
        .replace(/<[^>]+>/g, '')
        .replace(/\s+/g, '');
    return Math.max(1, Math.ceil(compact.length / 550));
}

function InfoItem({ label, value, icon: Icon }) {
    if (!value) return null;
    return (
        <div className="grid grid-cols-[0.95rem_minmax(0,1fr)] gap-3">
            <div className="pt-0.5 text-[var(--channel-ink,#141413)]">
                {Icon && <Icon size={15} strokeWidth={1.55} />}
            </div>
            <div>
                <div className="text-xs font-medium leading-4 text-[var(--channel-muted,#68645d)]">
                    {label}
                </div>
                <div className="mt-0.5 text-[15px] font-medium leading-5 text-[var(--channel-ink,#141413)]">
                    {value}
                </div>
            </div>
        </div>
    );
}

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
    const isCreateChannel = frontmatter.channel === 'create';
    const isFinanceChannel = frontmatter.channel === 'finance';

    const channelStyles = {
        tech: {
            containerBg: 'bg-[#F0EEE7]',
            containerStyle: undefined,
            prose: 'prose-headings:text-[#141413] prose-p:text-[#141413] prose-li:text-[#141413] prose-a:text-[#141413] hover:prose-a:text-[#68645d] prose-strong:text-[#141413] prose-blockquote:border-l-[#141413] prose-blockquote:text-[#68645d]',
            headerTitle: 'text-[#141413]',
            headerMeta: 'text-[#68645d]',
            tagBg: 'bg-[#E2DBCE] hover:bg-[#D8D0C3] text-[#141413]',
        },
        life: {
            containerBg: 'bg-[#F0EEE7]',
            containerStyle: undefined,
            prose: 'prose-headings:text-[#141413] prose-p:text-[#141413] prose-li:text-[#141413] prose-a:text-[#141413] hover:prose-a:text-[#68645d] prose-strong:text-[#141413] prose-blockquote:border-l-[#141413] prose-blockquote:text-[#68645d]',
            headerTitle: 'text-[#141413]',
            headerMeta: 'text-[#68645d]',
            tagBg: 'bg-[#E2DBCE] hover:bg-[#D8D0C3] text-[#141413]',
        },
        create: {
            containerBg: '',
            containerStyle: { backgroundColor: SITE_WARM_BACKGROUND },
            prose: 'prose-headings:text-[#141413] prose-a:text-purple-700 hover:prose-a:text-purple-900 prose-strong:text-[#141413] prose-blockquote:border-l-purple-500/60 prose-blockquote:text-[#68645d] prose-p:text-[#141413] prose-li:text-[#141413]',
            headerTitle: 'text-[#141413]',
            headerMeta: 'text-[#68645d]',
            tagBg: 'bg-[#E2DBCE] hover:bg-[#D8D0C3] text-[#141413] border border-[#D8D0C3]',
        },
        finance: {
            containerBg: 'bg-[#F0EEE7]',
            containerStyle: undefined,
            prose: 'prose-headings:text-[#1a1c19] prose-a:text-[#506354] hover:prose-a:text-[#1a1c19] prose-strong:text-[#1a1c19] prose-blockquote:border-l-[#506354] prose-blockquote:text-[#444748] prose-p:text-[#444748]',
            headerTitle: 'text-[#1a1c19]',
            headerMeta: 'text-[#747878]',
            tagBg: 'bg-[#f4f4ef] hover:bg-[#e3e3de] text-[#444748]',
        },
        default: {
            containerBg: 'bg-white dark:bg-neutral-950',
            containerStyle: undefined,
            prose: 'prose-headings:text-neutral-800 dark:prose-headings:text-sky-300 prose-a:text-blue-600 dark:prose-a:text-blue-400 hover:prose-a:text-blue-500 dark:hover:prose-a:text-blue-300 prose-strong:text-neutral-900 dark:prose-strong:text-neutral-100 prose-blockquote:border-l-sky-500 prose-blockquote:text-neutral-600 dark:prose-blockquote:text-neutral-300',
            headerTitle: 'text-neutral-900 dark:text-white',
            headerMeta: 'text-neutral-400',
            tagBg: 'bg-sky-700/70 hover:bg-sky-600/70 text-sky-200',
        }
    };

    const currentStyle = isTechChannel ? channelStyles.tech : isLifeChannel ? channelStyles.life : isCreateChannel ? channelStyles.create : isFinanceChannel ? channelStyles.finance : channelStyles.default;
    const mdxComponents = {
        // 添加InlineExplanation组件
        InlineExplanation: InlineExplanation,
        BentoGrid: BentoGrid,
        BentoGridItem: BentoGridItem,
        BeforeAfter: BeforeAfter,
        HSBSliders: HSBSliders,
        ColorWheelSteps: ColorWheelSteps,
        RotatableColorWheel: RotatableColorWheel,
        DualTimeline: DualTimeline,
        RAGFlowDiagram: RAGFlowDiagram,
        RAGSidesOverview: RAGSidesOverview,
        SketchyRAGOverview: SketchyRAGOverview,
        Word2VecVectorSpace: Word2VecVectorSpace,
        InContextLearningChart: InContextLearningChart,
        SketchySvg: SketchySvg,
        SketchyLine: SketchyLine,
        SketchyArrow: SketchyArrow,
        SketchyRect: SketchyRect,
        SketchyCircle: SketchyCircle,
        SketchyEllipse: SketchyEllipse,
        SketchyPath: SketchyPath,
        SketchyDashedLine: SketchyDashedLine,
        SketchyText: SketchyText,
        TravelRouteMap: TravelRouteMap,
        CityWalkMap: CityWalkMap,
        h2: ({ children, ...props }) => (
            <h2 className="text-[1.65rem] md:text-[1.85rem] font-bold mt-12 mb-5 leading-snug scroll-mt-28" style={isTechChannel || isLifeChannel ? { color: 'var(--channel-ink)' } : {}} {...props}>
                {children}
            </h2>
        ),
        h3: ({ children, ...props }) => (
            <h3 className="text-[1.25rem] md:text-[1.35rem] font-semibold mt-8 mb-3 leading-snug scroll-mt-28" style={isTechChannel || isLifeChannel ? { color: 'var(--channel-ink)' } : {}} {...props}>
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

    const isRAGPost = slug.join('/') === 'tech/general/from-rag-technique-to-rag-philosophy';
    const columnInfo = getColumnByTags(frontmatter);
    const channelConfig = columnInfo ? CHANNELS_CONFIG[columnInfo.channelKey] : null;
    const columnConfig = columnInfo ? CHANNELS_CONFIG[columnInfo.channelKey]?.columns?.[columnInfo.columnKey] : null;
    const formattedDate = frontmatter.date ? format(parseISO(frontmatter.date), 'yyyy年MM月dd日', { locale: zhCN }) : '未知日期';
    const readingMinutes = estimateReadingMinutes(content);
    const mediaType = isRAGPost
        ? 'interactive'
        : frontmatter.heroVideo || frontmatter.videoUrl
            ? 'video'
            : frontmatter.coverImage
                ? 'image'
                : null;
    const mdxOptions: any = {
        mdxOptions: {
            remarkPlugins: [[remarkGfm, { breaks: true }]],
            rehypePlugins: [
                rehypeSlug,
                [rehypeAutolinkHeadings, {
                    behavior: 'append',
                    properties: { className: ['anchor-link', 'opacity-0', 'group-hover:opacity-100', 'transition-opacity', 'duration-200'] },
                    content: {
                        type: 'element',
                        tagName: 'span',
                        properties: { className: ['inline-block', 'ml-2', 'text-neutral-500'] },
                        children: [{ type: 'text', value: '#' }]
                    }
                }],
                [rehypePrismPlus, { ignoreMissing: true, showLineNumbers: true }],
            ],
        },
    };

    return (
        <div
            className={`min-h-screen ${currentStyle.containerBg}`}
            style={currentStyle.containerStyle}
            {...(isTechChannel && { 'data-tech-page': true })}
            {...(isLifeChannel && { 'data-life-page': true })}
        >
            <div className="pt-20">
                <div className="border-y border-[var(--channel-border,#D8D0C3)]">
                    <div className="mx-auto flex h-16 w-[calc(100vw-2.5rem)] items-center justify-between xl:w-[75vw]">
                        <div className={`flex flex-wrap items-center gap-x-2 gap-y-2 text-sm md:text-base ${currentStyle.headerMeta}`}>
                            <Link href="/blog" className="font-medium text-[var(--channel-ink,#141413)] hover:text-[var(--channel-muted,#68645d)]">博客</Link>
                            {channelConfig && (
                                <>
                                    <span>/</span>
                                    <span>{channelConfig.name}</span>
                                </>
                            )}
                            {columnConfig && (
                                <>
                                    <span>/</span>
                                    <span>{columnConfig.name}</span>
                                </>
                            )}
                        </div>
                        <Link href="/blog" className={`hidden text-sm md:block ${currentStyle.headerMeta} hover:text-[var(--channel-ink,#141413)]`}>
                            返回博客
                        </Link>
                    </div>
                </div>
            </div>

            <main className="mx-auto w-[calc(100vw-2.5rem)] pb-10 pt-12 md:pb-14 md:pt-[9vh] xl:w-[75vw]">
                <div className="mx-auto article-container space-y-20 md:space-y-24 xl:space-y-[12vh]">
                    <section className="xl:min-h-[39vh]">
                        <header className="grid items-start gap-12 xl:grid-cols-12 xl:gap-x-[2.2%]">
                        <div className="max-w-5xl xl:col-span-6 xl:col-start-3">
                            <h1 className={`max-w-[56rem] text-[clamp(3rem,6.4vw,5.6rem)] font-bold mb-0 leading-[0.98] break-words tracking-normal ${currentStyle.headerTitle}`}>
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
                            <InfoItem icon={BookOpen} label="专栏" value={columnConfig?.name || frontmatter.column} />
                            <InfoItem icon={UserRound} label="作者" value={frontmatter.author || '佚名'} />
                            <InfoItem icon={CalendarDays} label="发布" value={formattedDate} />
                            <InfoItem icon={Clock3} label="阅读时间" value={`${readingMinutes} 分钟`} />
                            {mediaType && (
                                <InfoItem
                                    icon={mediaType === 'interactive' ? Map : Newspaper}
                                    label="媒体"
                                    value={mediaType === 'interactive' ? '交互全文地图' : mediaType === 'video' ? '视频' : '图片'}
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
                        <article className="mx-auto w-full min-w-0 xl:col-span-6 xl:col-start-3 xl:mx-0">
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
                                    options={mdxOptions}
                                />
                            </div>

                            <div className="mt-14 pt-8 border-t border-[#D8D0C3] text-center">
                                <Link href="/blog" className={`font-medium ${isFinanceChannel ? 'text-[#506354] hover:text-[#1a1c19]' : isTechChannel || isLifeChannel ? 'text-[#141413] hover:text-[#68645d]' : 'text-blue-400 hover:text-blue-300'}`}>
                                    &larr; 返回博客列表
                                </Link>
                            </div>
                        </article>

                        <aside className="relative hidden xl:col-span-2 xl:col-start-10 xl:block">
                            <div className="sticky top-28 max-h-[calc(100vh-7rem)] overflow-y-auto space-y-4 pr-2">
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
                        </aside>
                    </div>
                </div>
            </main>
        </div>
    );
}
