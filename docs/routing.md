# 路由架构

## 页面路由

| 路由 | 说明 |
|------|------|
| `/` | 首页（GSAP ScrollTrigger 滚动体验：Hero 文字动画 + Orb 效果 + 四频道 Scrollytelling） |
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
| `/dev/datasets-demo` | 数据集/股票图表演示页 |

> 注：`/blog/tech/design` 等路径由动态路由 `[columnSlug]` 统一处理，不再使用独立的固定路由文件。

**路由优先级说明**：在 Next.js App Router 中，`/blog/tech/[columnSlug]` 的 `[columnSlug]` 只能匹配单个路径段（如 `/blog/tech/go`），无法匹配 `/blog/tech/go/something`。因此 `/blog/tech/general/my-post` 这类多段路径会正确落入 `/blog/[...slug]` 文章详情页，而不会与专栏路由冲突。

---

## API 路由

| 路由 | 说明 |
|------|------|
| `/api/stocks` | 股票对比数据 API |
| `/api/datasets` | 数据集列表 API（支持过滤） |
| `/api/datasets/:id` | 数据集详情 API（支持时间裁剪） |
| `/api/datasets/:id/series/:key` | 数据集时间序列点位追加（PUT） |
| `/api/notion/...` | Notion 集成 API |
