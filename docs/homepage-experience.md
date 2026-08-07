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
├── 阶段配置
│   └── homeTimeline.ts 统一维护滚动轨道、阶段区间与 DOM spacer 高度
│
├── 首次加载遮罩
│   └── 根据 THREE.LoadingManager 进度显示「正在加载体验」
│
└── 滚动叙事轨道（由 DOM 内容自然撑开）
    ├── Observe / Express / Create
    ├── 自我介绍
    ├── 频道入口
    ├── 探索更多专题内容
    ├── 最新文章
    └── 联系方式
```

---

## WebGL 舞台

- **资源目录**：`public/home-experience/`
- **组件目录**：`src/components/home/`
- **渲染方式**：客户端组件内初始化 Three.js，浏览器 API 必须隔离在 `"use client"` 组件中
- **加载状态**：`THREE.LoadingManager` 控制首屏加载遮罩，资源加载完成后隐藏
- **Create Gallery 资源**：`CreativeRingField` 使用 `public/home-experience/stages/create/cr-*.png` 中的 8 张图片，按配置顺序分别映射到 8 个 Gallery 面板
- **外部资源原则**：首页不应保留临时参考站点的品牌、文案或资源 URL

---

## 滚动叙事

- 页面使用由 DOM 内容自然撑开的滚动轨道，通过 sticky section、占位区间和 ScrollTrigger 触发 WebGL 镜头移动与模型显隐；承载正文、列表和链接的后段优先使用普通文档流。
- Create 之后的阶段依次承载「自我介绍」「频道入口」「探索更多专题内容」「最新文章」「联系方式」。自我介绍显示「我是阿松」与个人简介文案；频道入口先用普通文档流显示「进入不同内容路径」，再由 WebGL 中的 `Tech`、`Life`、`Finance`、`Creative` 四个 SVG 3D 文字组成频道队列；探索更多专题内容用 noomo awards list 的交互结构展示 `CHANNELS_CONFIG` 中 `featured: true` 的专栏，hover 条目时显示专栏首图；最新文章移植 noomo `Our Insights` 的 DOM list 结构，展示 `getSortedPostsData()` 中按日期排序的近期文章；联系方式阶段显示贴底页脚。
- 自我介绍、频道入口标题、探索更多专题内容、最新文章与联系方式使用普通文档流，像正常页面一样滑过；频道入口的 3D 文字队列由 ScrollTrigger 控制对应逻辑区间，并仅在该区间吸附到四个模型的正中展示态。
- `src/components/home/homeTimeline.ts` 是阶段边界的维护入口。普通 DOM section 的真实文档流位置必须在这里与 WebGL 逻辑区间对齐，避免内容提前进入上一段 3D 场景。
- 旧 Showcase、Reviews、Awards 的 WebGL 实现与专用资源已移除；Create → 自我介绍的横向过场结束后，相机与观察目标继续同步下移，再固定用于后续阶段。
- `Creative` 是首页频道入口的展示名，链接到 `/blog/creative`。
- 顶部品牌由全局透明 `Navbar` 提供，使用「大盈若冲」，不显示临时实现名。
- 全局 `Navbar` 在首页、频道和博客页统一显示；首页 WebGL 舞台不再额外渲染左上角品牌标识。
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
| `RecentPosts` | 旧版最新文章列表；首页当前使用 `src/components/home/HomeRecentPostsStage.tsx` |

> 若需修改首页阶段顺序、DOM 出现位置或滚动轨道长度，先改 `src/components/home/homeTimeline.ts`；若需修改相机、模型或材质，再编辑 `src/components/home/HomeExperienceClient.tsx` 与 `public/home-experience/` 下的资源。

阶段设计、资源边界与响应式策略详见 `docs/homepage-design.md`。
