# 组件组织

## 新增组件该放哪？（决策树）

```
1. 给文章用的交互/可视化？
   ├─ 2+ 篇文章复用 ──────→ content/components/{topic}/
   └─ 仅一篇用 ───────────→ content/blog/{slug}/components/
      （仍需加入统一组件清单与按需加载器）

2. 给页面级区块用的？
   ├─ 首页 3D 体验 ───────→ src/components/home/
   ├─ 频道页/专栏页 ──────→ src/components/features/
   ├─ 金融频道专属 ───────→ src/components/finance/
   └─ 创意频道专属 ───────→ src/components/creative/

3. 全局 UI 原语？
   ├─ 通用交互/展示组件 ──→ src/components/ui/
   ├─ 布局（Navbar 等）────→ src/components/layout/
   ├─ 特效/装饰性 ────────→ src/components/magicui/
   └─ 调试辅助 ───────────→ src/components/debug/

4. SEO / 结构化数据？
   └─ 根级单文件 ─────────→ src/components/StructuredData.tsx
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
| `src/components/finance/` | 金融频道专属 | `FinanceHomeClient`、`FinanceColumnLayout` |
| `src/components/creative/` | 创意频道专属 | `LiquidGlassWrapper`、`GlassCard` |
| `src/components/magicui/` | 特效/装饰性 | `Highlighter`、`rainbow-button` |
| `src/components/layout/` | 布局组件 | `Navbar`、`RouteTransitionFeedback`、`RouteLoadingSkeleton` |
| `src/components/stamps/` | 印章收藏页专属 | `StampsPageClient`（无限画布 + 紧密 Bento 收藏墙 + 3×2 重排展开详情 + 线路/地域/铁路公司组织筛选） |
| `src/components/debug/` | 调试辅助 | `PerformanceMonitor`（全局挂载，但仅在开发环境设置 `NEXT_PUBLIC_ENABLE_PERFORMANCE_MONITOR=1` 时启用） |
| `src/components/StructuredData.tsx` | SEO 结构化数据 | 根级单文件，注入 JSON-LD |
| `content/components/` | 文章交互组件（可视化、图表） | `agent/*`、`color/*`、`rag/*`、`sketchy/*`、`travel/*` |

> **关于旧版首页组件**：`HomeScrollExperience`、`AboutMeSection`、`FootprintsSection`、`ActiveDaysSection`、`RecentPosts` 等组件曾用于旧版首页，现随首页重构为 `HomeExperienceClient` 而不再挂载于首页。其中 `ProgrammerDetails` 已迁移至技术频道页，`TravelSection` 已迁移至生活频道页，其余组件当前处于未使用状态。

> **关于金融频道实验组件**：`FinanceChannelClient`、`TempoHero`、`TempoGrid`、`TempoBackground`、`DataWall`、`DebugPanel` 当前没有被 `/blog/finance` 挂载。金融频道真实入口是 `src/app/blog/finance/page.tsx` → `FinanceHomeClient`，金融专栏页是 `src/app/blog/finance/[columnSlug]/page.tsx` → `FinanceColumnLayout`。

---

## MDX 自定义组件

`src/app/blog/[...slug]/page.tsx` 中通过 `next-mdx-remote/rsc` 注入自定义组件。构建索引会从 MDX AST 提取每篇文章实际使用的组件，客户端交互组件通过 lazy wrapper 按文章加载：

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
  - 例：`content/components/color/HSBSliders.jsx`（被 creative 和 tech 两篇文章共用）
- **严格单篇专属**且不可能复用 → `content/blog/{slug}/components/`
  - 仍需加入统一白名单和显式加载器，保证构建校验与代码拆分可追踪

**理由：** 文章组件与 UI 原语生命周期不同。文章归档时，其组件应一并消失。`content/` 与 `src/components/` 的物理边界使这一关系显性化。

**路径别名：** `tsconfig.json` 中 `@content/*` 映射到 `./content/*`。组件入口统一维护在 `src/components/article/mdx-client-components.tsx` 和 `src/components/article/mdx-components.tsx`，文章页不直接静态导入全部内容组件。

---

## 文章可用组件速查

以下组件已加入 MDX 白名单，可在任意文章中直接使用。只有正文实际出现的组件才会进入该文章的运行时映射和客户端加载链路。

### 通用交互组件

| 组件 | 用法示例 | 说明 |
|------|---------|------|
| `InlineExplanation` | `<InlineExplanation explanation="详细说明...">关键词</InlineExplanation>` | 点击关键词展开/收起行内解释块 |
| `BeforeAfter` | `<BeforeAfter before={<div>A</div>} after={<div>B</div>} beforeLabel="之前" afterLabel="之后" />` | 左右对比布局，支持自定义标签 |
| `Highlighter` | `<Highlighter color="#ffd1dc">文本</Highlighter>` | 基于 Rough Notation 的手绘高亮，支持 `action`（highlight/underline/circle/box）、`animationDuration`、`isView`（滚动触发） |
| `RAGSidesOverview` | `<RAGSidesOverview />` | RAG 索引侧与检索侧的手绘风格对照总览，用作文章中的概念视觉锚点 |

`TableOfContents` 与 `MusicPlayer` 由文章页面根据正文和 frontmatter 自动渲染，不是 MDX 标签。`Mermaid` 组件存在于 `src/components/ui/Mermaid.tsx`，但当前没有注册到 `mdxComponents`，因此不能直接在文章中使用。

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

### Agent / Function Calling（`content/components/agent/`）

| 组件 | 用法 | 说明 |
|------|------|------|
| `FunctionCallingSteps` | `<FunctionCallingSteps steps={[...]} />` | 多步骤 Agent 调用流程卡片，点击 `<>` 展开 Request/Response 代码 |

**完整示例：**

```mdx
<FunctionCallingSteps
  steps={[
    {
      step: 1,
      label: "OpenAI API",
      title: "Call the model with functions and the user's input",
      code: {
        request: `POST /v1/chat/completions
{
  "model": "gpt-4",
  "messages": [{"role": "user", "content": "What's the weather like in Boston?"}],
  "tools": [{"type": "function", "function": {"name": "get_weather"}}]
}`,
        response: `{
  "choices": [{
    "message": {
      "tool_calls": [{
        "function": {
          "name": "get_weather",
          "arguments": "{\"location\": \"Boston\"}"
        }
      }]
    }
  }]
}`
      }
    },
    {
      step: 2,
      label: "Third party API",
      title: "Use the model response to call your API",
      defaultOpen: true,
      code: {
        request: `curl https://weatherapi.com/v1/current.json?q=Boston`,
        response: `{"location": "Boston", "temperature": 22, "condition": "Sunny"}`
      }
    },
    {
      step: 3,
      label: "OpenAI API",
      title: "Send the response back to the model to summarize",
      code: {
        request: `POST /v1/chat/completions
{
  "model": "gpt-4",
  "messages": [
    {"role": "user", "content": "What's the weather like in Boston?"},
    {"role": "assistant", "tool_calls": [...]},
    {"role": "tool", "content": "{\"temperature\": 22, \"condition\": \"Sunny\"}"}
  ]
}`,
        response: `{"choices": [{"message": {"content": "The weather in Boston is sunny and 22°C."}}]}`
      }
    }
  ]}
/>
```

**Props：**

| Prop | 类型 | 必填 | 说明 |
|------|------|------|------|
| `steps` | `FunctionCallingStep[]` | 是 | 步骤数组 |
| `steps[].step` | `number` | 是 | 步骤序号 |
| `steps[].label` | `string` | 是 | 步骤标签，如 `"OpenAI API"` |
| `steps[].title` | `string` | 是 | 步骤标题 |
| `steps[].code.request` | `string` | 否 | Request 代码/内容 |
| `steps[].code.response` | `string` | 否 | Response 代码/内容 |
| `steps[].defaultOpen` | `boolean` | 否 | 是否默认展开 |

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
