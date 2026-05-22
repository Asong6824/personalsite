# 开发约定

## 代码风格

- 使用 JavaScript (ES Module) 编写，文件扩展名通常为 `.js` / `.jsx`。
- 路径别名：`@/*` 映射到 `./src/*`，`@content/*` 映射到 `./content/*`（`jsconfig.json` 配置）。
- ESLint 配置为 `next/core-web-vitals` Flat Config 格式（`eslint.config.mjs`）。
- 组件优先使用函数组件，Server Component 为默认；需要客户端交互时显式添加 `"use client"`。
- 服务端数据获取函数使用 `async/await`，页面级组件通常为 `async`。

---

## 缓存策略

- 文章索引与文章列表使用内存缓存 + 文件索引，避免频繁读取磁盘。
- 股票 API 接口设置 `Cache-Control: public, s-maxage=300, stale-while-revalidate=86400`。
- 数据集 API 同样使用服务端缓存 + SWR 策略。

---

## 字体系统

站点使用分层字体栈，兼顾中西文排版：

| 层级 | 字体 | 用途 |
|------|------|------|
| 英文无衬线 | `Inter` | 正文、UI 标签 |
| 英文衬线 | `Newsreader` | 大标题、Display 文字 |
| 英文等宽 | `JetBrains Mono` | 代码块、数据展示 |
| 中文衬线 | `Noto Serif SC` | 中文标题、正文 |
| 中文手写 | `LXGW WenKai`（霞鹜文楷） | 装饰性中文手写体 |
| 手绘图表 | `Excalifont` / `Virgil` | Sketchy 组件库专用 |

字体在 `src/app/globals.css` 中通过 `@import` 引入 Google Fonts 和 CDN 分包字体。

---

## 图片与媒体

`next.config.mjs` 中配置了以下远程图片域名白名单：

- `blog-assets-asong.tos-cn-beijing.volces.com`
- `p1-juejin.byteimg.com`
- `p3-juejin.byteimg.com`
- `p6-juejin.byteimg.com`
- `p9-juejin.byteimg.com`

本地静态资源存放于 `public/`。

---

## 环境变量

项目使用 `.env.local` 管理私有环境变量。常见需要配置的变量包括：

| 变量名 | 用途 |
|--------|------|
| `ALPHA_VANTAGE_API_KEY` | Alpha Vantage 股票数据 API |
| `RAPIDAPI_KEY` | RapidAPI（Yahoo Finance）股票数据 |
| `NOTION_TOKEN` | Notion 集成 Token |

> 环境变量模板见 `.env.local.example`。添加新变量时请同步更新该模板及本文档。

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
