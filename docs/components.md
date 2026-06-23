# 组件组织

## 新增组件该放哪？（决策树）

```
1. 给文章用的交互/可视化？
   ├─ 2+ 篇文章复用 ──────→ content/components/{topic}/
   └─ 仅一篇用 ───────────→ content/blog/{slug}/components/
      （注：动态加载机制暂未实现，目前暂放 content/components/{topic}/）

2. 给页面级区块用的？
   ├─ 首页 3D 体验 ───────→ src/components/home/
   ├─ 频道页/专栏页 ──────→ src/components/features/
   ├─ 金融频道专属 ───────→ src/components/finance/
   └─ 创作频道专属 ───────→ src/components/create/

3. 全局 UI 原语？
   ├─ 通用交互/展示组件 ──→ src/components/ui/
   ├─ 布局（Navbar 等）────→ src/components/layout/
   ├─ 特效/装饰性 ────────→ src/components/magicui/
   └─ 调试辅助 ───────────→ src/components/debug/

4. SEO / 结构化数据？
   └─ 根级单文件 ─────────→ src/components/StructuredData.jsx
```

**核心原则**：
- **文章组件**与站点 UI 原语**生命周期不同**。文章归档时，其组件应一并消失。`content/` 与 `src/components/` 的物理边界使这一关系显性化。
- **页面组件**（features/）与站点共存，随页面加载而加载，不随内容归档而消失。

---

## 目录职责

| 目录 | 职责 | 示例 |
|------|------|------|
| `src/components/home/` | 首页 3D WebGL 体验 | `HomeExperienceClient` |
| `src/components/features/` | 页面级区块 | `HeroSection`、`BlogAggregatedView`、`PostLayout`、`ChannelLayout` |
| `src/components/ui/` | 通用 UI 原语 | `bento-grid`、`MusicPlayer`、`TableOfContents`、`BeforeAfter`、`Mermaid` |
| `src/components/finance/` | 金融频道专属 | `TempoHero`、`TempoGrid`、`DataWall` |
| `src/components/create/` | 创作频道专属 | `LiquidGlassWrapper`、`GlassCard` |
| `src/components/magicui/` | 特效/装饰性 | `Highlighter`、`rainbow-button` |
| `src/components/layout/` | 布局组件 | `Navbar` |
| `src/components/stamps/` | 印章收藏页专属 | `StampsPageClient`（无限画布 + 紧密 Bento 收藏墙 + 2×2 展开详情 + 顶级筛选） |
| `src/components/debug/` | 调试辅助 | `PerformanceMonitor`（全局挂载于 `layout.js`） |
| `src/components/StructuredData.jsx` | SEO 结构化数据 | 根级单文件，注入 JSON-LD |

> **关于旧版首页组件**：`HomeScrollExperience`、`AboutMeSection`、`FootprintsSection`、`ActiveDaysSection`、`RecentPosts` 等组件曾用于旧版首页，现随首页重构为 `HomeExperienceClient` 而不再挂载于首页。其中 `ProgrammerDetails` 已迁移至技术频道页，`TravelSection` 已迁移至生活频道页，其余组件当前处于未使用状态。
| `content/components/` | 文章交互组件（可视化、图表） | `color/*`、`rag/*`、`sketchy/*`、`travel/*` |

---

## MDX 自定义组件

`src/app/blog/[...slug]/page.jsx` 中通过 `next-mdx-remote/rsc` 注入自定义组件，供文章直接使用：

- `InlineExplanation` — 行内解释提示
- `BentoGrid` / `BentoGridItem` — 网格布局
- `BeforeAfter` — 前后对比滑块
- `Highlighter` — 文本高亮特效
- `HSBSliders` / `ColorWheelSteps` / `RotatableColorWheel` — 色彩工具（位于 `content/components/color/`）
- `DualTimeline` / `RAGFlowDiagram` — RAG 专用交互组件（位于 `content/components/rag/`）
- `TravelRouteMap` — 旅行路线手绘地图（位于 `content/components/travel/`）

---

## MDX Component Organization (A+B Hybrid)

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

## 文章可用组件速查

以下组件在 `src/app/blog/[...slug]/page.jsx` 中已注册，可在任意 MDX 文章中直接使用。

### 通用交互组件

| 组件 | 用法示例 | 说明 |
|------|---------|------|
| `InlineExplanation` | `<InlineExplanation explanation="详细说明...">关键词</InlineExplanation>` | 点击关键词展开/收起行内解释块 |
| `TableOfContents` | `<TableOfContents />` | 自动读取文章标题生成可点击目录，无 props |
| `MusicPlayer` | `<MusicPlayer />` | 播放 frontmatter `music` 字段配置的音频；也可传 `playlist={[{title, artist, src}]}` |
| `BeforeAfter` | `<BeforeAfter before={<div>A</div>} after={<div>B</div>} beforeLabel="之前" afterLabel="之后" />` | 左右对比布局，支持自定义标签 |
| `Highlighter` | `<Highlighter color="#ffd1dc">文本</Highlighter>` | 基于 Rough Notation 的手绘高亮，支持 `action`（highlight/underline/circle/box）、`animationDuration`、`isView`（滚动触发） |
| `RAGSidesOverview` | `<RAGSidesOverview />` | RAG 索引侧与检索侧的手绘风格对照总览，用作文章中的概念视觉锚点 |
| `Mermaid` | `<Mermaid chart="graph TD; A-->B;" />` | 渲染 Mermaid 图表，传 `chart` 字符串 |

### 布局组件

| 组件 | 用法示例 | 说明 |
|------|---------|------|
| `BentoGrid` | `<BentoGrid><BentoGridItem title="..." description="..." header={...} icon={...} /></BentoGrid>` | 三列网格布局，`BentoGridItem` 支持 `title`、`description`、`header`、`icon` |

### 色彩工具（`content/components/color/`）

| 组件 | 用法 | 说明 |
|------|------|------|
| `HSBSliders` | `<HSBSliders />` | 交互式 HSB 滑块，自包含状态 |
| `ColorWheelSteps` | `<ColorWheelSteps />` | 步骤式色轮（Primary → Secondary → Tertiary） |
| `RotatableColorWheel` | `<RotatableColorWheel />` | 可旋转的 12 色色轮 |

### RAG 专用可视化（`content/components/rag/`）

| 组件 | 用法 | 说明 |
|------|------|------|
| `DualTimeline` | `<DualTimeline />` | LLM 与 RAG 发展双时间线（固定内容） |
| `RAGFlowDiagram` | `<RAGFlowDiagram />` | 索引 + 检索完整流程图（可交互） |
| `SketchyRAGOverview` | `<SketchyRAGOverview />` | RAG 四大发展阶段概览图 |
| `Word2VecVectorSpace` | `<Word2VecVectorSpace />` | Word2Vec 向量空间示意（King-Queen 示例） |
| `InContextLearningChart` | `<InContextLearningChart />` | 上下文学习性能曲线图 |

### 旅行路线地图（`content/components/travel/`）

| 组件 | 用法 | 说明 |
|------|------|------|
| `TravelRouteMap` | `<TravelRouteMap region="japan" places={[...]} />` | 真实 GeoJSON 底图 + Rough.js 手绘风格路线 |
| `CityWalkMap` | `<CityWalkMap center={{lat,lng}} places={[...]} />` | 街区级步行地图。Leaflet + OSM 瓦片，带真实路网 |

**完整示例（城际路线）：**

`fit="places"` 自动 zoom 到地点范围，适合显示跨城市路线：

```mdx
<TravelRouteMap
  region="japan"
  fit="places"
  places={[
    { name: "京都", lat: 35.01, lng: 135.76, day: 1 },
    { name: "金泽", lat: 36.58, lng: 136.65, day: 2 },
  ]}
  showLabels={true}
  routeColor="#8B7355"
  markerColor="#c83830"
  height={420}
  placesPaddingRatio={0.4}
/>
```

**完整示例（市内步行路线）：**

```mdx
<CityWalkMap
  center={{ lat: 36.565, lng: 136.655 }}
  zoom={15}
  places={[
    { name: "金泽站", lat: 36.5781, lng: 136.6482 },
    { name: "近江町市场", lat: 36.5713, lng: 136.6566 },
    { name: "尾崎神社", lat: 36.5614, lng: 136.6560 },
    { name: "金泽城公园", lat: 36.5616, lng: 136.6590 },
  ]}
  routeColor="#8B7355"
  markerColor="#c83830"
  height={450}
/>
```

**Props：**

| Prop | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `region` | `string` | 否（与 city 二选一） | — | 预设区域：`japan`、`world`、`china`、`europe`、`usa` |
| `city` | `string` | 否（与 region 二选一） | — | 预设城市：`kanazawa` |
| `customGeoJSON` | `object` | 否 | — | 自定义 GeoJSON FeatureCollection，优先级最高 |
| `fit` | `string` | 否 | `"places"` | 视野适配：`"region"` 显示整个区域，`"places"` 自动 zoom 到地点范围 |
| `places` | `Place[]` | 是 | — | `{ name, lat, lng, day?, note? }` |
| `placesPaddingRatio` | `number` | 否 | `0.35` | `fit="places"` 时的视野留白比例（0~1） |
| `showLabels` | `boolean` | 否 | `true` | 显示地点名称标签 |
| `animate` | `boolean` | 否 | `false` | 按 `day` 顺序动画呈现路线（预留） |
| `routeColor` | `string` | 否 | `#8B7355` | 路线颜色 |
| `markerColor` | `string` | 否 | `#c83830` | 标记点颜色 |
| `landColor` | `string` | 否 | `#e8e0d5` | 陆地填充色 |
| `waterColor` | `string` | 否 | `#f5f5f5` | 水域背景色 |
| `height` | `number` | 否 | `450` | SVG 高度 |
| `roughness` | `number` | 否 | `0.8` | 底图轮廓手绘程度 |
| `routeRoughness` | `number` | 否 | `1.5` | 路线手绘程度 |

**地图数据来源：**

- **国家/大洲级**：`@amcharts/amcharts5-geodata`（内置 200+ 国家和地区）
- **城市级**：项目内置 `content/components/travel/*.geo.json`（当前支持 `kanazawa`）
- **自定义**：通过 `customGeoJSON` prop 传入任意 GeoJSON

**如何添加新城市：**

1. 从 [Nominatim](https://nominatim.openstreetmap.org) 获取城市边界 GeoJSON：
   ```bash
   curl -s "https://nominatim.openstreetmap.org/search?q=城市英文名,国家&format=geojson&polygon_geojson=1&limit=1" \
     -H "User-Agent: YourSite/1.0" > city.raw.json
   ```
2. 简化坐标点（目标 200~500 个点）：
   ```bash
   npx mapshaper city.raw.json -simplify 10% -o city.geo.json
   ```
   或手动用 [mapshaper.org](https://mapshaper.org) 可视化简化。
3. 放入 `content/components/travel/` 目录
4. 在 `TravelRouteMap.jsx` 的 `CITY_MODULES` 中注册新城市
5. 在 MDX 中使用 `city="新城市英文名"`

**技术栈：** `@amcharts/amcharts5-geodata` / 自定义 GeoJSON + `d3-geo`（投影）+ `roughjs`（手绘渲染）。

---

### 手绘风格组件库（`content/components/sketchy/`）

见 [`docs/sketchy-components.md`](./sketchy-components.md) 完整指南。快速示例：

```jsx
<SketchySvg width={400} height={300}>
  <SketchyRect x={50} y={50} width={100} height={80} fill="#fef9e9" />
  <SketchyArrow x1={160} y1={90} x2={250} y2={90} />
  <SketchyCircle cx={300} cy={90} diameter={60} fill="#ede9ce" />
  <SketchyText x={280} y={95} text="Hello" fontSize={14} />
</SketchySvg>
```
