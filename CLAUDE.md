# CLAUDE.md

本文件为 AI 编码助手提供项目背景、架构说明与开发约定。阅读者应对本项目一无所知；所有信息均基于实际代码与配置，不做假设。

---

## 项目概述

这是一个基于 **Next.js 15 (App Router)** 构建的个人博客/主页项目，站点标题为「且听松涛」。内容以 **MDX** 文件形式组织，支持服务端渲染。站点包含多个内容频道（技术、创作、生活、金融），每个频道下设专栏，并集成了股票行情对比可视化、3D 组件、地图时间线等富交互功能。

---

## 技术栈

| 层级 | 技术 |
|------|------|
| 框架 | Next.js 15 (App Router) |
| 语言 | JavaScript (JSX)，少量 TypeScript 类型定义 |
| UI 库 | React 19 |
| 样式 | Tailwind CSS v4 + `@tailwindcss/typography` |
| 主题 | `next-themes`（暗色/亮色切换） |
| 字体 | `next/font/google`（Inter、Newsreader） |
| MDX 渲染 | `next-mdx-remote/rsc` |
| 动画 | Framer Motion / GSAP / `@react-spring/web` / `fullpage.js` |
| 3D | Three.js (`@react-three/fiber`, `@react-three/drei`) |
| 图表 | ECharts / `@amcharts/amcharts5` / `three-globe` |
| 代码高亮 | `rehype-prism-plus` + `prism-themes` |
| 组件库 | shadcn/ui (style: new-york, baseColor: neutral) |
| 图标 | `lucide-react` / `@radix-ui/react-icons` / `@tabler/icons-react` |
| Lint | ESLint 9 + `next/core-web-vitals` |

---

## 项目结构

```
/
├── content/
│   ├── blog/                  # MDX 博客内容源文件
│   │   ├── tech/              # 技术频道文章
│   │   ├── life/              # 生活频道文章
│   │   ├── finance/           # 金融频道文章
│   │   └── create/            # 创作频道文章
│   └── components/            # 文章交互组件（按主题组织，见下方 MDX Component Organization）
│       ├── color/             # 色彩工具组件（复用）
│       └── rag/               # RAG 文章专属组件
├── src/
│   ├── app/                   # Next.js App Router 页面与 API
│   │   ├── layout.js          # 根布局（Navbar、全局样式、字体）
│   │   ├── page.js            # 首页
│   │   ├── blog/              # 博客路由
│   │   │   ├── page.jsx       # 博客主页
│   │   │   ├── [...slug]/page.jsx   # 文章详情页（通用动态路由）
│   │   │   ├── tech/          # 技术频道页与专栏页
│   │   │   ├── life/          # 生活频道页与专栏页
│   │   │   ├── finance/       # 金融频道页与专栏页
│   │   │   └── create/        # 创作频道页
│   │   └── api/               # API 路由
│   │       ├── stocks/        # 股票数据接口
│   │       ├── datasets/      # 数据集接口
│   │       └── notion/        # Notion 集成接口
│   ├── components/
│   │   ├── features/          # 页面级区块组件（HeroSection、PostLayout 等）
│   │   ├── ui/                # 可复用 UI 组件（bento-grid、MusicPlayer 等）
│   │   ├── finance/           # 金融频道专用组件（TempoHero、TempoGrid、DataWall）
│   │   ├── layout/            # 布局组件（Navbar）
│   │   ├── magicui/           # 特效组件（Highlighter 等）
│   │   └── debug/             # 调试辅助组件（PerformanceMonitor）
│   ├── lib/                   # 核心逻辑与工具
│   │   ├── post.js            # 文章数据读取（带缓存）
│   │   ├── post-index.js      # 文章索引构建与维护
│   │   ├── channels.js        # 频道/专栏配置定义
│   │   ├── cache.js           # 通用缓存封装
│   │   ├── route-utils.js     # 路由辅助函数
│   │   ├── seo-utils.js       # SEO 工具函数
│   │   ├── scrollUtils.js     # 滚动行为工具
│   │   ├── utils.js           # 通用工具函数
│   │   ├── config-validator.js# 配置校验（开发环境）
│   │   ├── stocks/            # 股票数据多提供商架构
│   │   └── datasets/          # 数据集存储与查询
│   ├── data/
│   │   ├── posts/index.json   # 文章索引（构建时生成）
│   │   ├── datasets/          # 数据集 JSON 文件
│   │   ├── notion/            # Notion 相关数据
│   │   └── stocks/            # 股票数据缓存
│   └── hooks/                 # React Hooks（极少，目前仅有 use-outside-click）
├── scripts/                   # 构建与数据摄入脚本
│   ├── build-posts-index.mjs  # 构建文章索引
│   ├── ingest-stocks.mjs      # 股票数据摄入
│   └── ingest-datasets.mjs    # 数据集摄入
├── public/                    # 静态资源（图片、SVG、视频）
├── dev-docs/                  # 开发文档（功能设计、测试用例等）
└── next.config.mjs            # Next.js 配置
```

---

## 构建与运行命令

```bash
# 开发服务器（自动先执行 build-posts-index.mjs）
npm run dev

# 生产构建（自动先执行 build-posts-index.mjs）
npm run build

# 启动生产服务器
npm run start

# 代码检查
npm run lint

# 股票数据摄入（需配置 API Key）
npm run ingest:stocks
```

> **注意**：`predev` 与 `prebuild` 钩子会自动运行 `scripts/build-posts-index.mjs`，无需手动执行。该脚本扫描 `content/blog/` 下的所有 `.mdx` 文件并生成 `src/data/posts/index.json`。

---

## 内容系统

### MDX 文件组织

- 所有博客文章存放于 `content/blog/`，按频道/专栏用子目录组织。
- **文件路径即 slug（默认可被覆盖）**：`content/blog/life/japan/kyoto.mdx` → slug `life/japan/kyoto`。
- **Frontmatter 中的 `slug` 字段现在真正生效**：如果提供了 `slug`，它会**覆盖文件名部分**作为 URL 的最后一段，目录结构保持不变。例如 `content/blog/tech/general/post.mdx` 中 `slug: "custom"` → URL `/blog/tech/general/custom`。`slug` 不能包含 `/`、`.` 等路径分隔符或遍历字符。
- 通用动态路由 `src/app/blog/[...slug]/page.jsx` 捕获所有文章详情页。

### 文件路径 → URL 映射规则

| 文件路径 | frontmatter slug | 索引 slug | 访问 URL |
|---------|-----------------|-----------|---------|
| `content/blog/tech/general/my-post.mdx` | — | `tech/general/my-post` | `/blog/tech/general/my-post` |
| `content/blog/tech/general/post.mdx` | `custom` | `tech/general/custom` | `/blog/tech/general/custom` |
| `content/blog/life/japan/kyoto.mdx` | — | `life/japan/kyoto` | `/blog/life/japan/kyoto` |
| `content/blog/hello-world.mdx` | — | `hello-world` | `/blog/hello-world` |

**关键注意**：不要将文章放在和频道/专栏路由同名的目录结构中，除非该路径确实是你期望的 URL。例如 `content/blog/tech/general/post.mdx` 的 URL 是 `/blog/tech/general/post`，这是合法的，因为专栏路由 `/blog/tech/[columnSlug]` 的 `[columnSlug]` 在 App Router 中**只匹配单个路径段**，不会拦截多段路径。

### Frontmatter 规范

```yaml
---
title: string               # 文章标题（必填）
date: string (YYYY-MM-DD)   # 发布日期（必填）
author: string              # 作者名
tags: string[]              # 标签数组，用于频道/专栏归类
excerpt: string             # 摘要
coverImage: string          # 封面图 URL
pinned: boolean             # 可选，置顶文章（排序优先）
channel: string             # 可选，显式指定频道（tech/life/finance/create）
column: string              # 可选，显式指定专栏
columnSlug: string          # 可选，显式指定专栏 slug
music: string | string[]    # 可选，背景音乐 URL（数组支持多首）
hidden: boolean             # 设为 true 则文章不参与索引与列表展示
---
```

### 频道与专栏配置

`src/lib/channels.js` 中定义 `CHANNELS_CONFIG`，包含以下频道：

- **tech**（技术）：Golang 精进之路、通用技术、产品设计、设计美学
- **life**（生活）：日本行纪、年度总结、杂记
- **finance**（金融）：财经投资
- **create**（创作）：无固定专栏

每篇文章的频道与专栏归属逻辑：优先使用 frontmatter 中的 `channel`/`column` 字段，否则通过 `tags` 匹配专栏配置中的 `tags` 进行自动归类。

### 文章索引

- `src/lib/post-index.js` 负责扫描文件系统、解析 frontmatter、排序（置顶优先，其次按日期降序）。
- 索引写入 `src/data/posts/index.json`，同时在内存中缓存（`_memIndex`），避免开发时重复磁盘 IO。
- `src/lib/post.js` 提供带缓存的文章读取接口（默认 10 分钟 TTL）。
- **索引重建策略**：开发环境下，`getOrBuildPostsIndex()` 会对比磁盘文件集合与索引中的 `rel` 字段集合，任一方向不一致（新增、删除、改名）都会触发自动重建。生产环境信任构建时生成的索引。

---

## 路由架构

| 路由 | 说明 |
|------|------|
| `/` | 首页（英雄区、关于我、足迹、活跃天数、最新文章） |
| `/blog` | 博客主页（频道入口 + 按年份时间轴聚合） |
| `/blog/columns` | 全站专栏聚合页 |
| `/blog/tech` | 技术频道页 |
| `/blog/tech/[columnSlug]` | 技术频道专栏页（`[columnSlug]` 只匹配**单个**路径段） |
| `/blog/life` | 生活频道页 |
| `/blog/life/[columnSlug]` | 生活频道专栏页（`[columnSlug]` 只匹配**单个**路径段） |
| `/blog/finance` | 金融频道页 |
| `/blog/finance/[columnSlug]` | 金融频道专栏页（`[columnSlug]` 只匹配**单个**路径段） |
| `/blog/create` | 创作频道页 |
| `/blog/create/[columnSlug]` | 创作频道专栏页 |
| `/blog/[...slug]` | 文章详情页（通用，匹配一个或多个路径段） |

> 注：`/blog/tech/design` 等路径由动态路由 `[columnSlug]` 统一处理，不再使用独立的固定路由文件。

**路由优先级说明**：在 Next.js App Router 中，`/blog/tech/[columnSlug]` 的 `[columnSlug]` 只能匹配单个路径段（如 `/blog/tech/go`），无法匹配 `/blog/tech/go/something`。因此 `/blog/tech/general/my-post` 这类多段路径会正确落入 `/blog/[...slug]` 文章详情页，而不会与专栏路由冲突。
| `/api/stocks` | 股票对比数据 API |
| `/api/datasets` | 数据集列表与详情 API |
| `/api/notion/...` | Notion 集成 API |

---

## 组件组织

- **`src/components/features/`**：页面级区块，如 `HeroSection`、`BlogAggregatedView`、`PostLayout`、`ChannelLayout`、`StockComparisonChart`、`TripRouteChart`。
- **`src/components/ui/`**：通用 UI 组件，如 `bento-grid`、`MusicPlayer`、`TableOfContents`、`BeforeAfter`、`Mermaid`、`globe`。
- **`src/components/finance/`**：金融频道专属大型组件，如 `TempoHero`、`TempoGrid`、`DataWall`。
- **`src/components/magicui/`**：特效/装饰性组件，如 `Highlighter`。
- **`content/components/`**：文章交互组件（可视化、图表、交互演示），按主题组织。与 `src/components/ui/` 的语义边界：`ui/` 是通用 UI 原语，`content/components/` 是领域知识可视化。见下方 MDX Component Organization。

### MDX 自定义组件

`src/app/blog/[...slug]/page.jsx` 中通过 `next-mdx-remote/rsc` 注入自定义组件，供文章直接使用：

- `InlineExplanation` — 行内解释提示
- `BentoGrid` / `BentoGridItem` — 网格布局
- `BeforeAfter` — 前后对比滑块
- `Highlighter` — 文本高亮特效
- `HSBSliders` / `ColorWheelSteps` / `RotatableColorWheel` — 色彩工具（位于 `content/components/color/`）
- `DualTimeline` / `RAGFlowDiagram` — RAG 专用交互组件（位于 `content/components/rag/`）

### MDX Component Organization (A+B Hybrid)

文章专属交互组件（图表、可视化、交互演示）与站点 UI 组件分开放置，避免内容增长后产生孤儿组件和耦合问题。

**原则：**
- 预计被 **2+ 篇文章复用** → `content/components/{topic}/`
  - 例：`content/components/color/HSBSliders.jsx`（被 create 和 tech 两篇文章共用）
- **严格单篇专属**且不可能复用 → `content/blog/{slug}/components/`
  - （需 `page.jsx` 支持动态加载；当前尚未实现，暂放 `content/components/{topic}/`）

**理由：** 文章组件与 UI 原语生命周期不同。文章归档时，其组件应一并消失。`content/` 与 `src/components/` 的物理边界使这一关系显性化。

**路径别名：** `jsconfig.json` 中 `@content/*` 映射到 `./content/*`。在 `page.jsx` 中导入：
```js
import { DualTimeline } from '@content/components/rag/DualTimeline';
```

---

## 样式约定

- 使用 **Tailwind CSS v4**，配置在 `src/app/globals.css` 中通过 `@import "tailwindcss"` 引入。
- 启用 `@tailwindcss/typography` 处理 Markdown/MDX 的 `prose` 样式。
- 导入 `tw-animate-css` 与 `fullpage.js/dist/fullpage.css`。
- 暗色模式由 `next-themes` 管理，根元素带 `suppressHydrationWarning`。
- 频道级自定义 prose 样式：技术频道使用暖色调（earth tones），其他频道使用默认蓝色系。
- MUJI 风格主题变量定义在 `globals.css` 的 `.theme-muji` 作用域内，专用于生活频道「日本」专栏。

---

## 数据系统

### 股票数据

`src/lib/stocks/` 采用多提供商架构：

- `fetch.js` — 入口，负责路由到不同提供商、缓存、降级处理。
- `providers/alpha.js` — Alpha Vantage（需 `ALPHA_VANTAGE_API_KEY`）。
- `providers/yahoo.js` — Yahoo Finance（需 `RAPIDAPI_KEY`）。
- `providers/mock.js` — 降级 mock 数据（无 API Key 时自动回退）。
- `store.js` — 本地缓存读写（基于存储 key）。

### 数据集

- 存储在 `src/data/datasets/<id>.json`。
- 索引文件 `src/data/datasets/index.json`。
- 支持时间序列（`series[].points[]`）与分类（`items[]`）两种结构。
- API 路由提供列表过滤、详情查询与点位追加。

### Notion 集成

- `src/app/api/notion/` 提供 Notion 数据查询接口。
- 使用 `@notionhq/client` 作为官方 SDK。

---

## 开发约定

### 代码风格

- 使用 JavaScript (ES Module) 编写，文件扩展名通常为 `.js` / `.jsx`。
- 路径别名：`@/*` 映射到 `./src/*`，`@content/*` 映射到 `./content/*`（`jsconfig.json` 配置）。
- ESLint 配置为 `next/core-web-vitals` Flat Config 格式（`eslint.config.mjs`）。
- 组件优先使用函数组件，Server Component 为默认；需要客户端交互时显式添加 `"use client"`。
- 服务端数据获取函数使用 `async/await`，页面级组件通常为 `async`。

### 缓存策略

- 文章索引与文章列表使用内存缓存 + 文件索引，避免频繁读取磁盘。
- 股票 API 接口设置 `Cache-Control: public, s-maxage=300, stale-while-revalidate=86400`。
- 数据集 API 同样使用服务端缓存 + SWR 策略。

### 图片与媒体

- `next.config.mjs` 中配置了以下远程图片域名白名单：
  - `blog-assets-asong.tos-cn-beijing.volces.com`
  - `p1-juejin.byteimg.com`
  - `p3-juejin.byteimg.com`
  - `p6-juejin.byteimg.com`
  - `p9-juejin.byteimg.com`
- 本地静态资源存放于 `public/`。

---

## 环境变量

项目使用 `.env.local` 管理私有环境变量。常见需要配置的变量包括：

| 变量名 | 用途 |
|--------|------|
| `ALPHA_VANTAGE_API_KEY` | Alpha Vantage 股票数据 API |
| `RAPIDAPI_KEY` | RapidAPI（Yahoo Finance）股票数据 |
| `NOTION_TOKEN` | Notion 集成 Token |

> 当前仓库中没有 `.env.local.example` 文件，添加新环境变量时请在文档（如本文件或相关 dev-docs）中同步说明。

---

## 部署

- 项目为标准 Next.js 应用，推荐使用 **Vercel** 部署。
- 构建时 `prebuild` 会自动生成文章索引，确保 MDX 文件变更后被正确收录。
- 若使用静态导出（`output: 'export'`），需在 `next.config.mjs` 中开启并确保所有动态路由已预渲染。

---

## 测试

当前项目没有自动化测试套件（无 Jest/Vitest/Playwright 配置）。`dev-docs/test-cases.md` 中记录了手动测试清单，覆盖以下方面：

- 全局导航与布局（Navbar、Footer）
- 首页各区块（Hero、About Me、Footprints、Active Days）
- 博客列表与文章详情
- 频道页与专栏页
- 股票对比图表交互
- 响应式布局

---

## 关键文件速查

| 文件 | 职责 |
|------|------|
| `src/lib/channels.js` | 频道/专栏定义与文章归类逻辑 |
| `src/lib/post-index.js` | 文章索引构建与维护（含 dev 环境 mtime 自动检测） |
| `src/lib/post.js` | 文章数据读取（dev 环境禁用缓存） |
| `src/lib/cache.js` | 内存缓存封装（生产环境使用，dev 环境被旁路） |
| `src/app/blog/[...slug]/page.jsx` | 文章详情页渲染器 |
| `src/app/blog/page.jsx` | 博客主页 |
| `scripts/build-posts-index.mjs` | 索引构建脚本 |
| `src/lib/stocks/fetch.js` | 股票数据统一入口 |
| `src/app/globals.css` | 全局样式与 Tailwind 导入 |
| `next.config.mjs` | Next.js 配置（含图片域名白名单） |

---

## 开发注意事项

1. **修改 MDX 文件后无需手动重建索引**：`npm run dev` 的 `predev` 钩子会自动处理；开发环境下索引会检测文件 mtime 变化并自动重建。
2. **frontmatter 中的 `slug` 字段现在决定 URL 最后一段**：`slug` 会覆盖文件名作为访问路径的最后一段（目录结构保持不变）。`slug` 不能包含 `/`、`.` 等非法字符。
3. **新增专栏/频道**：需同步修改 `src/lib/channels.js`，并视情况创建对应路由目录与页面组件。索引构建脚本会自动检测文章路径是否与专栏路由冲突。
4. **MDX 组件注册**：新增文章交互组件时，先判断复用范围。复用组件放 `content/components/{topic}/`，在 `page.jsx` 中用 `@content/components/...` 导入注册；单篇专属组件可放文章目录 `content/blog/{slug}/components/`（需动态加载机制支持，目前暂未实现）。
5. **客户端组件隔离**：涉及浏览器 API（如 `window`、`document`、Three.js、amCharts）的组件需标记 `"use client"`，并在必要时使用动态 `import()` 避免 SSR 报错。
6. **避免在 Server Component 中直接引用客户端库**：如 `fullpage.js`、`leva`、`three` 等应仅在 Client Component 内部使用。
7. **Dev 环境下缓存已旁路**：开发时修改文章内容或 frontmatter 后刷新页面即可看到最新效果，无需等待缓存过期或重启服务。

---

## 架构文档同步原则

每次完成代码改动后，主动评估改动性质：

| 需要提醒更新文档 | 无需提醒（现有架构增量） |
|---|---|
| 新增目录结构或组织约定 | 在已有目录下新增普通文件 |
| 新增 path alias / 构建配置 | 修改现有组件的内部实现 |
| 新增开发流程或协作规范 | bug 修复、样式调整、内容更新 |
| 改变组件/文件的职责边界 | 复用现有模式的新增功能 |

若属于左侧，主动询问用户："这个改动涉及架构层面的调整，是否需要同步更新 CLAUDE.md / AGENTS.md？"

---

## 架构反思与优化建议

### 已实施的优化

1. **索引自动刷新（基于 mtime）**：`post-index.js` 在开发环境下会检查最新文件的修改时间是否晚于索引构建时间，内容或 frontmatter 修改后会自动重建索引。
2. **开发环境禁用数据缓存**：`post.js` 中所有文章读取函数在 `NODE_ENV === 'development'` 时直接执行原始函数，绕过 `MemoryCache`，确保修改立即可见。
3. **索引集合一致性校验**：`post-index.js` 对比磁盘文件集合与索引中的 `rel` 集合，新增/删除/重命名都会触发重建（解决了"总数不变但实际文件已换"的幽灵索引问题）。
4. **frontmatter `slug` 真正生效**：`post-index.js` 在构建索引时，若 frontmatter 中提供了 `slug`，会用它覆盖文件名部分作为 URL 最后一段（目录结构保留）。现有文章不受影响（它们的 `slug` 与文件名一致）。
5. **路由冲突检测**：`scripts/build-posts-index.mjs` 在构建索引后自动扫描，如果某篇文章的 slug 恰好等于某个频道/专栏路由（2 段路径），输出警告。
6. **删除 `tech/design` 固定路由**：移除了 `src/app/blog/tech/design/page.jsx`，统一由动态路由 `tech/[columnSlug]/page.jsx` 处理，消除了代码重复和路由拦截问题。
7. **修复专栏页文章链接 Bug**：`ColumnLayout` 和 `JapanColumnLayout` 中文章链接从 `/blog/${channel}/${column}/${post.slug}` 修正为 `/blog/${post.slug}`，解决了路径重复导致的 404。

### 现有架构的深层约束

**文件路径即 slug（默认可被 frontmatter 覆盖）**：
- 优点：简单直观，文件系统即真相源；同时 frontmatter `slug` 提供了覆盖文件名部分的灵活性，兼顾了组织性和 URL 定制能力。
- 缺点：目录结构部分仍受限于文件系统命名（不能含大写、空格、中文等）。对于需要完全自定义 URL 的场景（如改整个路径），当前机制仍然不够灵活。

**频道/专栏/文章的三层架构与路由并存**：
- 文章路由 `/blog/[...slug]` 与专栏路由 `/blog/tech/[columnSlug]` 是**并行而非嵌套**的，文章详情页通过 catch-all "兜底" 而非通过专栏路由渲染。
- 当前 `[columnSlug]` 只匹配单段路径，因此文章的多段路径（如 `/blog/tech/general/my-post`）能正确落入文章路由。
- **潜在冲突**：如果创建 2 段路径的文章（如 `content/blog/life/japan.mdx`），其 URL `/blog/life/japan` 会被专栏路由拦截。索引构建脚本现在会自动检测并警告此类冲突。

### 未来可考虑的方向

| 方向 | 说明 | 状态 |
|------|------|------|
| **frontmatter `slug` 真正生效** | 已实施。`slug` 现在覆盖文件名作为 URL 最后一段，保留目录结构。 | ✅ 已完成 |
| **路由冲突检测** | 已实施。`build-posts-index.mjs` 自动检测文章路径与专栏路由的冲突。 | ✅ 已完成 |
| **删除 `tech/design` 固定路由** | 已实施。统一由动态路由处理，消除代码重复。 | ✅ 已完成 |
| **修复专栏页文章链接** | 已实施。`ColumnLayout` 和 `JapanColumnLayout` 的链接已修正。 | ✅ 已完成 |
| **开发环境索引自动刷新** | 已实施。基于 mtime + 文件集合双重检测。 | ✅ 已完成 |
| **开发环境禁用数据缓存** | 已实施。`post.js` 在 dev 下直接执行原始函数。 | ✅ 已完成 |
| **清理冗余 `slug` frontmatter** | 当前仓库中所有文章的 `slug` 都与文件名一致，字段本身不再造成困惑（因为现在它真正生效了）。如果希望减少 frontmatter 冗余，可以批量移除，但非必须。 | 可选 |
| **文章路由前缀化** | 将文章 URL 从 `/blog/tech/general/my-post` 改为 `/blog/post/...`，彻底与频道/专栏路由解耦。需配合 301 重定向保护已有外部链接。改动较大，当前无迫切需求。 | 可选 |
| **文件监听自动重建** | 使用 `fs.watch` 或 `chokidar` 监听 `content/blog/` 目录，文件变化时实时重建索引，取代当前的 mtime 轮询。当前 mtime 检测已足够好用。 | 可选 |
