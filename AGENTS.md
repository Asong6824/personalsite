# AGENTS.md

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
├── content/blog/              # MDX 博客内容源文件
│   ├── tech/                  # 技术频道文章
│   ├── life/                  # 生活频道文章
│   ├── finance/               # 金融频道文章
│   └── create/                # 创作频道文章
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
│   │   ├── mdx/               # MDX 内可直接使用的组件（HSBSliders、ColorWheelSteps 等）
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
- 文件路径即 slug：`content/blog/life/japan/kyoto.mdx` → slug `life/japan/kyoto`。
- 通用动态路由 `src/app/blog/[...slug]/page.jsx` 捕获所有文章详情页。

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

---

## 路由架构

| 路由 | 说明 |
|------|------|
| `/` | 首页（英雄区、关于我、足迹、活跃天数、最新文章） |
| `/blog` | 博客主页（频道入口 + 按年份时间轴聚合） |
| `/blog/columns` | 全站专栏聚合页 |
| `/blog/tech` | 技术频道页 |
| `/blog/tech/[columnSlug]` | 技术频道专栏页 |
| `/blog/life` | 生活频道页 |
| `/blog/life/[columnSlug]` | 生活频道专栏页 |
| `/blog/finance` | 金融频道页 |
| `/blog/finance/[columnSlug]` | 金融频道专栏页 |
| `/blog/create` | 创作频道页 |
| `/blog/[...slug]` | 文章详情页（通用） |
| `/api/stocks` | 股票对比数据 API |
| `/api/datasets` | 数据集列表与详情 API |
| `/api/notion/...` | Notion 集成 API |

---

## 组件组织

- **`src/components/features/`**：页面级区块，如 `HeroSection`、`BlogAggregatedView`、`PostLayout`、`ChannelLayout`、`StockComparisonChart`、`TripRouteChart`。
- **`src/components/ui/`**：通用 UI 组件，如 `bento-grid`、`MusicPlayer`、`TableOfContents`、`BeforeAfter`、`Mermaid`、`globe`。
- **`src/components/mdx/`**：专供在 MDX 中直接调用的交互组件，如 `HSBSliders`、`ColorWheelSteps`、`RotatableColorWheel`。
- **`src/components/finance/`**：金融频道专属大型组件，如 `TempoHero`、`TempoGrid`、`DataWall`。
- **`src/components/magicui/`**：特效/装饰性组件，如 `Highlighter`。

### MDX 自定义组件

`src/app/blog/[...slug]/page.jsx` 中通过 `next-mdx-remote/rsc` 注入自定义组件，供文章直接使用：

- `InlineExplanation` — 行内解释提示
- `BentoGrid` / `BentoGridItem` — 网格布局
- `BeforeAfter` — 前后对比滑块
- `Highlighter` — 文本高亮特效
- `HSBSliders` / `ColorWheelSteps` / `RotatableColorWheel` — 色彩工具

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
- 路径别名统一使用 `@/*` 映射到 `./src/*`（`jsconfig.json` 配置）。
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
| `src/lib/post-index.js` | 文章索引构建与 slug 解析 |
| `src/lib/post.js` | 文章数据读取（带缓存） |
| `src/app/blog/[...slug]/page.jsx` | 文章详情页渲染器 |
| `src/app/blog/page.jsx` | 博客主页 |
| `scripts/build-posts-index.mjs` | 索引构建脚本 |
| `src/lib/stocks/fetch.js` | 股票数据统一入口 |
| `src/app/globals.css` | 全局样式与 Tailwind 导入 |
| `next.config.mjs` | Next.js 配置（含图片域名白名单） |

---

## 开发注意事项

1. **修改 MDX 文件后无需手动重建索引**：`npm run dev` 的 `predev` 钩子会自动处理；但在生产构建时同样由 `prebuild` 处理。
2. **新增专栏/频道**：需同步修改 `src/lib/channels.js`，并视情况创建对应路由目录与页面组件。
3. **MDX 组件注册**：若新增可在文章中直接使用的组件，需在 `src/app/blog/[...slug]/page.jsx` 的 `components` 对象中注册。
4. **客户端组件隔离**：涉及浏览器 API（如 `window`、`document`、Three.js、amCharts）的组件需标记 `"use client"`，并在必要时使用动态 `import()` 避免 SSR 报错。
5. **避免在 Server Component 中直接引用客户端库**：如 `fullpage.js`、`leva`、`three` 等应仅在 Client Component 内部使用。
