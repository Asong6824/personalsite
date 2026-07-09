# 开发约定

## 代码风格

- 页面、核心逻辑、API 和站点组件优先使用 TypeScript，文件扩展名通常为 `.ts` / `.tsx`；部分 `content/components/` 文章组件仍保留 `.jsx`。
- 路径别名：`@/*` 映射到 `./src/*`，`@content/*` 映射到 `./content/*`（`tsconfig.json` 配置）。
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
| 中文衬线 | `Noto Serif SC` | 金融频道中文标题 |
| 中文手写 | `LXGW WenKai`（霞鹜文楷） | 装饰性中文手写体 |
| 手绘图表 | `Excalifont` + `LXGW WenKai` | Sketchy 组件库的西文与中文 |

四个核心字体在 `src/app/layout.tsx` 中通过 `next/font/google` 构建时下载并自托管，统一暴露为 `--font-*` CSS 变量。霞鹜文楷继续使用 CDN 分包字体，`Excalifont` 使用 `public/fonts/` 下的本地 WOFF2。

---

## 图片与媒体

远程图片域名白名单位于 `next.config.ts`。修改图片域名时只维护这一份 Next.js 配置。

当前允许以下远程图片域名：

- `images.unsplash.com`
- `blog-assets-asong.tos-cn-beijing.volces.com`
- `p1-juejin.byteimg.com`
- `p3-juejin.byteimg.com`
- `p6-juejin.byteimg.com`
- `p9-juejin.byteimg.com`

本地静态资源存放于 `public/`。

---

## 包管理

项目使用 npm，锁文件为 `package-lock.json`。CI 通过 `npm ci --legacy-peer-deps` 安装依赖；不要同时维护 pnpm/yarn lockfile。

---

## 环境变量

项目使用 `.env.local` 管理私有环境变量。常见需要配置的变量包括：

| 变量名 | 用途 |
|--------|------|
| `ALPHA_VANTAGE_API_KEY` | Alpha Vantage 股票数据 API |
| `RAPIDAPI_KEY` | RapidAPI（Yahoo Finance）股票数据 |
| `ALLOW_API_FILE_WRITES` | 本地维护开关；设为 `1` 时允许 API 写入 `src/data` 文件 |
| `ENABLE_ARCHIVED_NOTION_API` | 已封存 Notion API 开关；设为 `1` 时才允许旧接口运行 |
| `NOTION_TOKEN` | 已封存的 Notion 集成 Token；当前默认不配置 |

`NOTION_DB_ACTIVITIES`、`NOTION_DB_GOALS`、`NOTION_DB_KRS` 同属已封存的 Notion 集成。除非明确执行重新启用工作，否则本地开发、测试和部署均不要求配置这些变量。

> 环境变量模板见 `.env.local.example`。添加新变量时请同步更新该模板及本文档。

---

## 部署

- 项目为标准 Next.js 应用，推荐使用 **Vercel** 部署。
- 构建时 `prebuild` 会自动生成文章索引，确保 MDX 文件变更后被正确收录。
- 若使用静态导出（`output: 'export'`），需在保留的 Next.js 配置文件中开启，并确保所有动态路由已预渲染。

---

## 测试

项目使用 **Vitest** 作为测试框架，配置见 `vitest.config.ts`。

### 运行测试

```bash
npm run test        # 运行全部测试（CI 模式）
npm run test:watch  # 监听模式
npm run test:ui     # UI 界面模式
```

### 测试覆盖范围

| 模块 | 测试文件 | 说明 |
|------|----------|------|
| `config-validator` | `src/lib/__tests__/config-validator.test.ts` | 频道/专栏配置校验、文章分类验证 |
| `channels` | `src/lib/__tests__/channels.test.ts` | 频道配置结构、tags 归类逻辑 |
| `cache` | `src/lib/__tests__/cache.test.ts` | 内存缓存命中/过期/清理 |
| `route-utils` | `src/lib/__tests__/route-utils.test.ts` | 静态参数生成、路由验证 |

### 总门禁脚本

```bash
npm run gate
```

门禁脚本按顺序执行以下检查。当前 lint warning 和文章索引 warning 不会令命令失败，因此“gate 通过”只表示各命令退出码成功；部署前仍必须审阅 warning：

1. **ESLint** — 代码风格与规则检查
2. **单元测试** — `vitest run`
3. **文章索引验证** — `scripts/build-posts-index.ts`（路由冲突、slug 合法性、配置有效性）
4. **Next.js 构建** — 编译与静态页面生成

> 门禁脚本是 Harness 的"反馈"核心：把"是否完成"从 AI 的主观汇报变成可检查的客观结果。

### 手动测试清单（补充）

自动化测试无法覆盖的视觉/交互项，部署前仍需手动验证：

- 全局导航与布局（Navbar、Footer）
- 首页 WebGL 加载、Observe / Express / Create 阶段、Showcase、Reviews 与 Awards 收尾
- 博客列表与文章详情
- 频道页与专栏页
- 股票对比图表交互
- 响应式布局
