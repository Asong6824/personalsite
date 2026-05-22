# 且听松涛

个人博客与主页，基于 Next.js 15 (App Router) 构建。

## 技术栈

- **框架**：Next.js 15 + React 19
- **样式**：Tailwind CSS v4 + `next-themes`（暗色/亮色）
- **内容**：MDX + `next-mdx-remote/rsc`
- **动画**：Framer Motion / GSAP / Three.js
- **图表**：ECharts / amCharts5
- **组件库**：shadcn/ui

## 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器（会自动构建文章索引）
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000) 查看站点。

## 首页

首页是一个 **GSAP ScrollTrigger** 驱动的滚动体验页面（`src/components/features/HomeScrollExperience`）：

- **Hero 区域**：逐字动画标语 + 3D Orb 视觉效果
- **四频道 Scrollytelling**：滚动时左侧展示技术/创造/生活/金融四个频道的介绍，右侧切换对应的视觉组件

> 旧版的首页区块组件（`AboutMeSection`、`FootprintsSection`、`ActiveDaysSection` 等）已迁移至各自频道页使用。

## 目录说明

```
content/blog/          # MDX 文章源文件
content/components/    # 文章交互组件（按主题）
src/app/               # Next.js 页面与 API
src/components/        # 站点 UI 组件
src/lib/               # 核心逻辑（post.js, channels.js, post-index.js）
src/data/              # 数据集与缓存
scripts/               # 构建与数据摄入脚本
public/                # 静态资源
docs/                  # 项目架构文档（AI 助手参考）
```

## 环境变量

复制 `.env.local.example` 为 `.env.local` 并填入实际值：

| 变量 | 说明 |
|------|------|
| `ALPHA_VANTAGE_API_KEY` | Alpha Vantage 股票数据 API |
| `RAPIDAPI_KEY` | RapidAPI（Yahoo Finance）股票数据 |
| `NOTION_TOKEN` | Notion 集成 Token |
| `NOTION_DB_ACTIVITIES` | Notion Activities 数据库 ID |
| `NOTION_DB_GOALS` | Notion Goals 数据库 ID |
| `NOTION_DB_KRS` | Notion Key Results 数据库 ID |

## 部署

本项目为标准 Next.js 应用，推荐部署至 **Vercel**。

构建时 `prebuild` 钩子会自动生成文章索引，无需手动操作。

## 文档

- AI 编码助手请优先阅读根目录 `AGENTS.md`。
- 详细架构专题文档位于 `docs/` 目录下。
