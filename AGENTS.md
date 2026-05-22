# AGENTS.md

本文件为 AI 编码助手提供项目**快速入口**。详细说明见 `docs/` 下各专题文档。

---

## 项目概述

基于 **Next.js 15 (App Router)** 的个人博客，站点标题「且听松涛」。内容以 **MDX** 组织，含技术/创作/生活/金融四个频道。

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
| 路由架构 | `docs/routing.md` |
| 组件组织与 MDX 自定义组件 | `docs/components.md` |
| 数据系统（股票、数据集、Notion） | `docs/data-system.md` |
| 开发约定（风格、缓存、环境变量） | `docs/conventions.md` |
| 架构反思与未来方向 | `docs/architecture-reflection.md` |

---

## 关键文件速查

| 文件 | 职责 |
|------|------|
| `src/lib/channels.js` | 频道/专栏定义 |
| `src/lib/post-index.js` | 文章索引构建 |
| `src/lib/post.js` | 文章数据读取 |
| `src/app/blog/[...slug]/page.jsx` | 文章详情页 |
| `src/app/blog/page.jsx` | 博客主页 |
| `scripts/build-posts-index.mjs` | 索引构建脚本 |
| `src/app/globals.css` | 全局样式 |
| `next.config.mjs` | Next.js 配置 |

---

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
