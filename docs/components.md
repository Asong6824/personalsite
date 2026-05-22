# 组件组织

## 目录职责

- **`src/components/features/`**：页面级区块，如 `HeroSection`、`BlogAggregatedView`、`PostLayout`、`ChannelLayout`、`StockComparisonChart`、`TripRouteChart`。
- **`src/components/ui/`**：通用 UI 组件，如 `bento-grid`、`MusicPlayer`、`TableOfContents`、`BeforeAfter`、`Mermaid`、`globe`。
- **`src/components/finance/`**：金融频道专属大型组件，如 `TempoHero`、`TempoGrid`、`DataWall`。
- **`src/components/magicui/`**：特效/装饰性组件，如 `Highlighter`。
- **`content/components/`**：文章交互组件（可视化、图表、交互演示），按主题组织。与 `src/components/ui/` 的语义边界：`ui/` 是通用 UI 原语，`content/components/` 是领域知识可视化。

---

## MDX 自定义组件

`src/app/blog/[...slug]/page.jsx` 中通过 `next-mdx-remote/rsc` 注入自定义组件，供文章直接使用：

- `InlineExplanation` — 行内解释提示
- `BentoGrid` / `BentoGridItem` — 网格布局
- `BeforeAfter` — 前后对比滑块
- `Highlighter` — 文本高亮特效
- `HSBSliders` / `ColorWheelSteps` / `RotatableColorWheel` — 色彩工具（位于 `content/components/color/`）
- `DualTimeline` / `RAGFlowDiagram` — RAG 专用交互组件（位于 `content/components/rag/`）

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
| `Mermaid` | `<Mermaid chart="graph TD; A-->B;" />` | 渲染 Mermaid 图表，传 `chart` 字符串 |
| `WidthToggle` | `<WidthToggle />` | 文章页宽屏/窄屏阅读切换按钮 |

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
