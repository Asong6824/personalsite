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
