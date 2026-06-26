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
└── 滚动叙事轨道 (3800vh)
    ├── Observe / Express / Create
    ├── 自我介绍
    ├── 频道入口
    └── 联系方式
```

---

## WebGL 舞台

- **资源目录**：`public/home-experience/`
- **组件目录**：`src/components/home/`
- **渲染方式**：客户端组件内初始化 Three.js，浏览器 API 必须隔离在 `"use client"` 组件中
- **加载状态**：`THREE.LoadingManager` 控制首屏加载遮罩，资源加载完成后隐藏
- **Create Gallery 资源**：`CreateRingField` 使用 `public/home-experience/gallery-images/daying-ruochong-poster.png` 作为 8 张 4:5 海报面板的纹理
- **外部资源原则**：首页不应保留临时参考站点的品牌、文案或资源 URL

---

## 滚动叙事

- 页面使用一条 `3800vh` 长滚动轨道，通过 sticky section、占位区间和 ScrollTrigger 触发 WebGL 镜头移动、模型显隐、HTML overlay 淡入淡出。
- Create 之后的三个阶段依次承载「自我介绍」「频道入口」「联系方式」。自我介绍当前只保留阶段标题和留白容器；频道入口由 WebGL 中的 `TECH`、`LIFE`、`FINANCE`、`DESIGN` 四个 SVG 3D 文字组成，HTML 层只保留轻量标题和链接；联系方式阶段显示贴底页脚。
- 三个信息阶段使用固定视口叠加层，不参与文档流移动；ScrollTrigger 仅在各自逻辑区间内显示它们，避免自我介绍卡片提前穿过 Create 阶段。
- 旧 Showcase、Reviews、Awards 的 WebGL 内容已停用，不再加载 showreel、评价卡、奖项图片与奖杯模型；Create → 自我介绍的横向过场结束后，相机与观察目标继续同步下移，再固定用于后续阶段。
- `DESIGN` 是首页频道入口的展示名，当前仍链接到 `/blog/create`；如需把 `create` 频道 key 和路由整体迁移为 `design`，需要另行处理配置、路由、文章 frontmatter、测试和重定向。
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

阶段设计、资源边界与响应式策略详见 `docs/homepage-design.md`。
