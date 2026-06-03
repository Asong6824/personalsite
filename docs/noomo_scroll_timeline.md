# Noomo Agency WebGL 三维动效与滚动时间轴（Master Scroll Timeline）全景技术解构

本篇文档将以**滑动距离（Scroll Distance）**为主线，将网页中相机的位移、镜头观察焦点、3D 几何模型加载、SVG 矢量文字以及动效物理参数（如缓动曲线、速度控制、近端裁剪等）有机地串联起来，还原其三维动画的整套设计链路。

---

## 1. WebGL 核心动效物理参数设定 (Physics & Motion Design Setup)

在开始拆解时间轴前，首先需要明确整站 3D 渲染器与运镜的底层物理规则：

* **相机参数 (Perspective Camera)**：
  三维透视相机的 FOV（视场角）为 `50`，近端剪裁平面（`near`）为 `0.01`，远端剪裁平面（`far`）为 `1000`。由于 `near` 值极低，相机可以直接“擦着”模型的表面穿过去，实现极佳的穿透感。
* **平滑阻尼 (Scroll Smoothing)**：
  网站集成了 `ScrollSmoother` 插件。当用户拉动滚轮或在手机上滑动时，该插件会拦截硬件原始的、突兀的滚动冲量，并将其转化为一个持续 `0.5s - 1.0s` 带有物理惯性（Inertia）的平滑阻尼滚动，使得 WebGL 画布的相机飞行不会产生抖动。
* **分段缓动控制 (Segmented Easing)**：
  整个飞越动画并不是由单一曲线控制，而是由 GSAP 根据不同滑动区间，将相机在空间中的 `position`（位置）和控制器的 `target`（看点）通过 `fromTo` 进行分段控制。默认采用 **`power2.inOut`** 曲线（先加速后减速），让相机在到达每个展示模块前有一个优雅的减速缓冲。
* **自适应响应式视角 (Responsive Camera)**：
  在后半程的 Video / Reviews / Awards 阶段，为了防止大屏端文字排版被裁切，代码通过屏幕宽度检测（以 `1024px` 为界）动态微调相机的 `y` 轴（高度）和 `z` 轴（拉伸距离）。

---

## 2. 滚动时间轴全景路线图 (Master Scroll Timeline)

> [!NOTE]
> 坐标说明：`(X, Y, Z)` 采用三维笛卡尔坐标系。Z 轴正数代表靠近屏幕外面，负数代表深入屏幕内部。

---

### 🟢 初始状态：网页首屏 (Hero Section)
* **滑动位置 (Scroll)**：`0 px`
* **相机位置 (Camera Position)**：`(2.093, -4.505, 44.601)`
* **镜头看点 (Camera Target)**：`(4.093, -7.005, 0.601)`
* **当前展示的 3D 模型**：
  * 无缝背景墙 [BG2.glb](file:///Users/hanruochong/WebstormProjects/test/noomo_models/BG2.glb) 初始化在 `(4, -25, -20)`。
  * 基础平台 [Platform-O.glb](file:///Users/hanruochong/WebstormProjects/test/noomo_models/Platform-O.glb) 置于前侧。
* **当前展示的 SVG 文字模型**：
  * [startTitle.svg](file:///Users/hanruochong/WebstormProjects/test/数字故事讲述与3D网站设计机构 _ Noomo_files/startTitle.svg) ("DESIGN THAT ELEVATES YOUR...")。绝对位置：`(x: -3, y: -4.3, z: 20)`，带有微小的斜切偏角。
* **动效物理细节**：
  * **HTML 层同步**：首屏的 HTML 文本 `.hero-text` 完全不透明。当滚动开始时，它将在 `0% - 100%` 视口高度内向下平移 `250px`（移动端平移 `110vh`）并淡出。
  * **引导箭头的隐藏**：底部的 “SCROLL” 指示器和箭头，会在页面滚动 `0% - 20%` 时触发快速淡出并设置 `display: none`。

---

### 🔵 阶段一：进入游戏手柄场景 (Joystick Stage)
* **滑动位置 (Scroll)**：`0 px` $\rightarrow$ `200 px`
* **相机位置变化**：`(2.093, -4.505, 44.601)` $\rightarrow$ **`(-2.484, 3.733, 30.641)`**
* **镜头看点变化**：`(4.093, -7.005, 0.601)` $\rightarrow$ **`(7.958, -0.55, 1.019)`**
* **当前展示的 3D 模型**：
  * **游戏手柄** [Dendy3.glb](file:///Users/hanruochong/WebstormProjects/test/noomo_models/Dendy3.glb) 被载入，位于右手侧。手柄内部包含 3D 骨骼动画，自动循环播放按键按压效果。
  * **能量闪电与插头** [lightning.glb](file:///Users/hanruochong/WebstormProjects/test/noomo_models/lightning.glb) 和 [Plug.glb](file:///Users/hanruochong/WebstormProjects/test/noomo_models/Plug.glb) 在深处被加载。
* **当前展示的 SVG 文字模型**：
  * 相机身位向前推进，当相机 `z` 轴从 44.6 缩减到 30.6 时，开始贴近并**斜向穿过**位于 `z: 20` 的 "DESIGN THAT..." 文本几何体。
  * 处于倾斜偏角的文字底端由于触发 `near: 0.01` 剪裁平面，呈现出从左下到右上斜向被“擦除/剪切”的动态效果。
* **动效物理细节**：
  * **GSAP 缓动**：`ease: "power2.inOut"`。相机的推进速度在开始时较慢，中期变快，快要停驻时减速。

---

### 🔵 阶段二：品牌与 Coinbase 合作展区 (Coinbase & Middle Stage)
* **滑动位置 (Scroll)**：`205 px` $\rightarrow$ `400 px`
* **相机位置变化**：`(-2.484, 3.733, 30.641)` $\rightarrow$ **`(-1.475, 9.953, 18.201)`**
* **镜头看点变化**：`(7.958, -0.55, 1.019)` $\rightarrow$ **`(14.485, 5.069, -2.278)`**
* **当前展示的 3D 模型**：
  * [CoinbaseBall2.glb](file:///Users/hanruochong/WebstormProjects/test/noomo_models/CoinbaseBall2.glb) 载于中心位置 `(7, 7, 7.1)`。
  * [Bitcoin.glb](file:///Users/hanruochong/WebstormProjects/test/noomo_models/Bitcoin.glb) (x: -0.75) 与 [Sun.glb](file:///Users/hanruochong/WebstormProjects/test/noomo_models/Sun.glb) (x: 2.5) 作为背景衬托。
* **当前展示的 SVG 文字模型**：
  * [InteractiveSvg.svg](file:///Users/hanruochong/WebstormProjects/test/数字故事讲述与3D网站设计机构 _ Noomo_files/InteractiveSvg.svg) ("INTERACTIVE") 被加载，它的绝对坐标为 `(x: 5.17, y: 8.47, z: 2.4)`。
* **动效物理细节**：
  * **物体自带动画**：`CoinbaseBall2` 在此阶段被注入 GSAP timeline：在 `y` 轴 `0.8` 至 `1.0` 之间以正弦缓动（`sine.inOut`）做自转与上下漂浮，模拟失重感。
  * **运镜方向**：相机的 `y` 轴高度大幅抬升（3.7 $\rightarrow$ 9.95），视野中原本处于高处的小球和文字会从镜头上方缓缓划落到屏幕下方。

---

### 🔵 阶段三：空间飞行与卡片展区 (Space & Cards Stage)
* **滑动位置 (Scroll)**：`405 px` $\rightarrow$ `600 px`
* **相机位置变化**：`(-1.475, 9.953, 18.201)` $\rightarrow$ **`(0.783, 14.749, 13.3)`**
* **镜头看点变化**：`(14.485, 5.069, -2.278)` $\rightarrow$ **`(15.777, 12.603, -0.428)`**
* **当前展示的 3D 模型**：
  * [Cards2Anim.glb](file:///Users/hanruochong/WebstormProjects/test/noomo_models/Cards2Anim.glb) 载于 `(11.95, 12.1, 3)`。这几张玻璃卡片被设定了高反射与高透明度，在相机滑过时会折射深处的 HDRI 天空盒光影。
  * [Clouds.glb](file:///Users/hanruochong/WebstormProjects/test/noomo_models/Clouds.glb) 在背景缓缓飘动。
* **当前展示的 SVG 文字模型**：
  * [enterpriseSvg.svg](file:///Users/hanruochong/WebstormProjects/test/数字故事讲述与3D网站设计机构 _ Noomo_files/enterpriseSvg.svg) ("ENTERPRISE")。绝对位置为 `(x: 10.05, y: 14.4, z: -0.71)`。
* **动效物理细节**：
  * **透视畸变 (Perspective Warp)**：相机飞掠这些扁平的卡片模型，近距离（Z轴到达 13.3）导致透视变形变强，让卡片在划出屏幕时显得非常立体。

---

### 🔵 阶段四：水母实验室 (Bunny & Jellyfish Stage)
* **滑动位置 (Scroll)**：`605 px` $\rightarrow$ `800 px`
* **相机位置变化**：`(0.783, 14.749, 13.3)` $\rightarrow$ **`(4.024, 22.301, 7.031)`**
* **镜头看点变化**：`(15.777, 12.603, -0.428)` $\rightarrow$ **`(17.443, 20.712, 0.431)`**
* **当前展示的 3D 模型**：
  * [Jellyfish.glb](file:///Users/hanruochong/WebstormProjects/test/noomo_models/Jellyfish.glb) 被载入至 `(-1, -4.3, 20)`。发光水母的触手动作在后台由 `AnimationMixer` 实时插值播放。
* **当前展示的 SVG 文字模型**：
  * [immersive.svg](file:///Users/hanruochong/WebstormProjects/test/数字故事讲述与3D网站设计机构 _ Noomo_files/immersive.svg) ("IMMERSIVE")。绝对坐标为 `(x: -4.3, y: -2.83, z: 15.3)`。
* **动效物理细节**：
  * **陡峭俯仰**：相机的 `y` 轴做了一次剧烈的拉升（从 14.7 陡升至 22.3），这是整个主页飞行路线的最高点，相机向下俯瞰水母，"IMMERSIVE" 从镜头下侧飞速划过。

---

### 🔵 阶段五：大飞跃与定制展区 (SEO & Bespoke Stage)
* **滑动位置 (Scroll)**：`805 px` $\rightarrow$ `1000 px`
* **相机位置变化**：`(4.024, 22.301, 7.031)` $\rightarrow$ **`(23.346, 20.432, 2.102)`**
* **镜头看点变化**：`(17.443, 20.712, 0.431)` $\rightarrow$ **`(23.342, 20.293, 1.263)`**
* **当前展示的 3D 模型**：
  * 场景的背景幕布 [BG2.glb](file:///Users/hanruochong/WebstormProjects/test/noomo_models/BG2.glb) 发生同步物理平移，从 `(x: 4, y: -25)` 移动到 `(x: 16, y: -16)`，为相机接下来的右侧长廊展示铺设背景。
* **当前展示的 SVG 文字模型**：
  * [BespokeSvg.svg](file:///Users/hanruochong/WebstormProjects/test/数字故事讲述与3D网站设计机构 _ Noomo_files/BespokeSvg.svg) ("BESPOKE") 被快速掠过，绝对坐标在 `(x: 23.87, y: 21.89, z: -7.09)`。
* **动效物理细节**：
  * **横向速度拉满 (High-velocity Horizontal Sweep)**：相机在这 200px 的滑动距离内，水平 `x` 轴发生了接近 20 个单位的剧烈右移，画面产生强烈的速度视差，所有前景模型飞速划过，随后平稳停靠在右侧展区。

---

### 🔵 阶段六：视频案例展区 (Video Stage)
* **滑动位置 (Scroll)**：`1005 px` $\rightarrow$ `1200 px`（部分屏幕自适应至 `1250 px`）
* **相机位置变化 (根据设备屏幕宽度自适应)**：
  * **桌面端 (Desktop)**：`(23.346, 20.432, 2.102)` $\rightarrow$ **`(23.321, 15.607, 3.911)`**
  * **移动端 (Mobile)**：保持在 **`(23.346, 20.432, 2.102)`**（手机竖屏下不需要放低高度，保持较高俯仰角）。
* **镜头看点变化**：
  * **桌面端 (Desktop)**：`(23.342, 20.293, 1.263)` $\rightarrow$ **`(23.301, 15.457, 1.984)`**
* **当前展示的 3D 模型**：
  * [netrixtest3.glb](file:///Users/hanruochong/WebstormProjects/test/noomo_models/netrixtest3.glb) 被载入至 `(20.8, 11, -5)`。
* **动效物理细节**：
  * **视线回落与防眩晕**：大飞跃结束后，相机的坐标高度回落（y 从 20 降到 15.6），z 轴向后退一点（从 2.1 到 3.9），使视角变宽，配合页面上浮现的 HTML 视频框排版。

---

### 🔵 阶段七：客户评价展区 (Reviews Stage)
* **滑动位置 (Scroll)**：`1300 px` $\rightarrow$ `1500 px`
* **相机位置变化 (Desktop)**：`(23.321, 15.607, 3.911)` $\rightarrow$ **`(23.312, 14.16, 4.024)`**
* **镜头看点变化 (Desktop)**：`(23.301, 15.457, 1.984)` $\rightarrow$ **`(23.292, 14.01, 2.097)`**
* **当前展示的 SVG 文字模型**：
  * [revTitle.svg](file:///Users/hanruochong/WebstormProjects/test/数字故事讲述与3D网站设计机构 _ Noomo_files/revTitle.svg) ("REVIEWS" 字样几何体) 被加载。
* **动效物理细节**：
  * 相机身位保持在右侧展区（x 稳定在 23.3），高度极其平缓地下降（y 从 15.6 下沉至 14.1），配合评价部分的 HTML 模块滚动。

---

### 🔴 阶段八：获奖列表与页脚 (Awards & Footer Stage)
* **滑动位置 (Scroll)**：`1600 px` $\rightarrow$ `1800 px`
* **相机位置变化 (Desktop)**：`(23.312, 14.16, 4.024)` $\rightarrow$ **`(23.292, 11.443, 4.236)`**
* **镜头看点变化 (Desktop)**：`(23.292, 14.01, 2.097)` $\rightarrow$ **`(23.272, 11.293, 2.309)`**
* **动效物理细节**：
  * **终点缓动停靠**：在滑动到最后的 1800px 时，相机高度平滑降至最低点 `y: 11.44` 并停止动画，让用户能安静舒适地阅读底部的公司联系方式和获奖清单（HTML 文本层）。
