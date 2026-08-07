# 首页设计文档

本文描述当前正式首页，而不是旧版 `HomeScrollExperience`。实现入口为 `src/app/page.tsx`，核心组件为 `src/components/home/HomeExperienceClient.tsx`。

---

## 一、设计定位

首页不是传统频道导航页，而是一段由滚动驱动的 WebGL 叙事。视觉主线是「观察 → 表达 → 创造」，随后进入自我介绍、频道入口、探索更多专题内容、最新文章与联系方式。

- 品牌：大盈若冲
- 基础背景：站点统一米色 `#F0EEE7`。首页 WebGL 背景贴图使用 `public/home-experience/backgrounds/stage.webp`，页面外层、加载遮罩与 Three.js `scene.background` 也必须使用同一背景色常量。
- 主文字：深蓝黑 `#0a0c20`
- 渲染技术：Three.js
- 时间线与滚动：GSAP + ScrollTrigger
- 资源类型：GLB、SVG、HDRI、位图与运行时 CanvasTexture

首页显示全局透明 `Navbar`，左右入口贴近视口两侧；WebGL 舞台不再额外渲染左上角品牌标识，避免重复导航入口。

---

## 二、页面结构

```text
src/app/page.tsx
└── HomeExperienceClient
    ├── Loading Screen
    ├── 固定 WebGL Canvas
    ├── HTML/SVG 叠加层
    │   ├── ObserveSignalField
    │   ├── ExpressConnectionField
    │   └── CreativeRingField
    ├── homeTimeline.ts 阶段配置
    └── 由 DOM 内容自然撑开的滚动轨道
        ├── Hero
        ├── Observe
        ├── Express
        ├── Create
        ├── 自我介绍
        ├── 频道入口
        ├── 探索更多专题内容
        ├── 最新文章
        └── 联系方式
```

WebGL Canvas 固定覆盖视口；滚动容器由 DOM 内容自然撑开，并提供时间轴进度和普通 DOM section 的真实文档流位置。大部分空间变化通过移动相机、look-at 目标和场景对象完成；需要承载正文、列表或链接的阶段优先使用普通 DOM 文档流。

---

## 三、叙事阶段

### Hero

- 加载完成后显示场景与标题。
- 首屏使用 `startTitle.svg`，品牌文字由固定 HTML 层显示。
- 页面本身不承担传统 Hero 文案列表。

### Observe

- 相机从远景进入第一个观察位置。
- `ObserveSignalField` 以准星和信号卡表达信息采集。
- 对应标题资源为 `observe.svg`。

### Express

- 相机继续沿预设路径移动。
- `ExpressConnectionField` 展示由中心表达节点向文章、界面、图像和系统扩散的关系网络。
- 连线与节点按层级逐步出现，对应标题资源为 `express.svg`。

### Create

- `CreativeRingField` 使用独立 Three.js 场景展示 8 张 4:5 海报面板组成的 Gallery 环。
- 当前海报资源为 `public/home-experience/stages/create/poster.webp`，8 个面板复用同一个 `THREE.Texture`。
- 主场景中的 Create 标题会缩放并暂时停靠，为后续展示让出空间。
- 对应标题资源为 `titles/create.svg`。

### 自我介绍

- 复用原 Showcase 阶段的镜头区间，展示个人简介排版。
- Create → 自我介绍的横向过场完成后，相机与观察目标继续同步下移 2 个世界单位，避开视口顶部残留的 Create 标题；到达自我介绍终点后，后续阶段不再移动视角。
- 自我介绍是普通文档流中的 `min-h-screen` section，不使用 GSAP fixed overlay 或 pin；它的 DOM 起点由 `homeTimeline.ts` 对齐到逻辑深度 `2505`，避免在 Express / Create 阶段提前出现。
- 当前文案以「我是阿松」为身份标题，正文说明对新技术、旅行、收集和数字花园的关注。
- 原 showreel 平面及播放、静音模型已停用。

### 频道入口

- 复用原 Reviews 阶段的镜头区间，在主 WebGL 场景中展示频道文字队列。
- 频道入口 3D 文字队列在逻辑区间 `2535–2935` 显示；相机在 `2555–2640` 进入频道视角，让提示文案之后更快接上 WebGL 模型，减少空白等待。
- 四个频道入口为 `Tech`、`Life`、`Finance`、`Creative`，其中 `Creative` 链接到 `/blog/creative`。
- 频道文字使用本地 `PP Model Sans Medium` 字体导出的静态 SVG，文件位于 `public/home-experience/titles/channels/*.svg`；加载后转换为 `ExtrudeGeometry`。布局仿照 Noomo awards rail：每个词使用固定 authored position，整体 rail 保留 Noomo 的 `11.5` 世界单位位移幅度，并针对 SVG 字体基线增加 `+1.8` 垂直校准，因此从 `y=8.3` 上移到 `19.8`；rail 比相机更早启动，`Tech` 正中时相机进度约 `80%`，实际投影仍接近屏幕中心，每个词有独立的中心窗口用于 rotation 归正、透明度增强和缩放。
- 频道轨道仅在该逻辑区间启用 ScrollTrigger snap；用户停止滚动后，页面以短时缓动吸附到 `0.22 / 0.38 / 0.58 / 0.78` 四个模型中心点，其他首页阶段保持自由滚动。
- HTML 层使用普通文档流 section 显示「Channels / 进入不同内容路径」，内部 sticky 居中停留，标题样式与「Columns / 探索更多专题内容」一致；`ChannelRailLinks` 只在 3D 频道文字接近正中时，于模型投影区域叠加完全透明的可访问按钮。hover 或键盘聚焦该区域时，当前模型轻微摆动；点击后先播放向右推页的过渡动画，再跳转到对应频道。
- 原评价标题、3D 评价卡与评价文案已停用。

### 探索更多专题内容

- 移植 noomo awards list 的列表阶段，用于展示本站配置为 `featured: true` 的专栏。
- 探索更多专题内容是普通文档流中的 `h-screen` section，不使用 GSAP fixed overlay 或 pin；它前面保留真实滚动间隔，并由频道入口 WebGL 组在末段继续上移、整体淡出，避免重叠。
- 数据来自 `CHANNELS_CONFIG`，每一行链接到 `/blog/{channelKey}/{columnKey}`；当前精选为 `life/japan` 与 `creative/design`。
- hover 或键盘 focus 列表条目时，在列表容器内显示并移动对应专栏 `cover` / `coverImage`；未配置专栏首图时回退到频道 `icon` 或站内占位图。

### 最新文章

- 移植 noomo `Our Insights` 的普通 DOM list 结构，用于展示最近文章入口。
- 数据在 `src/app/page.tsx` 中通过 `getSortedPostsData()` 获取，按 `date` 降序排序后传给 `HomeExperienceClient`；客户端展示组件不读取文件系统或文章索引。
- 区块提示为「Articles / 抵达最新文章前沿」，标题样式与「Channels / 进入不同内容路径」和「Columns / 探索更多专题内容」保持一致；右侧提供「查看全部」入口链接到 `/blog`。
- 每条文章使用左图右文横向布局：封面图、标签 pills、hover 时的 `Read` 遮罩、标题、专栏名与日期。无文章封面时回退到专栏封面、频道 icon 或 `images/placeholders/default.svg`。

### 联系方式

- 作为滚动叙事终点，复用频道入口完成后的固定视角。
- 页脚是普通 DOM section，直接跟在最近文章区之后，不再通过 fixed overlay 或 ScrollTrigger 延迟出现。
- 页脚仿照 Noomo 的低密度两栏排版：左侧复用 Navbar 的主导航与站点名，右侧预留友链区域，并保留简短说明与版权信息。
- 不使用卡片容器；导航、友链、品牌和版权直接排版在背景上。
- 原奖项图片、奖杯模型、漂浮装饰及 Footer CTA 已停用。

---

## 四、滚动与动画系统

下表是首页唯一的 WebGL 滚动时间线说明。表内区间是传给 `getScrollDepth()` 的**逻辑深度**，不是直接的 `vh`。实际触发位置按 `min(viewportWidth × n / 100, viewportHeight × n / 100)` 换算为像素。代码中的 `CREATE_RING_SCROLL_OFFSET = 760` 已在表内展开。

相机坐标格式为 `(x, y, z)`；“观察目标”是每帧传给 `camera.lookAt()` 的 `lookTarget`。除特别注明外，滚动动画均为 `scrub: true`，相机与观察目标使用 `power2.inOut`。

| 阶段 / 对象 | 逻辑区间 | 距离 | 相机位置 from → to | 观察目标 from → to | 同期滑动变化与说明 |
|---|---:|---:|---|---|---|
| Observe：主镜头 | `0–200` | 200 | `(2.093, -4.505, 44.601)` → `(-2.484, 3.733, 30.641)` | `(4.093, -7.005, 0.601)` → `(7.958, -0.550, 1.019)` | 背景位置由 `(4, -25, -20)` 移至 `(16, -16, -20)`，同时绕 Y 轴旋转至 `-0.87266`。 |
| Observe：标题停靠 | `205–285` | 80 | 保持上一镜头终点 | 保持上一目标终点 | `observeGroup` 从主展示位置移动并缩小到停靠状态。 |
| Observe：信号层 | `245–610` | 365 | 固定 | 固定 | `ObserveSignalField` 依次显示准星与信号卡，接近区间末尾时淡出。 |
| Express：主镜头 | `625–820` | 195 | `(-2.484, 3.733, 30.641)` → `(0.783, 14.749, 13.300)` | `(7.958, -0.550, 1.019)` → `(15.777, 12.603, -0.428)` | 镜头从 Observe 区域抬升并向 Express 网络靠近。 |
| Express：标题停靠 | `825–905` | 80 | 保持上一镜头终点 | 保持上一目标终点 | `expressGroup` 移动并缩小，为关系网络让出视野。 |
| Express：关系网络 | `875–1370` | 495 | 固定 | 固定 | `ExpressConnectionField` 按层级绘制中心节点、边和外围节点；图完全展开后保留一段完整态停顿，再淡出。 |
| Create：主镜头 | `1385–1580` | 195 | `(0.783, 14.749, 13.300)` → `(4.024, 22.301, 7.031)` | `(15.777, 12.603, -0.428)` → `(17.443, 20.712, 0.431)` | 镜头继续上移并进入 Create 标题与卡片区域。 |
| Create：标题停靠 | `1585–1665` | 80 | 保持上一镜头终点 | 保持上一目标终点 | `createGroup` 移至停靠坐标并缩放；桌面缩至 `0.54`，移动端缩至 `0.68`。 |
| Create：Gallery 可见 | `1640–2090` | 450 | 固定 | 固定 | `CreativeRingField` 进入时淡入、离开时淡出。 |
| Create：Gallery 运动 | `1665–2065` | 400 | 固定 | 固定 | 图片面板按 `appear / zoom / vertical` 三段参数显现、环绕旋转并向上退出；该阶段使用子组件自己的 Three.js 相机。 |
| Create：标题复位 | `2090–2175` | 85 | 固定 | 固定 | `createGroup` 从停靠位置回到主位置并恢复为 1 倍缩放。 |
| Create → 自我介绍：过场镜头 | `2305–2500` | 195 | `(4.024, 22.301, 7.031)` → `(23.346, 20.432, 2.102)` | `(17.443, 20.712, 0.431)` → `(23.342, 20.293, 1.263)` | 对应源码 `1545–1740 + 760`，横向跨越场景进入个人信息区域。 |
| 自我介绍：向下调整 | `2505–2555` | 50 | `(23.346, 20.432, 2.102)` → `(23.346, 18.432, 2.102)` | `(23.342, 20.293, 1.263)` → `(23.342, 18.293, 1.263)` | 相机与观察目标同步下移，保持观察角度；HTML 层的个人简介作为一屏文档流 section 自然滑过。 |
| 频道入口：接近频道队列 | `2555–2560` | 5 | `(23.346, 18.432, 2.102)` → `(23.312, 14.160, 4.024)` | `(23.342, 18.293, 1.263)` → `(23.292, 14.010, 2.097)` | 在个人简介尾段开始切入频道文字队列，避免 DOM 文案提前而 WebGL 模型仍留在旧位置。 |
| 频道入口：相机到位 | `2555–2640` | 85 | `(23.312, 14.160, 4.024)` → `(23.292, 11.443, 4.236)` | `(23.292, 14.010, 2.097)` → `(23.272, 11.293, 2.309)` | 相机在频道提示出现前后快速到位，`Tech` 正中时相机进度约 `80%`。 |
| 频道入口：频道文字队列 | `2535–2935` | 400 | 固定 `(23.292, 11.443, 4.236)` | 固定 `(23.272, 11.293, 2.309)` | `Tech`、`Life`、`Finance`、`Creative` 四个 SVG 3D 文字按固定 rail 位置 `0 / -2 / -4.5 / -7` 排布；整体 rail 从 `8.3` 上移到 `19.8`，每个词在独立中心窗口内归正并增强。 |
| 探索更多专题内容：自然滚动列表 | 文档流 | 100vh | 固定 `(23.292, 11.443, 4.236)` | 固定 `(23.272, 11.293, 2.309)` | HTML 层显示 `featured: true` 的专栏列表；不使用 GSAP overlay 时间线，hover 或 focus 条目时显示专栏首图。 |
| 最新文章：自然滚动列表 | 文档流 | 内容自适应 | 固定 `(23.292, 11.443, 4.236)` | 固定 `(23.272, 11.293, 2.309)` | HTML 层显示最近文章列表；移植 noomo `Our Insights` 的标题、图片、标签与文章元信息结构。 |
| 联系方式：普通 DOM 页脚 | 文档流 | 内容自适应 | 固定 `(23.292, 11.443, 4.236)` | 固定 `(23.272, 11.293, 2.309)` | HTML 层显示页脚，直接跟在最近文章区之后；不使用 fixed overlay 或 ScrollTrigger 显隐。 |

相机区间之间没有插值时，相机和 `lookTarget` 保持上一阶段终点。所有视口执行 Observe、Express、Create、post-create、自我介绍与频道入口位移；频道入口完成后，探索更多专题内容、最新文章与联系方式复用该固定视角，三者都按文档流自然滑过。

### CreativeRingField 子相机时间线

`CreativeRingField` 在固定 HTML 叠加层内创建独立 Three.js 场景，不使用首页主相机。它的子相机初始为 `PerspectiveCamera(70, viewportAspect, 0.01, 100)`，初始位置为 `(0, 0, 10)`；画面构图由 `displayGroup` 统一处理，桌面端当前缩放为 `(0.67, 0.67, 1)`，位置为 `(0, -0.5, 0)`。

滚动进度先由 `ScrollTrigger` 折算为 `progress: 0–1`，再进入 `galleryStageFromProgress(progress)` 拆为 `appear / zoom / vertical`。对应源码区间是 `1525–1925 + CREATE_STAGE_SCROLL_OFFSET`，即主表中的 `1665–2065`。

| 子阶段 / 参数 | progress 区间 | 输出范围 | 影响对象 | 变化与说明 |
|---|---:|---:|---|---|
| 显现预热：`appear` | `0–0.08` | `0 → 0.1` | 面板 shader `uOpacity` | 中心面板先出现，作为 Gallery 入场锚点。 |
| 显现展开：`appear` | `0.20–0.58` | `0.1 → 1` | 面板 shader `uOpacity` | 其余面板按 `distFromCenter`、`panelStagger = 0.06` 和 `panelFadeDuration = 0.08` 逐步显现。 |
| 视角推进：`zoom` | `0.34–0.82` | `0 → 1`，`easeInOutCubic` | 子相机与 `tiltGroup` | `camera.position.z` 从 `0` 插值到 `8`；`tiltGroup.rotation.x` 从 `0` 到 `1`；`tiltGroup.rotation.y` 从 `0` 到 `π`。 |
| 上移退出：`vertical` | `0.76–1.00` | `0 → 1`，`easeInOutCubic` | `tiltGroup.position.y` 与 `rotation.y` | `tiltGroup.position.y = vertical × viewportHeight`，同时 `rotation.y` 额外增加 `vertical × π`，形成向上抬离并继续转出的效果。 |

`setZoom(1)` 会把子相机 FOV 从 `70` 收到 `66.5`，作为该子场景的常态视角；随后 `update()` 每帧按 `zoom` 修改相机 Z 轴位置和 `tiltGroup` 旋转。也就是说，Create Gallery 的运动主要来自子场景相机与 `tiltGroup`，而不是移动首页主相机或逐张移动海报面板。

当前 DOM 滚动轨道由实际 section 与 spacer 自然撑开，而逻辑深度使用 `getScrollDepth()` 转换，两者不是同一个单位系统。阶段边界与 DOM spacer 集中在 `src/components/home/homeTimeline.ts`；修改任一区间时，需要同时检查：`homeTimeline.ts`、`cameraStages`、`targetStages`、对象 ScrollTrigger、显隐阈值和 `CreativeRingField` 子时间线。

### DOM 文档流对齐

普通 DOM 阶段不靠 GSAP 显隐，而是靠真实文档流进入视口。当前对齐关系如下：

| DOM 阶段 | 文档流起点 | 对应 WebGL 区间 | 维护字段 |
|---|---:|---:|---|
| 自我介绍 | `2505vh` | `2505–2605` DOM，`2505–2555` WebGL | `HOME_DOM_LAYOUT.aboutLeadSpacerVh`、`aboutSectionVh` 与 `HOME_STAGE_SCROLL.about` |
| 频道入口标题 | `2560vh` 视觉入场，`2610vh` 文档流起点 | `2560–2660` DOM，`2535–2935` WebGL rail | `HOME_DOM_LAYOUT.channelLeadSpacerVh`、`channelIntroOverlapVh`、`channelIntroSectionVh`、`HOME_STAGE_SCROLL.channelCamera` 与 `HOME_STAGE_SCROLL.channels` |
| 探索更多专题内容 | `2935vh` | 文档流 | `HOME_DOM_LAYOUT.channelRailSpacerVh` 与 `HOME_DOM_STAGE_START.columns` |
| 最新文章 | 探索更多专题内容之后 | 文档流 | `HomeRecentPostsStage` 与 `src/app/page.tsx` 的 recent posts 数据 |
| 联系方式 | 最新文章之后 | 文档流 | `home-contact-stage` 普通 DOM section |

自我介绍 section 应与实际文字可见窗口匹配；其后的 `channelLeadSpacerVh` 只保留极短镜头切换距离。频道入口标题通过 `channelIntroOverlapVh` 向上重叠一段，减少个人简介尾部到频道标题之间的视觉空白；后续 `channelRailSpacerVh` 抵消这个重叠量，保证探索更多专题内容仍按预期接入。新增普通 DOM section 时，先确定它要对应哪个 WebGL 逻辑区间，再在 `homeTimeline.ts` 中调整前置 spacer；不要只在 JSX 中插入 `h-[...]` 或 fixed overlay。

---

## 五、资源与加载

所有本地首页资源位于 `public/home-experience/`：

```text
public/home-experience/
├── backgrounds/
├── environment/
├── models/
├── runtime/draco/
├── stages/
│   ├── observe/
│   └── create/
└── titles/channels/
```

`THREE.LoadingManager` 汇总 GLB 加载进度，并驱动首屏进度条。纹理、SVG、模型与 Draco 解码器应继续使用 `/home-experience/...` 绝对站内路径。Draco 解码器必须保持站内托管，避免首页初始化依赖第三方运行时脚本。位图优先按实际展示尺寸输出 WebP；同一纹理被多个网格使用时只加载一次并复用 `THREE.Texture`。

首页背景色的代码来源是 `src/lib/site-theme.ts` 中的 `SITE_WARM_BACKGROUND` / `SITE_WARM_BACKGROUND_THREE`。不要在首页外层、加载态或 Three.js fallback 中重新硬编码临时背景色。

新增资源时需要同时考虑：

1. 是否由 `LoadingManager` 追踪。
2. 是否在组件卸载时释放 geometry、material、renderer 和事件监听。
3. 是否需要桌面端与移动端不同的比例或位置。
4. 是否会显著增加首屏下载体积。

---

## 六、响应式与性能边界

- `1024px` 以上采用桌面相机与对象位置，否则使用移动端参数。
- renderer pixel ratio 上限为 2，避免高 DPI 设备无限放大渲染成本。
- WebGL Canvas 不接收常规指针事件；只有明确的 HTML 交互层和场景点击逻辑处理输入。
- 组件卸载时必须杀死 ScrollTrigger、取消动画帧、移除监听器并释放 Three.js 资源。
- 首页依赖浏览器 API，核心组件及其 Three.js 子组件必须保持为 Client Component。
- 移动端不应强行复刻桌面长 WebGL 叙事。后续新增阶段优先提供普通 DOM 表达，WebGL 只保留轻量背景或氛围元素，避免地址栏高度变化导致 `vh` 时间线错位。

---

## 七、修改入口

| 需求 | 文件 |
|------|------|
| 调整阶段边界、DOM 起点和轨道高度 | `src/components/home/homeTimeline.ts` |
| 调整相机路径、模型、主时间线 | `src/components/home/HomeExperienceClient.tsx` |
| 调整探索更多专题内容列表 | `src/components/home/HomeColumnsListStage.tsx` |
| 调整最新文章列表 | `src/components/home/HomeRecentPostsStage.tsx`、`src/app/page.tsx` |
| 调整观察阶段叠加层 | `src/components/home/ObserveSignalField.tsx` |
| 调整表达阶段关系网络 | `src/components/home/ExpressConnectionField.tsx` |
| 调整创造阶段环形卡片 | `src/components/home/CreativeRingField.tsx` |
| 调整首页元数据与外层背景 | `src/app/page.tsx` |
| 调整本地 3D/贴图/SVG 资源 | `public/home-experience/` |

修改后至少验证桌面和移动视口下的加载遮罩、全局 Navbar、滚动阶段衔接、resize 与页面离开后的资源清理。
