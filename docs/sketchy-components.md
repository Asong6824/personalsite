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
| `fontFamily` | 系统字体栈 | 默认包含 `Excalifont`、`LXGW WenKai GB`、`Virgil` |
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
