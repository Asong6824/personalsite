---
name: pre-deploy-check
description: 部署前的最终检查，确保构建通过、索引正确、路由无冲突、关键页面可访问。触发词："部署"、"发布"、"上线"、"pre-deploy"、"检查能否部署"、"build 前检查"。
---

# Pre-Deploy Check — 部署前检查

## 适用场景

- 用户准备部署/上线前做最终检查
- 用户想确认当前代码是否可安全构建
- 用户发现某些页面异常，想系统性排查
- CI/CD 流程中的构建前验证（如果未来接入）

> ⚠️ **项目现状**：当前没有自动化测试套件，没有 CI/CD，部署前依赖手动检查。本 Skill 把分散在各处的检查点固化为可执行的清单。

## 核心 Workflow

### Phase 1：构建验证（必须先过）

```bash
# 1. 清理并重建
rm -rf .next/
npm run build
```

**观察要点：**
- [ ] 构建是否成功完成（Exit code 0）
- [ ] `prebuild` 钩子是否自动执行了 `build-posts-index.ts`
- [ ] 控制台是否有 `[posts-index] validation warnings`？
  - 如果有 `[CONFLICT]` → 阻塞，必须修复路由冲突
  - 如果有 `[INVALID]` → 阻塞，必须修复 slug
  - 如果有 `[CONFIG]` → 阻塞，必须修复频道/专栏配置
- [ ] 是否有 TypeScript 编译错误？
- [ ] 是否有 ESLint 错误？（`npm run lint`）

> 🔴 **Phase 1 任何一项失败，部署必须中止。**

### Phase 2：静态路由生成验证

Next.js 构建日志中会输出 `Generating static pages`，检查：

- [ ] `/`（首页）是否生成成功
- [ ] `/blog`（博客主页）是否生成成功
- [ ] `/blog/columns`（专栏聚合页）是否生成成功
- [ ] 各频道页是否生成成功：
  - `/blog/tech`
  - `/blog/life`
  - `/blog/finance`
  - `/blog/create`
- [ ] 专栏动态路由的静态参数是否正确生成：
  - `/blog/tech/[columnSlug]` → 是否包含 go, general, product, design
  - `/blog/life/[columnSlug]` → 是否包含 japan, thoughts, misc
  - `/blog/finance/[columnSlug]` → 是否包含 finance
  - `/blog/create/[columnSlug]` → 是否包含 design, product
- [ ] 文章详情页是否全部生成：
  - 构建日志中 `[...slug]` 的文章数量是否与 `content/blog/` 下的文件数量一致

### Phase 3：关键页面手动验证

构建成功后，在本地或预览环境逐一检查：

#### 3.1 全局导航与布局
- [ ] Navbar 正常显示，各频道入口可点击
- [ ] 暗色/亮色主题切换正常（如有）
- [ ] Footer 正常显示
- [ ] 返回博客列表链接正常

#### 3.2 首页
- [ ] `/` 首页加载无报错
- [ ] Hero 区域文字动画正常（GSAP）
- [ ] 四频道 Scrollytelling 滚动切换正常
- [ ] 3D Orb 视觉效果正常（如有）

#### 3.3 博客列表与文章
- [ ] `/blog` 文章列表正常加载
- [ ] 文章按年份时间轴聚合正确
- [ ] 置顶文章（pinned）排在最前
- [ ] 点击文章标题进入详情页
- [ ] 文章详情页 `/blog/[...slug]` 渲染正常
- [ ] 文章封面图正常显示
- [ ] 标签（tags）正确显示
- [ ] 目录（TableOfContents）正常生成
- [ ] 代码块语法高亮正常
- [ ] 返回博客列表链接可用

#### 3.4 频道页与专栏页
- [ ] `/blog/tech` 频道页正常渲染
- [ ] `/blog/tech/go` 专栏页文章列表正确
- [ ] `/blog/life` 频道页正常
- [ ] `/blog/life/japan` 专栏页正常（特殊布局）
- [ ] `/blog/finance` 频道页正常
- [ ] `/blog/create` 频道页正常
- [ ] 专栏页封面图正常显示

#### 3.5 数据与 API
- [ ] `/api/stocks` 股票数据 API 返回正常（需配置环境变量）
- [ ] `/api/datasets` 数据集列表 API 返回正常
- [ ] 股票对比图表页 `/dev/datasets-demo` 正常加载（如配置）

#### 3.6 响应式布局
- [ ] 移动端（< 768px）布局正常
- [ ] 平板端（768px - 1024px）布局正常
- [ ] 桌面端（> 1024px）布局正常
- [ ] 文章阅读宽度切换（WidthToggle）正常

#### 3.7 MDX 组件
- [ ] 含自定义 MDX 组件的文章渲染正常（如 RAG 相关文章）
- [ ] Sketchy 手绘组件渲染正常
- [ ] 色彩工具组件正常

### Phase 4：环境变量检查

部署前确认 `.env.local` 中以下变量已配置（生产环境）：

| 变量 | 用途 | 是否必填 |
|------|------|----------|
| `ALPHA_VANTAGE_API_KEY` | 股票数据 API | 若使用股票功能则必填 |
| `RAPIDAPI_KEY` | RapidAPI（Yahoo Finance） | 若使用股票功能则必填 |
| `NOTION_TOKEN` | Notion 集成 | 若使用 Notion 功能则必填 |
| `NOTION_DB_ACTIVITIES` | Notion Activities DB | 同上 |
| `NOTION_DB_GOALS` | Notion Goals DB | 同上 |
| `NOTION_DB_KRS` | Notion Key Results DB | 同上 |

> 检查方法：构建日志中是否出现 `undefined` 相关的 API 报错。

### Phase 5：SEO 与性能

- [ ] 各页面 `<title>` 和 `<meta description>` 正确
- [ ] 文章详情页的 Open Graph 图片正常（`coverImage`）
- [ ] 结构化数据（JSON-LD）正确注入（查看页面源码）
- [ ] 构建输出中无大体积 chunk 警告（> 244 KB）

## 一键验证脚本（建议未来实现）

虽然当前没有自动化测试，但以下脚本可以作为"最小可行门禁"：

```bash
#!/bin/bash
set -e

echo "🔍 开始部署前检查..."

# 1. 构建
echo "📦 构建项目..."
npm run build

# 2. 索引验证
echo "📑 验证文章索引..."
npx tsx scripts/build-posts-index.ts

# 3. Lint
echo "🔎 运行 ESLint..."
npm run lint

# 4. 环境变量检查
echo "🔐 检查环境变量..."
if [ -z "$ALPHA_VANTAGE_API_KEY" ]; then
  echo "⚠️  ALPHA_VANTAGE_API_KEY 未设置"
fi

echo "✅ 部署前检查完成"
```

## 常见部署问题

| 问题 | 现象 | 排查 |
|------|------|------|
| 文章 404 | slug 与专栏路由冲突 | 检查 `build-posts-index.ts` 的 `[CONFLICT]` |
| 专栏页 404 | 新增专栏后未生成静态参数 | 检查 `[columnSlug]/generateStaticParams` |
| 首页空白 | GSAP/Three.js 报错 | 检查 `"use client"` 是否正确 |
| API 500 | 环境变量未配置 | 检查 `.env.local` |
| 样式错乱 | Tailwind v4 兼容问题 | 检查 `globals.css` 和 PostCSS 配置 |
| 构建超时 | 静态页面过多 | 检查 `generateStaticParams` 是否返回过多参数 |

## 当前项目已知限制

- ❌ **无自动化测试**：手动测试是唯一验证方式
- ❌ **无 CI/CD**：`.github/workflows/` 不存在
- ❌ **无预发环境**：建议部署到 Vercel Preview 分支先验证
- ✅ **索引自动重建**：`prebuild` 钩子已配置，构建时自动执行
- ✅ **开发环境配置校验**：`config-validator.ts` 开发时自动运行
