# HeroSection — Canvas Color Wheel "o" 实现规格

## 上下文

重构首页 HeroSection 的核心元素：将 CSS AnimatedOrb 替换为 Canvas 2D 渲染的纯色色轮 "o"。色轮是 HeroSection 动画的关键——在 Phase 1-2 作为 "asong" 中的字母 "o"，在 Phase 3 快速膨胀扩展为全屏背景的起点。

**目标**：解决当前 CSS `conic-gradient` 导致的颜色浑浊问题，获得纯净、饱和的纯色过渡。

## 设计语言

### 色轮颜色（纯色，高饱和度）

| 名称 | Hex | 用途 |
|------|-----|------|
| Blue | `#4A90D9` | 色轮第一段 |
| Orange | `#FF8C42` | 色轮第二段 |
| Yellow | `#FFD93D` | 色轮第三段 |
| Pink | `#FF6B9D` | 色轮第四段 |

**关键**：颜色必须纯净（高饱和度，无浑浊中间色），段与段之间**硬边界**（无渐变过渡）。

### 色轮动画阶段

| Phase | Scroll Progress | 色轮行为 |
|-------|-----------------|----------|
| 1 | 0% - 20% | 色轮持续旋转（60rpm），scale = 1x，作为 "o" 字母 |
| 2 | 20% - 40% | 旋转减速，scale 从 1x → 1.4x 与文字同步放大 |
| 3 | 40% - 55% | **临界点** — 色轮 scale 快速膨胀至 fill screen，旋转骤停 |
| 4 | 55%+ | 色轮膨胀覆盖全屏，颜色继续作为 FlowBackground 的基础色 |

### 旋转速度曲线

- Phase 1: 匀速旋转，60rpm
- Phase 2: 旋转速度线性减速至 0
- Phase 3+: 停止旋转

---

## 技术方案

### 组件结构

```
HeroSection/
├── ColorWheelCanvas.jsx    # Canvas 2D 色轮，旋转 + scale 动画
├── shaders/
│   └── (WebGL 后续在 Spec 2)
└── HeroSection.jsx         # 重构后调用 ColorWheelCanvas
```

### ColorWheelCanvas 实现

**文件**: `src/components/features/HeroSection/ColorWheelCanvas.jsx`

使用 Canvas 2D API 绘制纯色色轮：

```javascript
// 色轮参数
const COLORS = ['#4A90D9', '#FF8C42', '#FFD93D', '#FF6B9D'];
const SEGMENTS = 4;  // 4 段纯色，无渐变过渡

// 绘制逻辑
ctx.beginPath();
for (let i = 0; i < SEGMENTS; i++) {
    const startAngle = (i / SEGMENTS) * 2 * Math.PI + rotation;
    const endAngle = ((i + 1) / SEGMENTS) * 2 * Math.PI + rotation;
    ctx.fillStyle = COLORS[i];
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, startAngle, endAngle);
    ctx.fill();
}
```

### Props 接口

```typescript
interface ColorWheelCanvasProps {
    size: number;           // 画布尺寸（px）
    scale: number;          // scale transform (0.5 ~ 80)
    rotation: number;      // 旋转角度（rad），由 useTransform 驱动
    opacity: number;        // 透明度 0-1
    className?: string;
}
```

### Scroll 驱动

```javascript
// HeroSection.jsx 中的 useTransform
const colorWheelRotation = useTransform(scrollYProgress, [0, 0.40], [0, Math.PI * 4]);
const colorWheelScale = useTransform(scrollYProgress, [0, 0.18], [1, 1.4]);  // Phase 2
const colorWheelExpand = useTransform(scrollYProgress, [0.40, 0.55], [1.4, 80]);  // Phase 3 explosion
const colorWheelOpacity = useTransform(scrollYProgress, [0.55, 0.65], [1, 0]);  // Fade out after expansion
```

---

## 文件变更

### 新建

- `src/components/features/HeroSection/ColorWheelCanvas.jsx`

### 修改

- `src/components/features/HeroSection.jsx` — 移除 AnimatedOrb，引入 ColorWheelCanvas

---

## 成功标准

1. 色轮四段颜色纯净，无浑浊中间色
2. 色轮作为 "o" 字母视觉一致
3. Phase 3 临界点膨胀感觉像"爆炸"而非渐变
4. 60fps 流畅旋转，无卡顿
5. SSR 兼容（动态导入或客户端渲染）

---

## 依赖

- 纯 Canvas 2D API，无外部依赖
- Framer Motion `useTransform` 用于 scroll 驱动
