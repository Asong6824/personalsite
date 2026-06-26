# 首页设计文档

本文描述当前正式首页，而不是旧版 `HomeScrollExperience`。实现入口为 `src/app/page.tsx`，核心组件为 `src/components/home/HomeExperienceClient.tsx`。

---

## 一、设计定位

首页不是传统频道导航页，而是一段由滚动驱动的 WebGL 叙事。视觉主线是「观察 → 表达 → 创造」，随后进入自我介绍、频道入口与联系方式。

- 品牌：且听松涛
- 基础背景：站点统一米色 `#F0EEE7`。首页 WebGL 背景贴图使用 `public/home-experience/backTexture/background-f0eee7.png`，页面外层、加载遮罩与 Three.js `scene.background` 也必须使用同一背景色常量。
- 主文字：深蓝黑 `#0a0c20`
- 渲染技术：Three.js
- 时间线与滚动：GSAP + ScrollTrigger
- 资源类型：GLB、SVG、HDRI、位图与运行时 CanvasTexture

全局 `Navbar` 在 `/` 隐藏，首页只保留左上角品牌标识，避免常规站点导航破坏沉浸感。

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
    │   └── CreateRingField
    └── 3800vh 滚动轨道
        ├── Hero
        ├── Observe
        ├── Express
        ├── Create
        ├── 自我介绍
        ├── 频道入口
        └── 联系方式
```

WebGL Canvas 固定覆盖视口；长滚动容器只提供时间轴进度。大部分空间变化通过移动相机、look-at 目标和场景对象完成，而不是切换普通页面区块。

---

## 三、叙事阶段

### Hero

- 加载完成后显示场景与标题。
- 首屏使用 `startTitle.svg`，品牌文字由固定 HTML 层显示。
- 页面本身不承担传统 Hero 文案列表。

### Observe

- 相机从远景进入第一个观察位置。
- `ObserveSignalField` 以准星、信号卡和中心标记表达信息采集。
- 对应标题资源为 `observe.svg`。

### Express

- 相机继续沿预设路径移动。
- `ExpressConnectionField` 展示由中心表达节点向文章、界面、图像和系统扩散的关系网络。
- 连线与节点按层级逐步出现，对应标题资源为 `express.svg`。

### Create

- `CreateRingField` 使用独立 Three.js 场景展示 8 张 4:5 海报面板组成的 Gallery 环。
- 当前海报资源为 `public/home-experience/gallery-images/daying-ruochong-poster.png`。
- 主场景中的 Create 标题会缩放并暂时停靠，为后续展示让出空间。
- 对应标题资源为 `create.svg`。

### 自我介绍

- 复用原 Showcase 阶段的镜头区间，展示 HTML 留白容器。
- Create → 自我介绍的横向过场完成后，相机与观察目标继续同步下移 2 个世界单位，避开视口顶部残留的 Create 标题；到达自我介绍终点后，后续阶段不再移动视角。
- 自我介绍卡片固定在视口内，只在逻辑区间 `2505–2750` 显示，不参与文档流滚动。
- 当前只显示阶段名称，不填充个人简介正文。
- 原 showreel 平面及播放、静音模型已停用。

### 频道入口

- 复用原 Reviews 阶段的镜头区间，在主 WebGL 场景中展示频道文字队列。
- 频道入口固定在视口内，在逻辑区间 `2800–3100` 显示。
- 四个频道入口为 `TECH`、`LIFE`、`FINANCE`、`DESIGN`，其中 `DESIGN` 暂时链接到现有 `/blog/create` 路由，不在本阶段迁移频道 key。
- 频道文字使用本地 `PP Model Sans Medium` 字体导出的静态 SVG，文件位于 `public/home-experience/svgtitle/channel-*.svg`；加载后转换为 `ExtrudeGeometry`。滚动时每个词依次经过视口中心，中心态 rotation 归正、透明度增强，离开中心后继续倾斜。
- HTML 层只保留轻量标题和频道链接，不再使用卡片容器。
- 原评价标题、3D 评价卡与评价文案已停用。

### 联系方式

- 复用原 Awards 阶段的镜头区间，作为滚动叙事终点。
- 页脚固定在视口底部，在逻辑区间 `3100–3700` 显示。
- 不使用卡片容器；品牌、导航、联系说明和版权直接排版在背景上。
- 原奖项图片、奖杯模型、漂浮装饰及 Footer CTA 已停用。

---

## 四、滚动与动画系统

下表是首页唯一的滚动时间线说明。表内区间是传给 `getScrollDepth()` 的**逻辑深度**，不是直接的 `vh`。实际触发位置按 `min(viewportWidth × n / 100, viewportHeight × n / 100)` 换算为像素。代码中的 `CREATE_RING_SCROLL_OFFSET = 760` 已在表内展开。

相机坐标格式为 `(x, y, z)`；“观察目标”是每帧传给 `camera.lookAt()` 的 `lookTarget`。除特别注明外，滚动动画均为 `scrub: true`，相机与观察目标使用 `power2.inOut`。

| 阶段 / 对象 | 逻辑区间 | 距离 | 相机位置 from → to | 观察目标 from → to | 同期滑动变化与说明 |
|---|---:|---:|---|---|---|
| Observe：主镜头 | `0–200` | 200 | `(2.093, -4.505, 44.601)` → `(-2.484, 3.733, 30.641)` | `(4.093, -7.005, 0.601)` → `(7.958, -0.550, 1.019)` | 背景位置由 `(4, -25, -20)` 移至 `(16, -16, -20)`，同时绕 Y 轴旋转至 `-0.87266`。 |
| Observe：标题停靠 | `205–285` | 80 | 保持上一镜头终点 | 保持上一目标终点 | `observeGroup` 从主展示位置移动并缩小到停靠状态。 |
| Observe：信号层 | `245–610` | 365 | 固定 | 固定 | `ObserveSignalField` 依次显示准星、中心标记与信号卡，接近区间末尾时淡出。 |
| Express：主镜头 | `625–820` | 195 | `(-2.484, 3.733, 30.641)` → `(0.783, 14.749, 13.300)` | `(7.958, -0.550, 1.019)` → `(15.777, 12.603, -0.428)` | 镜头从 Observe 区域抬升并向 Express 网络靠近。 |
| Express：标题停靠 | `825–905` | 80 | 保持上一镜头终点 | 保持上一目标终点 | `expressGroup` 移动并缩小，为关系网络让出视野。 |
| Express：关系网络 | `875–1370` | 495 | 固定 | 固定 | `ExpressConnectionField` 按层级绘制中心节点、边、外围节点和图例；图完全展开后保留一段完整态停顿，再淡出。 |
| Create：主镜头 | `1385–1580` | 195 | `(0.783, 14.749, 13.300)` → `(4.024, 22.301, 7.031)` | `(15.777, 12.603, -0.428)` → `(17.443, 20.712, 0.431)` | 镜头继续上移并进入 Create 标题与卡片区域。 |
| Create：标题停靠 | `1585–1665` | 80 | 保持上一镜头终点 | 保持上一目标终点 | `createGroup` 移至停靠坐标并缩放；桌面缩至 `0.54`，移动端缩至 `0.68`。 |
| Create：Gallery 可见 | `1640–2090` | 450 | 固定 | 固定 | `CreateRingField` 进入时淡入、离开时淡出。 |
| Create：Gallery 运动 | `1665–2065` | 400 | 固定 | 固定 | 图片面板按 `appear / zoom / vertical` 三段参数显现、环绕旋转并向上退出；该阶段使用子组件自己的 Three.js 相机。 |
| Create：标题复位 | `2090–2175` | 85 | 固定 | 固定 | `createGroup` 从停靠位置回到主位置并恢复为 1 倍缩放。 |
| Create → 自我介绍：过场镜头 | `2305–2500` | 195 | `(4.024, 22.301, 7.031)` → `(23.346, 20.432, 2.102)` | `(17.443, 20.712, 0.431)` → `(23.342, 20.293, 1.263)` | 对应源码 `1545–1740 + 760`，横向跨越场景进入个人信息区域。 |
| 自我介绍：向下调整 | `2505–2750` | 245 | `(23.346, 20.432, 2.102)` → `(23.346, 18.432, 2.102)` | `(23.342, 20.293, 1.263)` → `(23.342, 18.293, 1.263)` | 相机与观察目标同步下移，保持观察角度；HTML 层当前只保留标题与留白容器。 |
| 频道入口：频道文字队列 | `2800–3100` | 300 | 固定 `(23.346, 18.432, 2.102)` | 固定 `(23.342, 18.293, 1.263)` | `TECH`、`LIFE`、`FINANCE`、`DESIGN` 四个 SVG 3D 文字依次经过中心；中心态归正并增强，不在本阶段加载频道中心 3D 模型。 |
| 联系方式：固定视角 | `3100–3300` | 200 | 固定 `(23.346, 18.432, 2.102)` | 固定 `(23.342, 18.293, 1.263)` | HTML 层显示贴底页脚，文字直接排版在背景上。 |

相机区间之间没有插值时，相机和 `lookTarget` 保持上一阶段终点。所有视口执行 Observe、Express、Create、post-create 和自我介绍五段位移；自我介绍完成向下调整后，频道入口与联系方式固定在该终点，HTML 阶段仍按滚动顺序出现。

### CreateRingField 子相机时间线

`CreateRingField` 在固定 HTML 叠加层内创建独立 Three.js 场景，不使用首页主相机。它的子相机初始为 `PerspectiveCamera(70, viewportAspect, 0.01, 100)`，初始位置为 `(0, 0, 10)`；画面构图由 `displayGroup` 统一处理，桌面端当前缩放为 `(0.67, 0.67, 1)`，位置为 `(0, -0.5, 0)`。

滚动进度先由 `ScrollTrigger` 折算为 `progress: 0–1`，再进入 `galleryStageFromProgress(progress)` 拆为 `appear / zoom / vertical`。对应源码区间是 `1525–1925 + CREATE_STAGE_SCROLL_OFFSET`，即主表中的 `1665–2065`。

| 子阶段 / 参数 | progress 区间 | 输出范围 | 影响对象 | 变化与说明 |
|---|---:|---:|---|---|
| 显现预热：`appear` | `0–0.08` | `0 → 0.1` | 面板 shader `uOpacity` | 中心面板先出现，作为 Gallery 入场锚点。 |
| 显现展开：`appear` | `0.20–0.58` | `0.1 → 1` | 面板 shader `uOpacity` | 其余面板按 `distFromCenter`、`panelStagger = 0.06` 和 `panelFadeDuration = 0.08` 逐步显现。 |
| 视角推进：`zoom` | `0.34–0.82` | `0 → 1`，`easeInOutCubic` | 子相机与 `tiltGroup` | `camera.position.z` 从 `0` 插值到 `8`；`tiltGroup.rotation.x` 从 `0` 到 `1`；`tiltGroup.rotation.y` 从 `0` 到 `π`。 |
| 上移退出：`vertical` | `0.76–1.00` | `0 → 1`，`easeInOutCubic` | `tiltGroup.position.y` 与 `rotation.y` | `tiltGroup.position.y = vertical × viewportHeight`，同时 `rotation.y` 额外增加 `vertical × π`，形成向上抬离并继续转出的效果。 |

`setZoom(1)` 会把子相机 FOV 从 `70` 收到 `66.5`，作为该子场景的常态视角；随后 `update()` 每帧按 `zoom` 修改相机 Z 轴位置和 `tiltGroup` 旋转。也就是说，Create Gallery 的运动主要来自子场景相机与 `tiltGroup`，而不是移动首页主相机或逐张移动海报面板。

当前 DOM 滚动轨道为 `3800vh`，而逻辑深度使用 `getScrollDepth()` 转换，两者不是同一个单位系统。修改任一区间时，需要同时检查：`cameraStages`、`targetStages`、对象 ScrollTrigger、显隐阈值、`CreateRingField` 子时间线和 `h-[3800vh]` 容器高度。

---

## 五、资源与加载

所有本地首页资源位于 `public/home-experience/`：

```text
public/home-experience/
├── awards/
├── backTexture/
├── hdri/
├── models/
├── revs/
└── svgtitle/
```

`THREE.LoadingManager` 汇总 GLB 加载进度，并驱动首屏进度条。纹理、SVG 与模型应继续使用 `/home-experience/...` 绝对站内路径。

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

---

## 七、修改入口

| 需求 | 文件 |
|------|------|
| 调整相机路径、模型、主时间线 | `src/components/home/HomeExperienceClient.tsx` |
| 调整观察阶段叠加层 | `src/components/home/ObserveSignalField.tsx` |
| 调整表达阶段关系网络 | `src/components/home/ExpressConnectionField.tsx` |
| 调整创造阶段环形卡片 | `src/components/home/CreateRingField.tsx` |
| 调整首页元数据与外层背景 | `src/app/page.tsx` |
| 调整本地 3D/贴图/SVG 资源 | `public/home-experience/` |

修改后至少验证桌面和移动视口下的加载遮罩、滚动阶段衔接、resize、页面离开后的资源清理以及首页无全局 Navbar。
