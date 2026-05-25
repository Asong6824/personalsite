---
name: client-component-guard
description: 强制检查 React 组件是否需要添加 "use client" 指令。触发词："use client"、"这个组件要加 use client 吗"、"服务端渲染报错"、"window is not defined"、"hydration error"。
---

# Client Component Guard — 客户端组件安全检查

## 适用场景

- 用户新建或修改了一个组件，不确定是否需要 `"use client"`
- 控制台出现 `window is not defined`、`document is not defined` 等 SSR 报错
- 控制台出现 React Hydration Error（水合错误）
- 使用了 Three.js、GSAP、Canvas、动画库等浏览器端 API

## 核心规则

> **项目"三条铁律"之一**：`window` / `document` / Three.js 等浏览器 API 必须包在 `"use client"` 组件内。

## 检查清单

新建或修改组件时，必须逐一检查以下项目。只要**满足任意一条**，就必须在文件**最顶部**添加 `"use client"`：

### 必须添加 `"use client"` 的情况

- [ ] **React Client Hooks**：使用了 `useState`, `useEffect`, `useRef`, `useMemo`, `useCallback`, `useContext`, `useReducer`, `useLayoutEffect`, `useId`
- [ ] **浏览器全局对象**：直接或间接访问了 `window`, `document`, `navigator`, `location`, `localStorage`, `sessionStorage`, `history`
- [ ] **DOM API**：使用了 `document.getElementById`, `document.querySelector`, `addEventListener`, `removeEventListener`, `MutationObserver`, `IntersectionObserver`, `ResizeObserver`
- [ ] **事件处理**：组件上有事件处理器（`onClick`, `onMouseMove`, `onScroll`, `onChange`, `onSubmit`, `onKeyDown` 等）
- [ ] **Three.js**：使用了 `@react-three/fiber`, `@react-three/drei`, `three` 的任何对象
- [ ] **GSAP / ScrollTrigger**：使用了 `gsap`, `ScrollTrigger`, `ScrollSmoother`, `SplitText`
- [ ] **Framer Motion**：使用了 `motion` 组件（如 `motion.div`）、`AnimatePresence`、`useAnimation`、`useInView`
- [ ] **Canvas / SVG 交互**：使用了 HTML5 Canvas API（`getContext('2d')` / `getContext('webgl')`）、Rough.js 的交互绘制
- [ ] **定时器**：使用了 `setTimeout`, `setInterval`, `requestAnimationFrame`
- [ ] **网络请求（客户端）**：使用了 `fetch` 在 `useEffect` 中发起请求
- [ ] **第三方客户端库**：使用了 `react-tweet`, `fullpage.js`, `react-scan` 等明确需要浏览器环境的库

### 不需要添加 `"use client"` 的情况

以下情况**严禁添加** `"use client"`，应保持为 Server Component：

- [ ] 纯展示组件，只接收 props 并返回 JSX
- [ ] 只使用 Tailwind CSS 进行样式渲染
- [ ] 只使用了服务端数据获取（`async/await` 在 Server Component 中直接获取数据）
- [ ] 只使用了 React 的 Server 功能（如 Server Actions 的调用端）
- [ ] 子组件如果需要 `"use client"`，应单独提取，而不是让整个父组件变成 Client Component

## 检查 Workflow

```
1. 读取用户要创建/修改的组件代码
2. 逐行扫描 import 语句和代码体
3. 对照上方"必须添加"清单，打勾检查
4. 若任意一条命中 → 文件最顶部添加 "use client"
5. 若全部未命中 → 确认不添加，保持 Server Component
6. 若用户代码调用了其他子组件 → 递归检查子组件
```

## 操作示例

### ✅ 正确示例 1：需要 `"use client"`

```tsx
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export function AnimatedCard({ children }) {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: isVisible ? 1 : 0 }}
      onClick={() => console.log("clicked")}
    >
      {children}
    </motion.div>
  );
}
```

触发原因：`useState`, `useEffect`, `setTimeout`, `framer-motion`, `onClick` —— 5 条命中。

### ✅ 正确示例 2：需要 `"use client"`（Three.js）

```tsx
"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

export function GlobeScene() {
  return (
    <Canvas>
      <OrbitControls />
      <mesh>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial color="blue" />
      </mesh>
    </Canvas>
  );
}
```

触发原因：`@react-three/fiber`, `@react-three/drei` —— 2 条命中。

### ✅ 正确示例 3：不需要 `"use client"`

```tsx
// 没有 "use client"

import Image from "next/image";

export async function PostHeader({ slug }) {
  const post = await getPostData(slug); // 服务端数据获取
  
  return (
    <header className="mb-8">
      <h1 className="text-3xl font-bold">{post.title}</h1>
      <p className="text-gray-500">{post.date}</p>
      <Image src={post.cover} alt={post.title} width={800} height={400} />
    </header>
  );
}
```

未触发原因：纯展示 + 服务端数据获取 + 无交互。

### ❌ 错误示例：该加没加

```tsx
// 漏掉了 "use client"！

import { useState } from "react"; // ❌ useState 需要客户端环境

export function Counter() {
  const [count, setCount] = useState(0); // ❌ 运行时报错
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}
```

报错：`Error: useState only works in Client Components. Add the "use client" directive at the top of the file.`

### ❌ 错误示例：不该加却加了

```tsx
"use client"; // ❌ 多余！

export function StaticBadge({ label }) {
  return <span className="px-2 py-1 bg-blue-100 rounded">{label}</span>;
}
```

后果：本可服务端渲染的组件被强制客户端渲染，增加了不必要的 JS bundle。

## 常见报错对照表

| 报错信息 | 原因 | 修复 |
|----------|------|------|
| `window is not defined` | SSR 时访问了 `window` | 添加 `"use client"` |
| `document is not defined` | SSR 时访问了 `document` | 添加 `"use client"` |
| `localStorage is not defined` | SSR 时访问了 `localStorage` | 添加 `"use client"` |
| `useState only works in Client Components` | 在 Server Component 中用了 Hook | 添加 `"use client"` |
| `Hydration failed` / `Text content does not match` | 服务端和客户端渲染结果不一致 | 检查是否漏加 `"use client"`，或条件渲染逻辑不一致 |
| `Canvas is not a valid Server Component` | Three.js Canvas 在服务端渲染 | 添加 `"use client"` |

## 子组件传播规则

```
Parent (Server Component)
  └─ ChildA (Client Component) ← 有 "use client"
      └─ ChildB ← 不需要再加 "use client"，自动继承客户端环境
      └─ ChildC ← 同上

Parent (Server Component)
  └─ ChildA (Server Component)
      └─ ChildB (Client Component) ← 需要 "use client"
```

> 只有**直接文件**需要 `"use client"`，被 Client Component 导入的子组件自动处于客户端环境。

## 快速口诀

> **有 Hook、有事件、有浏览器 API、有动画库 → 加 `"use client"`**
> 
> **纯展示、纯数据、纯样式 → 不加**
