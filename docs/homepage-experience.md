# 首页体验

首页由 `src/app/page.tsx` 渲染 `src/components/home/HomeExperienceClient.tsx`，是一个 **Three.js + GSAP ScrollTrigger** 驱动的 3D 滚动叙事页面。它取代了旧版 `HomeScrollExperience`，作为个人网站的正式首页。

---

## 整体结构

```
HomeExperienceClient
├── 固定 WebGL 舞台
│   ├── Three.js scene / camera / renderer
│   ├── GLB 模型、SVG 标题、HDRI/贴图资源
│   └── GSAP ScrollTrigger 驱动的镜头路径与物体动画
│
├── 首次加载遮罩
│   └── 根据 THREE.LoadingManager 进度显示「正在加载体验」
│
└── 滚动叙事轨道 (2500vh)
    ├── 技术频道入口
    ├── 案例/交互展示
    ├── 运动展示与评价卡片
    └── 收尾 CTA
```

---

## WebGL 舞台

- **资源目录**：`public/home-experience/`
- **组件目录**：`src/components/home/`
- **渲染方式**：客户端组件内初始化 Three.js，浏览器 API 必须隔离在 `"use client"` 组件中
- **加载状态**：`THREE.LoadingManager` 控制首屏加载遮罩，资源加载完成后隐藏
- **外部资源原则**：首页不应保留临时参考站点的品牌、文案或资源 URL

---

## 滚动叙事

- 页面使用一条长滚动轨道，通过多个 sticky section 触发 WebGL 镜头移动、模型显隐、HTML overlay 淡入淡出。
- 顶部品牌使用「且听松涛」，不显示临时实现名。
- 全局 `Navbar` 在首页隐藏，避免覆盖 3D 舞台；频道和博客页继续使用全局导航。
- 旧临时实验路由已移除，首页统一使用 `/`。

---

## 旧版首页组件的归宿

以下组件曾用于旧版区块式首页，现在已迁移至各自频道页使用：

| 组件 | 当前位置 |
|------|---------|
| `AboutMeSection` | 不再用于首页（可能已废弃或待重用） |
| `ProgrammerDetails` | `TechChannelLayout`（技术频道页） |
| `TravelSection` | `LifeChannelLayout`（生活频道页） |
| `ActiveDaysSection` / `GoalProgressGrid` | 活跃天数统计（可能用于频道页或已废弃） |
| `FootprintsSection` | 足迹地图（可能用于频道页或已废弃） |
| `RecentPosts` | 最新文章列表（可能用于频道页或已废弃） |

> 若需修改首页体验，直接编辑 `src/components/home/HomeExperienceClient.tsx` 与 `public/home-experience/` 下的资源。
