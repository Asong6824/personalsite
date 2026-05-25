---
name: add-mdx-component
description: 为博客文章新增一个可在 MDX 中直接使用的交互/可视化组件。涉及组件放置位置判断、"use client" 检查、在 page.tsx 中注册。触发词："给文章加组件"、"新增 mdx 组件"、"文章里用这个组件"、"注册组件"。
---

# Add MDX Component — 新增文章可用组件

## 适用场景

- 用户希望文章中使用一个新的交互组件（图表、可视化、交互演示等）
- 用户想把现有组件从站点 UI 迁移到文章中可用
- 用户不确定新组件该放哪个目录

## 核心 Workflow

### Step 1：判断复用范围（这是最关键的一步）

```
该组件预计会被 2+ 篇文章使用吗？
  ├─ 是 → content/components/{topic}/
  │        例如：content/components/color/HSBSliders.jsx
  │        例如：content/components/rag/DualTimeline.jsx
  │        例如：content/components/sketchy/SketchySvg.jsx
  │
  └─ 否（仅一篇文章专属）→ content/blog/{slug}/components/
                         （注：动态加载机制暂未实现，目前暂放 content/components/{topic}/）
```

**已有 topic 目录参考：**

| topic | 已有组件 | 用途 |
|-------|----------|------|
| `color` | `HSBSliders`, `ColorWheelSteps`, `RotatableColorWheel` | 色彩工具 |
| `rag` | `DualTimeline`, `RAGFlowDiagram`, `SketchyRAGOverview` | RAG 可视化 |
| `sketchy` | `SketchySvg`, `SketchyRect`, `SketchyLine`, ... | 手绘风格组件库 |

> 若新组件属于全新 topic（如 `finance`、`map`、`animation`），新建 `content/components/{topic}/` 目录。

### Step 2：判断是否需要 `"use client"`

**必须添加 `"use client"` 的情况（任一满足即需添加）：**

- [ ] 使用了 `useState`, `useEffect`, `useRef`, `useMemo`, `useCallback` 等 React Hooks
- [ ] 使用了浏览器 API（`window`, `document`, `navigator`, `localStorage`, `requestAnimationFrame`）
- [ ] 使用了事件监听（`onClick`, `onMouseMove`, `onScroll`, `addEventListener`）
- [ ] 使用了 Three.js（`@react-three/fiber`, `@react-three/drei`）
- [ ] 使用了 GSAP / ScrollTrigger
- [ ] 使用了 Canvas / SVG 的交互绘制（如 Rough.js）
- [ ] 使用了 `framer-motion` 的 `motion` 组件或 `useAnimation`

**不需要 `"use client"` 的情况（纯 Server Component）：**

- 纯展示组件，只接收 props 并返回 JSX
- 只使用 Tailwind CSS 进行样式渲染
- 不涉及任何客户端交互或浏览器 API

> ⚠️ **这是项目"三条铁律"之一**。如果该加 `"use client"` 却没加，组件会在服务端渲染时报错（如 `window is not defined`）。

### Step 3：创建组件文件

**文件命名**：PascalCase，与组件名一致

```jsx
"use client";   // 仅在需要时添加

import { useState } from "react";

export function MyNewComponent({ data }) {
  const [active, setActive] = useState(false);
  
  return (
    <div className="...">
      {/* 组件实现 */}
    </div>
  );
}
```

**样式约定：**
- 使用 Tailwind CSS 类名
- 颜色参考对应频道的主题色（`tech` 用暖棕色系，`create` 用紫色系，`finance` 用绿色系）
- 复杂样式可用 `cn()` 工具函数合并类名

### Step 4：在 page.tsx 中注册

打开 `src/app/blog/[...slug]/page.tsx`，在 `mdxComponents` 对象中添加：

```tsx
import { MyNewComponent } from '@content/components/topic/MyNewComponent';

// ... 在 mdxComponents 对象中 ...
const mdxComponents = {
  // 已有组件...
  MyNewComponent: MyNewComponent,
  // 或简写：MyNewComponent,
};
```

> ⚠️ **常见遗漏**：新建组件后忘记在 `page.tsx` 中导入和注册，导致 MDX 中使用时报 "Component not found"。

### Step 5：验证

1. 在任意 MDX 文章中测试使用：
   ```mdx
   <MyNewComponent data={[1, 2, 3]} />
   ```
2. 运行 `npm run dev`，确认页面无报错
3. 检查控制台是否有 Hydration Error（通常是 `"use client"` 漏加导致的）

## 组件放置速查表

| 组件类型 | 放置位置 | 示例 |
|----------|----------|------|
| 色彩工具 | `content/components/color/` | `HSBSliders` |
| RAG 可视化 | `content/components/rag/` | `RAGFlowDiagram` |
| 手绘风格 | `content/components/sketchy/` | `SketchySvg` |
| 金融图表 | `content/components/finance/`（新建）| — |
| 地图/地理 | `content/components/map/`（新建）| — |
| 动画演示 | `content/components/animation/`（新建）| — |

## 路径别名

`jsconfig.json` 中已配置：

```json
{
  "compilerOptions": {
    "paths": {
      "@content/*": ["./content/*"]
    }
  }
}
```

导入方式：
```tsx
import { MyComponent } from '@content/components/topic/MyComponent';
```

## 常见错误

| 错误 | 现象 | 修复 |
|------|------|------|
| 忘记注册到 `page.tsx` | MDX 中使用时报错 "Component not found" | 在 `mdxComponents` 中添加 |
| 漏加 `"use client"` | `window is not defined` 或 Hydration Error | 文件顶部添加 `"use client"` |
| 组件放错目录（放 `src/components/`） | 文章归档后组件成为孤儿 | 按决策树迁移到 `content/components/` |
| 使用 `default export` | MDX 中无法识别 | 使用 `export function` 或 `export const` |
