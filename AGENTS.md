# AGENTS.md

本文件为 AI 编码助手提供项目**快速入口**。详细说明见 `docs/` 下各专题文档。

---

## 项目概述

基于 **Next.js 15 (App Router)** 的个人博客，站点标题「大盈若冲」。内容以 **MDX** 组织，含技术/创作/生活/金融四个频道。

---

## 技术栈

| 层级 | 技术 |
|------|------|
| 框架 | Next.js 15 + React 19 |
| 样式 | Tailwind CSS v4 + `next-themes` |
| MDX | `next-mdx-remote/rsc` |
| 动画 | Framer Motion / GSAP / Three.js |
| 图表 | ECharts / amCharts5 |
| 图标 | `lucide-react` / `@tabler/icons-react` |

---

## 项目结构（精简）

```
content/blog/          # MDX 文章源文件
content/components/    # 文章交互组件（按主题）
src/app/               # Next.js 页面与 API
src/components/        # 站点 UI 组件
src/lib/               # 核心逻辑（post.js, channels.js, post-index.js）
src/data/              # 数据集与缓存
scripts/               # 构建与数据摄入脚本
```

---

## 快速命令

```bash
npm run dev      # 开发（自动重建索引）
npm run build    # 生产构建
npm run lint     # 代码检查
```

---

## 文档导航

> `docs/` 目录存放项目级架构文档，供 AI 助手与人类开发者查阅。

| 主题 | 文件 |
|------|------|
| 内容系统（MDX、Frontmatter、索引、频道） | `docs/content-system.md` |
| 频道、专栏与设计风格 | `docs/channels-and-design.md` |
| 路由架构 | `docs/routing.md` |
| 首页实现总览 | `docs/homepage-experience.md` |
| 首页阶段、视觉与性能设计 | `docs/homepage-design.md` |
| 组件组织与 MDX 自定义组件 | `docs/components.md` |
| 手绘风格组件库（Sketchy） | `docs/sketchy-components.md` |
| 数据系统（股票、数据集、Notion） | `docs/data-system.md` |
| 开发约定（风格、缓存、环境变量） | `docs/conventions.md` |
| 架构反思与未来方向 | `docs/architecture-reflection.md` |

---

## 关键文件速查

| 文件 | 职责 |
|------|------|
| `src/lib/channels.ts` | 频道/专栏定义 |
| `src/lib/post-index.ts` | 文章索引构建 |
| `src/lib/post.ts` | 文章数据读取 |
| `src/lib/seo-utils.ts` | SEO 结构化数据生成 |
| `src/lib/route-utils.ts` | 专栏静态参数与路由校验 |
| `src/lib/scrollUtils.ts` | 平滑滚动工具 |
| `src/lib/config-validator.ts` | 频道配置校验（开发环境） |
| `src/lib/api/datasets.ts` | 前端数据集查询封装 |
| `vitest.config.ts` | 测试框架配置 |
| `scripts/gate-check.ts` | 总门禁脚本（lint + test + build + 索引验证） |
| `src/app/blog/[...slug]/page.tsx` | 文章详情页（含 generateStaticParams / generateMetadata） |
| `src/app/blog/page.tsx` | 博客主页 |
| `src/app/blog/life/japan/stamps/page.tsx` | 车站印章收藏页 |
| `src/components/stamps/StampsPageClient.tsx` | 印章页客户端组件（无限画布 + Bento 重排展开 + 线路/地域/铁路公司组织筛选 + 滚轮/触摸滑动） |
| `src/data/stamps.ts` | 印章收藏数据（车站信息、TOS 图片 URL、故事） |
| `scripts/build-posts-index.ts` | 索引构建脚本 |
| `src/app/globals.css` | 全局样式与字体导入 |
| `next.config.ts` | Next.js 配置（远程图片白名单等） |

---

## 协作约定

- **Git 提交由用户控制**：AI 助手只负责写入/修改文件，**不自动执行 `git add` / `git commit` / `git push`**。完成一批改动后，AI 应汇报文件变更清单和建议的 commit message，由用户自行决定何时提交。
- **Notion 集成暂时封存**：相关 API、环境变量和历史数据保留，但当前站点不依赖；除非用户明确要求重新启用，否则不新增 Notion 功能或依赖。

## 三条铁律

1. **修改 MDX 后刷新即可**：开发环境索引自动重建，缓存已旁路。
2. **新增组件先判复用范围**：复用组件放 `content/components/{topic}/`，单篇专属放文章目录。
3. **浏览器 API 隔离**：`window`/`document`/Three.js 等必须包在 `"use client"` 组件内。

---

## 架构文档同步原则

改动属于以下情况时，同步更新本文档或 `docs/` 下对应专题：

- 新增目录结构 / 组织约定 → 更新对应文档
- 新增 path alias / 构建配置 → 更新对应文档
- 新增开发流程或协作规范 → 更新对应文档
- 改变组件/文件职责边界 → 更新对应文档
