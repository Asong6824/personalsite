# MDX 渲染链路

本文记录当前文章详情页的 MDX 渲染逻辑。组件用法速查仍以 `docs/components.md` 为准；本文只描述一篇 `content/blog/**/*.mdx` 如何被读取、编译、注入组件并进入页面布局。

## 当前入口

主入口是 `src/app/blog/[...slug]/page.tsx`。

该文件同时负责：

- `generateStaticParams()`：读取全部文章 slug，供 Next.js 静态生成文章详情页。
- `generateMetadata()`：读取文章 frontmatter，生成页面 `title`、`description` 和 Open Graph 图片。
- `PostPage()`：读取正文与 frontmatter，组合文章头图、正文、音乐播放器和目录。

文章渲染相关的可复用配置已从路由文件拆出：

- `src/components/article/article-channel-styles.ts`：频道级文章样式 token。
- `src/components/article/mdx-components.tsx`：MDX 组件注册表和标题覆盖。
- `src/components/article/ArticleInfoItem.tsx`：文章头部元信息项。
- `src/components/article/ArticleRecommendations.tsx`：文章底部“接下来阅读”推荐区块。
- `src/lib/article/mdx-options.ts`：`remark` / `rehype` 插件配置。
- `src/lib/article/recommendations.ts`：从 frontmatter `nextReads` 解析推荐文章摘要。
- `src/lib/article/rendering.ts`：阅读时间、顶部媒体类型、媒体标签和音乐播放列表生成。

`src/components/features/PostLayout.tsx` 也存在 `MDXRemote` 用法，但当前文章详情路由没有挂载它。它更像旧版/备用文章布局，不应作为现行 MDX 渲染链路的事实来源。

## 从文件到页面

### 1. 构建文章索引

`src/lib/post-index.ts` 扫描 `content/blog/**/*.mdx`，用 `gray-matter` 读取 frontmatter，并写入 `src/data/posts/index.json`。

索引项包含：

- `slug`：默认来自文件路径，frontmatter 的 `slug` 只覆盖最后一段文件名。
- `rel`：相对 `content/blog/` 的 MDX 文件路径。
- `data`：frontmatter 原始数据。

开发环境下，`getOrBuildPostsIndex()` 会检查文件集合和文件修改时间，发现新增、删除、改名或内容更新时自动重建索引。生产环境信任构建期生成的索引。

### 2. 路由参数映射到 MDX 文件

`generateStaticParams()` 调用 `getAllPostSlugs()`，把索引中的 `tech/general/post` 转成 App Router 需要的：

```ts
{ slug: ["tech", "general", "post"] }
```

页面请求进入 `PostPage({ params })` 后，会把数组重新拼成字符串：

```ts
slug.join("/")
```

然后调用 `getPostData()`。

### 3. 读取正文与 frontmatter

`src/lib/post.ts` 的 `getPostData(slug)` 会通过 `findPostPathBySlug(slug)` 在索引中找到实际文件，再读取完整 MDX 文件。

读取后再次用 `gray-matter` 拆分：

- `frontmatter`：标题、日期、频道、专栏、摘要、封面、音乐等元数据。
- `content`：去掉 frontmatter 后的 MDX 正文字符串。

如果文章 frontmatter 中 `hidden: true`，`getPostData()` 返回 `null`，文章详情页会走 `notFound()`。

### 4. 解析推荐阅读

文章可在 frontmatter 中配置 `nextReads`：

```yaml
nextReads:
  - tech/ai-engineering/pi-agent
  - slug: creative/product/notion-zen
    reason: 从产品体验角度延伸阅读
```

`PostPage()` 会调用 `getArticleRecommendations(frontmatter, articleSlug)`，用推荐项中的完整文章 slug 查询索引摘要。推荐项允许省略 `/blog/` 前缀；渲染链接统一使用 `/blog/${recommendation.slug}`。找不到的 slug、隐藏文章和当前文章自身会被跳过。

## 页面渲染层

### 频道样式

`PostPage()` 根据 `frontmatter.channel` 调用 `getArticleChannelStyle()` 判断频道：

- `tech`
- `life`
- `creative`
- `finance`
- fallback `default`

频道样式集中在 `src/components/article/article-channel-styles.ts`，控制页面背景、正文 prose 颜色、标题颜色、元信息颜色和标签颜色。

### 文章头部

文章头部使用 frontmatter 生成：

- 标题：`frontmatter.title`
- 摘要：`frontmatter.excerpt`
- 标签：`frontmatter.tags`
- 专栏：通过 `CHANNELS_CONFIG[frontmatter.channel].columns[frontmatter.column]` 查找展示名
- 作者：`frontmatter.author`，为空时显示 `佚名`
- 发布日期：`frontmatter.date`，用 `date-fns` 格式化为 `yyyy年MM月dd日`
- 阅读时间：由正文估算，先剔除代码块和 HTML 标签，再按约 550 字/分钟计算

### 顶部媒体区

正文前的顶部媒体区由 `getArticleMediaType()` 决定：

- 特定 RAG 文章 `tech/general/from-rag-technique-to-rag-philosophy`：显示 `SketchyRAGOverview` 交互概览。
- 有 `frontmatter.heroVideo` 或 `frontmatter.videoUrl`：显示 iframe 视频。
- 有 `frontmatter.coverImage`：显示 `next/image` 封面图。
- 都没有：不渲染顶部媒体区。

## MDXRemote 配置

当前使用 `next-mdx-remote/rsc`：

```tsx
<MDXRemote
  source={content}
  components={mdxComponents}
  options={mdxOptions}
/>
```

这里的 `source` 是 `getPostData()` 读取出的 MDX 正文字符串。MDX 编译和渲染发生在服务端组件链路中；被注册的客户端组件会按 React/Next.js 规则在客户端 hydrate。

### remark / rehype 插件

`src/lib/article/mdx-options.ts` 当前配置：

- `remark-gfm`，并设置 `breaks: true`，支持表格、删除线、任务列表等 GFM 能力，并把换行按硬换行处理。
- `rehype-slug`，给标题生成 `id`。
- `rehype-autolink-headings`，给标题追加 `#` 锚点。
- `rehype-prism-plus`，启用代码高亮，配置 `ignoreMissing: true` 和 `showLineNumbers: true`。

标题锚点会追加到正文标题中，因此 `TableOfContents` 在客户端读取标题文本时会去掉末尾的 `#`。

### 注册给 MDX 的组件

`src/components/article/mdx-components.tsx` 中的 `createArticleMdxComponents()` 是文章正文可直接使用的组件白名单。当前包括：

- 通用组件：`InlineExplanation`、`BentoGrid`、`BentoGridItem`、`BeforeAfter`、`Highlighter`
- 色彩组件：`HSBSliders`、`ColorWheelSteps`、`RotatableColorWheel`
- RAG 组件：`DualTimeline`、`RAGFlowDiagram`、`RAGSidesOverview`、`SketchyRAGOverview`、`Word2VecVectorSpace`、`InContextLearningChart`
- Sketchy 基础图形：`SketchySvg`、`SketchyLine`、`SketchyArrow`、`SketchyRect`、`SketchyCircle`、`SketchyEllipse`、`SketchyPath`、`SketchyDashedLine`、`SketchyText`
- 旅行地图：`TravelRouteMap`、`CityWalkMap`
- Agent 组件：`FunctionCallingSteps`
- 标题覆盖：`h2`、`h3`

新增文章组件时，必须先在 `src/components/article/mdx-components.tsx` 中导入并加入 `createArticleMdxComponents()` 返回值，MDX 正文才可以直接写 `<ComponentName />`。

## 自动渲染但不是 MDX 标签的组件

### 目录

`TableOfContents` 位于右侧 sticky aside，只在 `xl` 及以上视口显示。

它是客户端组件，会在浏览器中查询：

```css
article .prose h2,
article .prose h3,
article .prose h4
```

因此目录依赖 MDX 编译后真实渲染出的标题节点，以及 `rehype-slug` 生成的标题 `id`。它不是 MDX 标签，文章中不需要写 `<TableOfContents />`。

### 音乐播放器

`MusicPlayer` 同样位于右侧 aside，但技术频道文章不显示。

播放列表来源：

- `frontmatter.music` 为数组：每个 URL 生成一首“背景音乐 N”。
- `frontmatter.music` 为字符串：生成一首“背景音乐 1”。
- 没有 `music`：使用 `defaultPlaylist`。

它也不是 MDX 标签。

## 重要边界

- `content/blog/` 只放文章 MDX 源文件。
- `content/components/` 放文章可视化/交互组件，但不会自动被 MDX 发现；必须在文章页入口显式注册。
- `@content/*` 在 `tsconfig.json` 中映射到 `./content/*`，用于在文章页入口导入 `content/components/*`。
- 浏览器 API、地图、播放器、交互动画等必须放在 `"use client"` 组件内；文章页本身是服务端组件。
- `Mermaid` 组件虽然存在于 `src/components/ui/Mermaid.tsx`，但当前没有注册到 `mdxComponents`，不能直接在 MDX 中使用。
- `TableOfContents` 与 `MusicPlayer` 是页面布局自动插入的能力，不应写入文章正文。

## 相关文档

- `docs/content-system.md`：MDX 文件组织、frontmatter、slug、索引规则。
- `docs/components.md`：文章可用组件清单与用法示例。
- `docs/routing.md`：`/blog/[...slug]` 与频道/专栏路由的匹配关系。
