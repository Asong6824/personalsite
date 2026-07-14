# Sketchy 手绘风格组件库

基于 [Rough.js](https://roughjs.com/)，参考 Excalidraw 参数风格的手绘 SVG 组件库。所有图形组件必须在 `<SketchySvg>` 容器内使用。

---

## 快速开始

```jsx
<SketchySvg width={400} height={300}>
  <SketchyRect x={50} y={50} width={100} height={80} fill="#fef9e9" />
  <SketchyArrow x1={160} y1={90} x2={250} y2={90} />
  <SketchyCircle cx={300} cy={90} diameter={60} fill="#ede9ce" />
  <SketchyText x={280} y={95} text="Hello" fontSize={14} />
</SketchySvg>
```

---

## 容器组件

### `<SketchySvg>`

所有 Sketchy 图形组件的父容器，基于 SVG 渲染。

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `width` | `number` | `800` | SVG 画布宽度（px） |
| `height` | `number` | `400` | SVG 画布高度（px） |
| `viewBox` | `string` | — | 自定义 viewBox，未传时按 width/height 计算 |
| `options` | `object` | `{}` | 全局默认绘制选项，覆盖 `DEFAULT_OPTIONS` |
| `className` | `string` | `""` | 额外 CSS 类 |
| `style` | `object` | `{}` | 内联样式 |
| `onMouseMove` / `onClick` | `function` | — | 鼠标事件回调 |

**全局预设风格**（通过 `options` 传入）：

```jsx
<SketchySvg width={400} height={300} options={SKETCHY_PRESETS.architect}>
  {/* 所有子组件继承 architect 风格 */}
</SketchySvg>
```

| 预设 | 特征 |
|------|------|
| `SKETCHY_PRESETS.architect` | `roughness: 0`，线条笔直，接近工程图 |
| `SKETCHY_PRESETS.artist`（默认） | `roughness: 1`，自然手绘感 |
| `SKETCHY_PRESETS.cartoonist` | `roughness: 2`，夸张漫画风 |

---

## 当前配色方案

本节记录技术频道与现有手绘图表的实际配色，作为后续统一色板和组件主题化的现状基线；这些颜色目前分散在频道 CSS 变量、Sketchy 默认配置及各业务图表内部，尚未收敛为单一配色 API。

### 技术频道基础色

技术频道采用低饱和暖灰的“纸张 + 墨色”体系。变量定义在 `src/app/globals.css` 的 `[data-tech-page]` 作用域内，文章详情页在 `src/components/article/article-channel-styles.ts` 中使用相同颜色。

| 角色 | CSS 变量 | 当前值 | 用途 |
|------|----------|--------|------|
| 页面纸张 | `--channel-bg` | `#F0EEE7` | 页面及文章背景 |
| 卡片纸色 | `--channel-card` | `#E2DBCE` | 卡片、标签和内容分区 |
| 卡片悬停 | `--channel-card-hover` | `#D8D0C3` | Hover 状态和较深层级 |
| 主墨色 | `--channel-ink` | `#141413` | 标题、正文、主要图形 |
| 次级墨色 | `--channel-muted` | `#68645D` | 注释、元数据、辅助文字 |
| 边框 | `--channel-border` | `#D8D0C3` | 分隔线和边框 |
| 强调色 | `--channel-accent` | `#141413` | 当前与主墨色一致 |

技术频道与生活频道、`.theme-warm-editorial` 当前共用这套基础变量，因此它首先承担全站暖色编辑风格，而非技术频道独占的品牌色。

### Sketchy 组件默认色

默认配置位于 `content/components/sketchy/config.js`：

| 角色 | 当前值 | 行为 |
|------|--------|------|
| 默认描边 | `#1A1A1A` | 所有未显式传入 `stroke` 的图形 |
| 默认填充 | `transparent` | 图形默认不铺底色 |
| 默认填充方式 | `hachure` | 传入填充色时采用手绘排线 |
| 默认文字 | `#1A1A1A` | `SketchyText` 的默认文字颜色 |
| 默认 Hover 描边 | `#3B82F6` | 可交互图形悬停时统一变蓝 |

默认描边与频道主墨色非常接近，但目前不是同一个变量；Sketchy 组件也不会自动从 `--channel-*` 变量读取颜色。

### 现有技术图表信息色

业务图表在暖纸张和墨色骨架上，按数据类别额外使用较高饱和度的信息色。

| 使用场景 | 颜色 | 当前语义 |
|----------|------|----------|
| RAG 演进时间线 | `#60A5FA` | 自然语言生成 |
| RAG 演进时间线 | `#FBBF24` | 大模型系统工程 |
| RAG 演进时间线 | `#FB923C` | RAG 工程 |
| RAG 演进时间线 | `#4ADE80` | 知识管理 |
| RAG 流程图 | `#F59E0B` / `#92400E` / `#FEFCE8` | 索引侧的描边、文字与区域底色 |
| RAG 流程图 | `#3B82F6` / `#1E40AF` / `#EFF6FF` | 检索侧的描边、文字与区域底色 |
| 上下文学习折线图 | `#3B82F6` / `#93C5FD` | 175B 模型的两组数据 |
| 上下文学习折线图 | `#F59E0B` | 13B 模型 |
| 上下文学习折线图 | `#22C55E` | 1.3B 模型 |
| Word2Vec 向量图 | `#2563EB` / `#DC2626` | 两组词语分类 |

辅助轴线和图注目前还会使用 Tailwind 中性灰，如 `#9CA3AF`、`#6B7280`、`#4B5563` 和 `text-gray-400`。RAG 流程图的节点内部使用纯白 `#FFFFFF`，与外围的暖色纸张形成层级。

### 当前配色层级

现有实现可以概括为三层：

1. 频道层使用暖灰纸张色建立整体阅读氛围。
2. Sketchy 基础层使用近黑色线条维持手绘墨稿感。
3. 业务图表层使用蓝、琥珀、橙、绿、红区分类别、阶段或数据系列。

新增或修改图表时，应先确认颜色属于频道界面层、通用手绘层还是业务数据层，避免把业务语义色直接提升为全局默认色。当前文档仅描述已有实现；统一信息色、对比度标准、色觉辅助编码及 Hover 语义将在后续配色规范中另行确定。

---

## 图形组件

### 公共 Props（所有图形组件均支持）

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `stroke` | `string` | `"#1a1a1a"` | 线条颜色 |
| `strokeWidth` | `number` | `1.5` | 线条粗细 |
| `roughness` | `number` | `1` | 手绘 rough 程度（0=笔直，2=最随意） |
| `bowing` | `number` | `1` | 线条弯曲程度 |
| `fill` | `string` | `"transparent"` | 填充颜色 |
| `fillStyle` | `string` | `"hachure"` | 填充样式：`hachure` / `solid` / `zigzag` / `cross-hatch` / `dots` / `sunburst` / `dashed` / `zigzag-line` |
| `hachureAngle` | `number` | `45` | 斜线填充角度 |
| `hachureGap` | `number` | `4` | 斜线填充间距 |
| `fillWeight` | `number` | `0.5` | 填充线粗细 |
| `seed` | `number` | — | 随机种子，固定后图形不再随机变化 |
| `className` / `style` | — | — | 标准 DOM 属性 |
| `hoverStroke` | `string` | `"#3b82f6"` | Hover 时线条颜色（默认蓝色） |
| `hoverStrokeWidthMultiplier` | `number` | `1.5` | Hover 时线条粗细倍数 |
| `onClick` / `onMouseEnter` / `onMouseLeave` | `function` | — | 交互事件 |

---

### `<SketchyLine>` — 直线

```jsx
<SketchyLine x1={50} y1={50} x2={200} y2={50} stroke="#888" strokeWidth={1} />
```

| 专属 Prop | 说明 |
|-----------|------|
| `x1`, `y1`, `x2`, `y2` | 起点与终点坐标（必填） |

---

### `<SketchyArrow>` — 箭头

```jsx
<SketchyArrow x1={50} y1={100} x2={200} y2={100} arrowSize={12} />
```

| 专属 Prop | 默认值 | 说明 |
|-----------|--------|------|
| `x1`, `y1`, `x2`, `y2` | — | 起点与终点坐标（必填） |
| `arrowSize` | `12` | 箭头两翼长度 |

---

### `<SketchyDashedLine>` — 虚线

```jsx
<SketchyDashedLine x1={50} y1={150} x2={200} y2={150} dashArray={[4, 3]} />
```

| 专属 Prop | 默认值 | 说明 |
|-----------|--------|------|
| `x1`, `y1`, `x2`, `y2` | — | 起点与终点坐标（必填） |
| `dashArray` | `[8, 6]` | 虚线模式 `[实线长度, 间隔长度]` |

---

### `<SketchyRect>` — 矩形

```jsx
<SketchyRect x={50} y={50} width={120} height={80} fill="#fef9e9" fillStyle="hachure" />
```

| 专属 Prop | 说明 |
|-----------|------|
| `x`, `y` | 左上角坐标（必填） |
| `width`, `height` | 宽高（必填） |

---

### `<SketchyCircle>` — 圆形

```jsx
<SketchyCircle cx={150} cy={150} diameter={80} fill="#ede9ce" />
{/* 或用 radius */}
<SketchyCircle cx={250} cy={150} radius={40} />
```

| 专属 Prop | 说明 |
|-----------|------|
| `cx`, `cy` | 圆心坐标（必填） |
| `diameter` | 直径（与 `radius` 二选一） |
| `radius` | 半径（优先于 `diameter`，默认 20） |

---

### `<SketchyEllipse>` — 椭圆

```jsx
<SketchyEllipse cx={200} cy={200} width={160} height={100} fill="#e8e4d0" />
```

| 专属 Prop | 说明 |
|-----------|------|
| `cx`, `cy` | 中心坐标（必填） |
| `width`, `height` | 外接矩形宽高（必填） |

---

### `<SketchyPath>` — 自定义路径

```jsx
<SketchyPath
  points={[{x:50,y:50}, {x:100,y:20}, {x:150,y:80}]}
  closed={true}
  fill="#f2eed7"
/>
```

| 专属 Prop | 默认值 | 说明 |
|-----------|--------|------|
| `points` | — | 点数组 `{x, y}[]`（必填，至少 2 个点） |
| `closed` | `false` | 是否闭合路径 |

---

### `<SketchyText>` — 手绘文字

```jsx
<SketchyText x={100} y={200} text="手绘文字" fontSize={16} color="#1a1a1a" />
```

| 专属 Prop | 默认值 | 说明 |
|-----------|--------|------|
| `x`, `y` | — | 文字基线坐标（必填） |
| `text` | — | 文字内容（必填） |
| `fontSize` | `14` | 字号 |
| `fontFamily` | 系统字体栈 | 默认包含 `Excalifont`、`LXGW WenKai GB` |
| `color` | `"#1a1a1a"` | 文字颜色 |
| `background` | — | 文字背景色（可选） |
| `backgroundPadding` | `{x:8, y:4}` | 背景内边距 |
| `hoverColor` | — | Hover 时文字颜色 |

---

## 组合示例

### 带交互的节点图

```jsx
<SketchySvg width={600} height={300} options={SKETCHY_PRESETS.artist}>
  {/* 节点 A */}
  <SketchyRect x={50} y={100} width={100} height={60} fill="#fef9e9" />
  <SketchyText x={75} y={135} text="节点 A" fontSize={13} />

  {/* 箭头 */}
  <SketchyArrow x1={160} y1={130} x2={240} y2={130} />

  {/* 节点 B */}
  <SketchyCircle cx={300} cy={130} diameter={70} fill="#ede9ce" />
  <SketchyText x={285} y={135} text="节点 B" fontSize={13} />

  {/* 虚线标注 */}
  <SketchyDashedLine x1={335} y1={130} x2={450} y2={130} dashArray={[5, 4]} />
  <SketchyText x={460} y={135} text="输出" fontSize={12} color="#6b7280" />
</SketchySvg>
```

### 固定随机种子（消除抖动）

```jsx
<SketchySvg width={400} height={200}>
  <SketchyRect x={50} y={50} width={100} height={80} seed={42} />
  <SketchyCircle cx={250} cy={90} diameter={60} seed={42} />
</SketchySvg>
```

> 固定 `seed` 后，每次渲染图形完全一致，适合需要稳定截图或打印的场景。
