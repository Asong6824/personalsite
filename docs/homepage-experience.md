# 首页体验

首页由 `src/app/page.js` 渲染单个组件 `HomeScrollExperience`，是一个 **GSAP ScrollTrigger** 驱动的全屏滚动叙事页面。

---

## 整体结构

```
HomeScrollExperience (500vh + 内容区)
├── Hero 区域 (500vh 滚动容器)
│   ├── 逐字动画标语（"Building digital experiences..."）
│   ├── 3D Orb 球体效果（随滚动缩放/旋转）
│   └── 滚动提示 + 频道入口卡片
│
└── 四频道 Scrollytelling (min-h-[80vh] × 4)
    ├── 左侧：文字介绍（sticky PhaseIndicator + 滚动触发动画）
    └── 右侧：视觉组件（sticky 随滚动切换）
```

---

## Hero 区域

- **高度**：`500vh`，由 ScrollTrigger 的 scrub 控制动画进度
- **文字动画**：4 行标语逐行淡入上浮，`wordRef` 在 timeline 45% 处完成放大
- **Orb 效果**：`orbRef` 随滚动从中心放大并淡出，由 `GradientOrb` 或 `HeroOrbSection` 提供视觉
- **卡片**：频道入口卡片在 Hero 末尾弹出，点击可跳转到对应频道

---

## Scrollytelling 区域

基于 `SECTIONS` 常量（定义在 `Scrollytelling/constants.jsx`），展示四个频道：

| 顺序 | ID | 标题 | 右侧视觉 |
|------|-----|------|---------|
| 01 | `tech` | 技术 | `VISUALS.tech` |
| 02 | `create` | 创造 | `VISUALS.create` |
| 03 | `life` | 生活 | `VISUALS.life` |
| 04 | `finance` | 金融 | `VISUALS.finance` |

- **左侧**：`PhaseIndicator` 固定在顶部，下方是滚动触发的文字内容（`scrolly-animate` 类由 GSAP 驱动）
- **右侧**：`VISUALS` 映射的组件固定在视口中，随左侧滚动切换透明度

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

> 若需修改首页体验，直接编辑 `HomeScrollExperience.jsx` 和 `Scrollytelling/` 子目录。
