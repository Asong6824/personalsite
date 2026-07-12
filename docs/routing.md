# 路由架构

## 页面路由

| 路由 | 说明 |
|------|------|
| `/` | 首页（Three.js + GSAP ScrollTrigger 3D 滚动体验） |
| `/blog` | 博客主页（频道入口 + 按年份时间轴聚合） |
| `/blog/columns` | 全站专栏聚合页 |
| `/blog/tech` | 技术频道页 |
| `/blog/tech/[columnSlug]` | 技术频道专栏页（`[columnSlug]` 只匹配**单个**路径段） |
| `/blog/life` | 生活频道页 |
| `/blog/life/[columnSlug]` | 生活频道专栏页（`[columnSlug]` 只匹配**单个**路径段） |
| `/blog/finance` | 金融频道页 |
| `/blog/finance/[columnSlug]` | 金融频道专栏页（`[columnSlug]` 只匹配**单个**路径段） |
| `/blog/creative` | 创意频道页 |
| `/blog/creative/[columnSlug]` | 创意频道专栏页 |
| `/blog/[...slug]` | 文章详情页（通用，匹配一个或多个路径段） |
| `/blog/life/japan/stamps` | 日本车站印章收藏页（无限画布布局，可滚轮/触摸滑动） |
| `/dev/datasets-demo` | 数据集/股票图表演示页 |

> 注：频道下的专栏路径由动态路由 `[columnSlug]` 统一处理，不再使用独立的固定路由文件。

> 注：旧的临时实验路由已移除，3D 首页体验统一挂载在 `/`。

**路由优先级说明**：在 Next.js App Router 中，`/blog/tech/[columnSlug]` 的 `[columnSlug]` 只能匹配单个路径段（如 `/blog/tech/go`），无法匹配 `/blog/tech/go/something`。因此 `/blog/tech/general/my-post` 这类多段路径会正确落入 `/blog/[...slug]` 文章详情页，而不会与专栏路由冲突。

---

## 客户端跳转反馈

- `src/components/layout/RouteTransitionFeedback.tsx` 全局监听站内链接，负责顶部路由进度条和导航意图预取。
- 进度条从用户按下站内链接时开始，在 pathname 或 search params 实际变化后结束；同路由和纯 hash 跳转不会触发。
- 使用 `router.push()` 的程序化跳转必须先调用 `src/lib/route-transition.ts` 中的 `startRouteTransition(href)`，确保与普通 `<Link>` 使用同一套反馈。
- `src/components/layout/RouteLoadingSkeleton.tsx` 提供 overview、channel、article、canvas 四种无客户端 JavaScript 的 Suspense 骨架。
- `src/app/loading.tsx` 和 `src/app/blog/loading.tsx` 使用 overview 骨架；各频道父级使用 channel，文章 catch-all 使用 article，印章页使用 canvas。Navbar 另外提供当前入口的 pending 状态。

---

## API 路由

| 路由 | 说明 |
|------|------|
| `/api/stocks` | 股票对比数据 API |
| `/api/datasets` | 数据集列表 API（支持过滤） |
| `/api/datasets/:id` | 数据集详情 API（支持时间裁剪） |
| `/api/datasets/:id/series/:key` | 数据集时间序列点位追加（PUT） |
| `/api/notion/heatmap` | 已封存的 Notion 活跃数据接口；当前站点不依赖 |
| `/api/notion/list-dbs` | 已封存的 Notion 数据库发现接口；仅保留历史实现 |

> Notion 集成当前处于封存状态。路由代码仍保留，但不属于活跃产品能力，也不应成为新功能依赖。
