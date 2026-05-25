---
name: add-site-component
description: 在站点中新增一个 UI 组件（页面级区块、通用组件、布局组件等）。涉及组件放置目录判断、Server/Client Component 选择、Tailwind 样式规范。触发词："新增组件"、"加个组件"、"新建组件"、"添加 UI 组件"、"写个组件"。
---

# Add Site Component — 新增站点 UI 组件

## 适用场景

- 用户要求新增一个页面区块（如 Hero、卡片、网格）
- 用户要求新增一个通用 UI 原语（如按钮、对话框、标签页）
- 用户要求新增布局组件（如导航栏、页脚）
- 用户要求新增特效/装饰性组件
- 用户不确定组件该放在 `src/components/` 下的哪个子目录

> ⚠️ **注意**：如果组件是**给文章用的**（在 MDX 中使用），请使用 `add-mdx-component` Skill，而非本 Skill。

## 核心 Workflow

### Step 1：组件放置决策树

```
1. 给页面级区块用的？（首页/频道页/专栏页/关于页）
   ├─ 首页/频道页/专栏页 ──→ src/components/features/
   ├─ 金融频道专属 ─────────→ src/components/finance/
   └─ 创作频道专属 ─────────→ src/components/create/

2. 全局 UI 原语？
   ├─ 通用交互/展示组件 ────→ src/components/ui/
   ├─ 布局（Navbar 等）──────→ src/components/layout/
   ├─ 特效/装饰性 ──────────→ src/components/magicui/
   └─ 调试辅助 ─────────────→ src/components/debug/
```

**目录速查表：**

| 目录 | 职责 | 典型示例 |
|------|------|----------|
| `src/components/features/` | 页面级区块，与特定页面共存 | `HeroSection`, `BlogAggregatedView`, `ColumnLayout`, `HomeScrollExperience` |
| `src/components/ui/` | 通用 UI 原语，跨页面复用 | `bento-grid`, `MusicPlayer`, `TableOfContents`, `BeforeAfter` |
| `src/components/finance/` | 金融频道专属 | `TempoHero`, `TempoGrid`, `DataWall` |
| `src/components/create/` | 创作频道专属 | `LiquidGlassWrapper`, `GlassCard` |
| `src/components/magicui/` | 特效/装饰性，纯视觉增强 | `Highlighter`, `rainbow-button` |
| `src/components/layout/` | 布局骨架，全局挂载 | `Navbar`, `WidthToggle` |
| `src/components/debug/` | 调试辅助，开发环境可见 | `PerformanceMonitor` |

> **关键区分**：`features/` 中的组件生命周期与页面绑定；`ui/` 中的组件是站点级基础设施。

### Step 2：命名规范

- **文件/组件名**：PascalCase，与功能语义一致
  - ✅ `HeroSection`, `StockComparisonCard`, `ChannelLayout`
  - ❌ `hero-section`, `component1`, `newComponent`
- **如果组件内部有子组件**：在同一文件中用 `function SubComponent` 定义，或创建同级文件 `ComponentName/SubComponent.tsx`

### Step 3：判断 Server vs Client Component

**默认假设：Server Component**

只有满足以下条件时才添加 `"use client"`：

- 使用了 React Hooks（`useState`, `useEffect`, `useRef` 等）
- 使用了浏览器 API（`window`, `document`, `localStorage`）
- 使用了事件监听（`onClick`, `onScroll` 等）
- 使用了动画库（Framer Motion, GSAP, Three.js）

> 详见 `client-component-guard` Skill 的完整检查清单。

**特殊场景：**
- `features/` 中的页面区块常需要客户端交互（滚动动画、状态切换），大概率需要 `"use client"`
- `ui/` 中的通用原语若纯展示则不需要
- `layout/` 中的导航栏通常需要 `"use client"`（响应式菜单、主题切换）

### Step 4：样式规范

**必须使用 Tailwind CSS**：

```tsx
// ✅ 正确
<div className="flex items-center gap-4 p-6 rounded-xl bg-white shadow-lg">

// ❌ 错误
<div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
```

**复杂类名合并**：使用 `cn()` 工具函数

```tsx
import { cn } from "@/lib/utils";

export function Card({ className, children }) {
  return (
    <div className={cn("rounded-xl border bg-white p-6 shadow-sm", className)}>
      {children}
    </div>
  );
}
```

**频道主题色参考**（当组件用于特定频道时）：

| 频道 | 主色调 | Tailwind 示例 |
|------|--------|---------------|
| `tech` | 暖棕色 `#a18072` | `text-[#a18072]`, `bg-[#f8f1ee]` |
| `create` | 紫色系 | `text-purple-300`, `bg-[#0a0a1a]` |
| `finance` | 墨绿色 `#506354` | `text-[#506354]`, `bg-[#fafaf5]` |
| `default` | 蓝色系 | `text-blue-600`, `bg-white` |

### Step 5：类型安全

- 使用 TypeScript，为 props 定义接口
- 优先使用 `interface` 而非 `type`
- 可选 props 用 `?` 标记，提供默认值

```tsx
interface HeroSectionProps {
  title: string;
  subtitle?: string;
  backgroundImage?: string;
}

export function HeroSection({ title, subtitle = "", backgroundImage }: HeroSectionProps) {
  // ...
}
```

### Step 6：验证

创建组件后检查清单：

- [ ] 组件放在正确的目录下
- [ ] 文件名为 PascalCase
- [ ] 使用了 `export function` 或 `export const`（非 default export）
- [ ] `"use client"` 判断正确（该加则加，不该加不加）
- [ ] 样式使用 Tailwind，复杂类名用 `cn()`
- [ ] Props 有 TypeScript 类型定义
- [ ] 在目标页面中导入并测试，确认无报错

## 常见错误

| 错误 | 后果 | 修复 |
|------|------|------|
| 把页面区块放 `ui/` 目录 | 页面和基础设施耦合 | 迁移到 `features/` |
| 把通用组件放 `features/` | 页面归档后组件成为孤儿 | 迁移到 `ui/` |
| 该加 `"use client"` 没加 | Hydration Error / SSR 报错 | 文件顶部添加 |
| 使用 `export default` | MDX 和其他模块导入时不一致 | 改为 `export function` |
| 内联 style 代替 Tailwind | 样式无法受益于主题切换和编译优化 | 全部改为 Tailwind 类名 |
| 组件名不规范 | 代码可读性下降 | 改为 PascalCase 语义化命名 |

## 快速参考

```tsx
// 标准站点组件模板
"use client"; // 仅在需要时添加

import { cn } from "@/lib/utils";

interface MyComponentProps {
  title: string;
  className?: string;
}

export function MyComponent({ title, className }: MyComponentProps) {
  return (
    <div className={cn("rounded-xl bg-white p-6", className)}>
      <h2 className="text-xl font-bold">{title}</h2>
    </div>
  );
}
```
