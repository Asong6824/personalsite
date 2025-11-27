---
title: 项目页面与导航结构说明
date: 2025-11-12
hidden: true
tags: [dev, docs]
---

## 项目结构与页面导航说明

- 技术栈采用 Next.js App Router（`src/app` 目录），所有路由通过文件系统定义，使用动态段 `[param]` 承载路由参数
- 全局布局位于 `src/app/layout.js`，导航与全局样式从此处统一挂载
- 页面主要围绕博客模块构建：频道页 → 专栏页 → 文章详情页；另含首页与开发演示页

## 项目页面清单

- 核心
  - `src/app/layout.js` — 全站根布局，挂载 `Navbar` 和全局样式；组件 `RootLayout` 定义在 `src/app/layout.js:14`
  - `src/app/page.js` — 首页（英雄区、关于我、足迹、活跃天数、最新文章摘要）；入口组件 `HomePage` 在 `src/app/page.js:9`
  - `src/app/blog/page.jsx` — 博客主页，提供频道入口（全屏背景链接）与按年份时间轴聚合；频道入口构建在 `src/app/blog/page.jsx:15-21`，文章链接生成在 `src/app/blog/page.jsx:36-37`
  - `src/app/blog/columns/page.jsx` — 全站专栏聚合页，遍历各频道专栏并统计文章数，链接至具体专栏页；逻辑在 `src/app/blog/columns/page.jsx:9-23`
  - `src/app/blog/tech/page.jsx` — 技术频道页，按频道聚合文章并分发至专栏；入口在 `src/app/blog/tech/page.jsx:11-21`
  - `src/app/blog/life/page.jsx` — 生活频道页；入口在 `src/app/blog/life/page.jsx:11-21`
  - `src/app/blog/finance/page.jsx` — 金融频道页；入口在 `src/app/blog/finance/page.jsx:9-16`
  - `src/app/blog/tech/[columnSlug]/page.jsx` — 技术频道专栏页；静态参数与元数据生成在 `src/app/blog/tech/[columnSlug]/page.jsx:13-22`，渲染入口在 `src/app/blog/tech/[columnSlug]/page.jsx:24-50`
  - `src/app/blog/life/[columnSlug]/page.jsx` — 生活频道专栏页；生成逻辑在 `src/app/blog/life/[columnSlug]/page.jsx:12-22`、渲染在 `src/app/blog/life/[columnSlug]/page.jsx:24-50`
  - `src/app/blog/finance/[columnSlug]/page.jsx` — 金融频道专栏页；生成逻辑在 `src/app/blog/finance/[columnSlug]/page.jsx:12-22`、渲染在 `src/app/blog/finance/[columnSlug]/page.jsx:24-50`
  - `src/app/blog/tech/[columnSlug]/[postSlug]/page.jsx` — 技术频道文章详情；静态参数与元数据在 `src/app/blog/tech/[columnSlug]/[postSlug]/page.jsx:12-22`，渲染在 `src/app/blog/tech/[columnSlug]/[postSlug]/page.jsx:24-60`
  - `src/app/blog/life/[columnSlug]/[postSlug]/page.jsx` — 生活频道文章详情；含标签校验与异常处理，逻辑在 `src/app/blog/life/[columnSlug]/[postSlug]/page.jsx:24-69`
  - `src/app/blog/finance/[columnSlug]/[postSlug]/page.jsx` — 金融频道文章详情；渲染在 `src/app/blog/finance/[columnSlug]/[postSlug]/page.jsx:24-60`

- 辅助
  - `src/app/blog/[slug]/page.jsx` — 通用文章详情（不区分频道/专栏）；静态参数与元数据在 `src/app/blog/[slug]/page.jsx:27-31`、`src/app/blog/[slug]/page.jsx:34-82`；用于 `/blog/<slug>` 的详情展示
  - `src/app/dev/datasets-demo/page.jsx` — 数据演示页（股票对比图），入口在 `src/app/dev/datasets-demo/page.jsx:5-21`

## 页面层级关系

```text
/
├─ src/app/layout.js    # RootLayout（主框架）
├─ src/app/page.js      # 首页（嵌套子页面）
└─ /blog                # 博客主页
   ├─ page.jsx
   ├─ columns/page.jsx  # 全站专栏列表
   ├─ [slug]/page.jsx   # 通用文章详情（非频道/专栏路径）
   ├─ tech
   │  ├─ page.jsx                    # 技术频道页
   │  └─ [columnSlug]
   │     ├─ page.jsx                 # 技术专栏页
   │     └─ [postSlug]/page.jsx      # 技术文章详情
   ├─ life
   │  ├─ page.jsx                    # 生活频道页
   │  └─ [columnSlug]
   │     ├─ page.jsx                 # 生活专栏页
   │     └─ [postSlug]/page.jsx      # 生活文章详情（含标签校验）
   └─ finance
      ├─ page.jsx                    # 金融频道页
      └─ [columnSlug]
         ├─ page.jsx                 # 金融专栏页
         └─ [postSlug]/page.jsx      # 金融文章详情
/dev
└─ datasets-demo/page.jsx            # 演示页
```

- 主框架页面：`src/app/layout.js`
- 嵌套子页面：`src/app/page.js`、`src/app/blog/**/page.jsx` 及各层级动态段页面
- 频道页 → 专栏页 → 文章页 的父子关系通过目录层级天然体现（App Router）

## 跳转逻辑说明

- 导航组件与触发
  - 顶部导航 `Navbar`：`src/components/layout/Navbar.jsx`
    - 链接清单在 `src/components/layout/Navbar.jsx:11-18`：`'/#hero'`、`'/#about'`、`'/#programmer-details'`、`'/#footprints'`、`'/blog'`
    - 触发条件
      - 首页锚点类链接（`type: 'scroll'`）在首页时触发平滑滚动；逻辑在 `src/components/layout/Navbar.jsx:54-69`
      - 非首页点击锚点链接触发页面跳转至 `/` 并定位相应 `#hash`
      - Logo 点击在首页拦截默认导航并滚动至 `#hero`；逻辑在 `src/components/layout/Navbar.jsx:41-51`
    - 页面跳转（`type: 'page'`）直接走 `<Link>` 的客户端导航（例如 `'/blog'`）
  - 首页入口按钮：`src/components/features/AboutMeSection.jsx`
    - 点击行为通过 `RainbowButton` 触发
    - `router.push('/blog/tech')` 与 `router.push('/blog/life')` 跳转频道页；逻辑在 `src/components/features/AboutMeSection.jsx:33-45`
  - 列表/卡片链接
    - 博客主页频道入口与文章时间轴：`src/app/blog/page.jsx:54` 与 `src/app/blog/page.jsx:36-37`，分别跳转至 `/blog/<channel>` 和 `/blog/<channel>/<column>/<slug>`
    - 频道页与专栏页内的“查看全部/阅读更多”链接：`src/components/features/ChannelLayout.jsx:98-121`，跳转至 `/blog/<channel>/<column>`
    - 专栏页文章列表链接：`src/components/features/ColumnLayout.jsx:104`，跳转至 `/blog/<channel>/<column>/<slug>`
    - 文章页返回列表：`src/app/blog/[slug]/page.jsx:235-238` 跳转 `/blog`

- 路由参数传递方式
  - 动态段参数
    - 频道专栏页：`[columnSlug]`（在各频道专栏页 `generateStaticParams` 和 `generateMetadata` 中使用）
      - 技术：`src/app/blog/tech/[columnSlug]/page.jsx:13-22`
      - 生活：`src/app/blog/life/[columnSlug]/page.jsx:13-22`
      - 金融：`src/app/blog/finance/[columnSlug]/page.jsx:13-22`
    - 文章详情页：`[postSlug]` 与所属 `[columnSlug]`
      - 技术：`src/app/blog/tech/[columnSlug]/[postSlug]/page.jsx:18-22`
      - 生活：`src/app/blog/life/[columnSlug]/[postSlug]/page.jsx:18-22`
      - 金融：`src/app/blog/finance/[columnSlug]/[postSlug]/page.jsx:18-22`
    - 通用文章详情：`[slug]`（不区分频道/专栏）：`src/app/blog/[slug]/page.jsx:27-31`
  - 生成策略
    - 静态参数：通过 `generateStaticParams` 基于内容源生成构建时路由参数（见各频道专栏/文章页文件对应段落）
    - 元数据：通过 `generateMetadata` 动态配置 SEO 与 OG 卡片（各文件 18-22 行附近）
  - 传参使用：在页面组件形参中通过 `params` 读取，例如 `FinancePostPage({ params })` 在 `src/app/blog/finance/[columnSlug]/[postSlug]/page.jsx:24-26`

- 异常/权限类跳转处理
  - 404 处理
    - 内容不存在或不匹配时调用 `notFound()`（Next.js 内置）：
      - 通用详情页：`src/app/blog/[slug]/page.jsx:89-92`
      - 频道专栏页：`src/app/blog/*/[columnSlug]/page.jsx:28-31`
      - 频道文章页：`src/app/blog/*/[columnSlug]/[postSlug]/page.jsx:35-37`
      - 生活频道文章页标签校验失败：`src/app/blog/life/[columnSlug]/[postSlug]/page.jsx:44-46`
  - 统一错误/404模板
    - 项目中未定义 `error.{js,jsx}` / `not-found.{js,jsx}`，故采用 Next.js 默认错误与 404 页面
  - 权限控制
    - 未发现认证相关逻辑（无 `next-auth`、`middleware.ts/js`、`getServerSession` 等）

## 补充说明与现状提示

- 路由体系
  - 项目完全基于 App Router（`src/app`），未发现 `pages` 目录或其他前端路由框架（无 `.vue`、SvelteKit 文件）
- 链接一致性
  - `src/components/features/BlogAggregatedView.jsx` 中存在指向 `/blog/all` 的链接（`src/components/features/BlogAggregatedView.jsx:199-204`），但未发现对应页面文件；当前点击可能导致 404
- 页面加载态与体验
  - 未定义 `loading.{js,jsx}` 文件；加载反馈由各组件自行处理或由浏览器默认行为决定

## 快速检索索引

- 根布局与首页
  - `src/app/layout.js:14`
  - `src/app/page.js:9`
- 博客主页与聚合
  - `src/app/blog/page.jsx:15-21`, `src/app/blog/page.jsx:36-37`
  - `src/app/blog/columns/page.jsx:9-23`
- 频道页
  - `src/app/blog/tech/page.jsx:11-21`
  - `src/app/blog/life/page.jsx:11-21`
  - `src/app/blog/finance/page.jsx:9-16`
- 专栏页
  - 技术：`src/app/blog/tech/[columnSlug]/page.jsx:13-22`, `24-50`
  - 生活：`src/app/blog/life/[columnSlug]/page.jsx:12-22`, `24-50`
  - 金融：`src/app/blog/finance/[columnSlug]/page.jsx:12-22`, `24-50`
- 文章页
  - 技术：`src/app/blog/tech/[columnSlug]/[postSlug]/page.jsx:12-22`, `24-60`
  - 生活：`src/app/blog/life/[columnSlug]/[postSlug]/page.jsx:18-22`, `24-69`
  - 金融：`src/app/blog/finance/[columnSlug]/[postSlug]/page.jsx:12-22`, `24-60`
- 通用文章页
  - `src/app/blog/[slug]/page.jsx:27-31`, `34-82`, `85-366`
- 导航与触发
  - Navbar：`src/components/layout/Navbar.jsx:11-18`, `41-51`, `54-69`
  - 首页跳转：`src/components/features/AboutMeSection.jsx:33-45`
  - 频道/专栏/文章链接：`src/components/features/ChannelLayout.jsx:98-121`, `134-172`; `src/components/features/ColumnLayout.jsx:104`
  - 返回博客列表：`src/app/blog/[slug]/page.jsx:235-238`

## 频道-专栏-文章三层结构梳理

- 频道定义与专栏映射
  - 频道与专栏统一在 `src/lib/channels.js:6-70` 配置，键值分别为 `tech`、`life`、`finance`，每个频道内含 `columns`，专栏字段含 `name`、`description`、`tags`、`cover`
  - 标签到频道/专栏的归属推断：频道 `getChannelByTags(postOrTags)` 在 `src/lib/channels.js:77-109`；专栏 `getColumnByTags(postOrTags)` 在 `src/lib/channels.js:116-152`
- 路由对应关系
  - 频道页：`/blog/<channel>`，分别位于 `src/app/blog/tech/page.jsx`、`src/app/blog/life/page.jsx`、`src/app/blog/finance/page.jsx`
  - 专栏页：`/blog/<channel>/<column>`，例如技术专栏页入口在 `src/app/blog/tech/[columnSlug]/page.jsx:24-50`
  - 文章页：`/blog/<channel>/<column>/<slug>`，例如技术文章页入口在 `src/app/blog/tech/[columnSlug]/[postSlug]/page.jsx:24-60`
- 静态参数生成（构建期 SSG）
  - 专栏静态参数：`generateColumnStaticParams(channelKey)` 在 `src/lib/route-utils.js:14-22`
    - 使用位置：`tech` `src/app/blog/tech/[columnSlug]/page.jsx:13-15`；`life` `src/app/blog/life/[columnSlug]/page.jsx:13-16`；`finance` `src/app/blog/finance/[columnSlug]/page.jsx:13-15`
  - 文章静态参数：`generatePostStaticParams(channelKey)` 在 `src/lib/route-utils.js:29-47`
    - 使用位置：`tech` `src/app/blog/tech/[columnSlug]/[postSlug]/page.jsx:13-15`；`life` `src/app/blog/life/[columnSlug]/[postSlug]/page.jsx:13-15`；`finance` `src/app/blog/finance/[columnSlug]/[postSlug]/page.jsx:13-15`
- 元数据（SEO/OG）生成
  - 专栏元数据：`generateColumnMetadata(channelKey, columnSlug, posts)` 在 `src/lib/route-utils.js:56-77`；调用见 `src/app/blog/*/[columnSlug]/page.jsx:18-22`
  - 文章元数据：`generatePostMetadata(post, channelKey, columnSlug)` 在 `src/lib/route-utils.js:86-120`；调用见 `src/app/blog/*/[columnSlug]/[postSlug]/page.jsx:18-22`
- 规范校验与 404
  - 频道/专栏存在性校验：`validateChannelColumn(channelKey, columnSlug)` 在 `src/lib/route-utils.js:128-147`；各专栏页与文章页统一在渲染前调用，失败触发 `notFound()`（例如 `src/app/blog/tech/[columnSlug]/page.jsx:26-31`、`src/app/blog/tech/[columnSlug]/[postSlug]/page.jsx:26-31`）
  - 生活频道额外标签校验：文章标签需命中专栏标签集合，否则 404；逻辑在 `src/app/blog/life/[columnSlug]/[postSlug]/page.jsx:39-46`

## 文章管理方式

- 内容存储
  - 存储路径：`content/blog`（MD/MDX）；目录声明在 `src/lib/post.js:8`
  - 解析方式：使用 `fs + gray-matter` 手动解析 frontmatter 与正文，不使用 contentlayer；见 `src/lib/post.js:2-4`, `src/lib/post.js:36-43`, `src/lib/post.js:124-136`
- 加载与聚合
  - 全量加载与排序：`getSortedPostsData()` 在 `src/lib/post.js:14-68`，过滤 `hidden`，置顶 `pinned` 优先，再按 `date` 降序
  - 单篇读取：`getPostData(slug)` 在 `src/lib/post.js:106-140`（支持 `.mdx`/`.md`，返回 `{ frontmatter, content }`）
  - 频道聚合：`getPostsByChannel(channelKey)` 在 `src/lib/post.js:159-167`, `174`
  - 专栏聚合：`getPostsByColumn(channelKey, columnKey)` 在 `src/lib/post.js:182-190`, `198`
  - 唯一标签集：`getAllUniqueTags()` 在 `src/lib/post.js:200-213`
- 分类策略（frontmatter 与标签）
  - 推荐在内容文件中显式声明 `channel` 与 `column`，示例：技术文章 `content/blog/efficient-go-cpu-macro.mdx:7-10`；生活文章 `content/blog/japan-hokuriku.mdx:7-11`
  - 若未显式声明，系统回退基于 `tags` 匹配频道与专栏；函数在 `src/lib/channels.js:77-109`, `116-152`
  - 配置校验器：频道/专栏结构与存在性校验在 `src/lib/config-validator.js:89-107`；开发期自动输出校验摘要在 `src/lib/config-validator.js:239-266`（由 `src/lib/channels.js:165-166` 触发）
- frontmatter 字段规范（示例）
  - 必填/常用：`title`、`date`、`slug`、`author`、`tags`、`excerpt`、`coverImage`（示例见 `content/blog/efficient-go-cpu-macro.mdx:1-11`、`content/blog/japan-hokuriku.mdx:1-11`）
  - 分类：`channel`、`column`（显式归类）
  - 可选控制：`pinned`（置顶排序，见 `src/lib/post.js:47-67`）、`hidden`（过滤隐藏，见 `src/lib/post.js:45`, `127-131`）、`music`（用于详情页右侧播放器，见 `src/app/blog/[slug]/page.jsx:244-258`）
- 通用文章详情（不区分频道/专栏）
  - 路由：`/blog/[slug]`，静态参数来自 `getAllPostSlugs()`（`src/lib/post.js:81-96`）；页面在 `src/app/blog/[slug]/page.jsx:25-31`
  - 元数据：基于 `getPostData(slug)` 生成，见 `src/app/blog/[slug]/page.jsx:33-82`

## 内容与配置（检索补充）

- `src/lib/post.js:8`, `14-68`, `81-96`, `106-140`, `159-167`, `182-190`, `200-213`
- `src/lib/channels.js:6-70`, `77-109`, `116-152`, `165-166`
- `src/lib/route-utils.js:14-22`, `29-47`, `56-77`, `86-120`, `128-147`
- `src/lib/config-validator.js:89-107`, `239-266`

