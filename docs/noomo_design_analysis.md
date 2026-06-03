# Noomo Agency 网站设计理念与 WebGL 实现技术解构

本页整理并分析了 [Noomo Agency](https://noomoagency.com/) 官方网站的视觉设计美学理念以及底层的 WebGL (Three.js + GSAP) 技术实现思路，旨在为高水准的三维网页开发提供设计与技术参考。

---

## 1. 核心设计理念 (Design Philosophy)

Noomo Agency 网站是现代网页设计中“**三维滚动叙事 (Scrollytelling)**”与“**玻璃拟态 (Glassmorphism)**”结合的行业标杆。其核心设计理念可以概括为以下三点：

* **沉浸式场景交互 (Immersive Scrollytelling)**：
  网站摒弃了传统网页纵向滚动的交互模式，而是把用户置于一个深邃的 3D 虚拟摄影棚空间内。页面的滚动不是单纯的文本位移，而是**三维摄像机（Camera）**沿着预设的曲线路径进行空间飞行。
* **物理写实的玻璃材质 (Glassmorphism & Light Physics)**：
  网页主视觉是一系列漂浮的 3D 几何模型。这些模型均采用了高度写实的物理玻璃材质（`MeshPhysicalMaterial`）。通过对反射率（Reflectivity）、折射率（IOR）、透光厚度（Thickness）的细致调校，配合环境贴图，产生出清澈、有高级感的半透明亚克力视觉效果。
* **极简主义与未来感的排版 (Minimalist Typography)**：
  UI 层面的字体搭配极具张力——块状、硬朗且具有数字未来感的 `NeueMachina` 大粗体作为标题，配合干净、纤细且现代的 `NeueRoman` 字体作为叙事主体，营造出科技感与艺术感并存的调性。

---

## 2. 核心技术实现思路与方案

### 💡 方案一：虚拟摄影棚无缝背景系统 (`BG2.glb` 幕布)
为了让网页中的 WebGL 元素看起来像是真实摄影棚里拍摄的高级硬件实物，网站采用了无缝背景墙方案。

#### 1. 物理挑战与痛点
如果背景只是简单的 90 度折角墙面，那么在地面和墙面交接处会产生一条生硬的阴影线和分界线，破坏整体视觉的无限延伸感和立体度。

#### 2. 实现思路
* **弧形幕布模型**：使用三维软件制作了一个底部平滑向下弯曲的 L 形斜面模型 [BG2.glb](file:///Users/hanruochong/WebstormProjects/test/noomo_models/BG2.glb)（俗称 **无缝背景墙/摄影棚幕布 (Cyclorama)**）。
* **渐变纹理平铺**：加载一张渐变大图 `beckground_04min.jpeg`，将其作为贴图（Texture）贴在 `BG2` 模型表面。
* **大范围空间铺设**：在 JS 代码中将该模型放大 7 倍（`scale.set(7, 7, 7)`）并放置在 3D 场景的最底层（`z: -20`）。
* **效果**：所有前方的玻璃 3D 元素在旋转和飘动时，其投影能平滑地投射并消隐在弧形幕布上，完全隐去了墙角边界，营造出光影平滑过渡的高级摄影棚感。

---

### 💡 方案二：三维矢量化标题渲染 (SVG 转 3D 模型)
用户在页面上看到的诸如 **"DESIGN THAT ELEVATES YOUR DIGITAL PRESENCE"** 等大型英文标题，并非网页中传统的 HTML 文字，而是用三维网格（Mesh）渲染出来的图形。

#### 1. 为什么不使用标准字体或 3D 字体模型？
* **包体积优化**：如果为每句话单独建模（生成 `.glb` 格式的 3D 字体模型），模型的文件体积会非常大，导致加载卡顿。
* **清晰度与响应式**：如果将文字作为普通图片或贴图，放大时会模糊，且难以做精细的三维穿插排版。

#### 2. 实现思路
* **SVG 矢量导出**：将设计的英文排版作为矢量路径导出为 SVG 文件（如 `/svgtitle/startTitle.svg`），里面只包含矢量轮廓数据（`<path d="..." />`）。
* **SVGLoader 解析**：网页加载时，通过 Three.js 提供的 `SVGLoader` 插件，实时拉取并解析该 SVG 文件中的矢量轮廓。
* **3D 网格生成**：
  使用 `SVGLoader.createShapes()` 方法将 SVG 路径转化为三维的 **`ShapeGeometry`（形状几何体）**，再配合着色器材质（Material）生成 3D 场景中的网格模型（Mesh）。
* **物理穿插交互**：
  由于该标题已经变成了 3D 空间中的真实三维网格，因此可以让其他的 3D 浮动模型（如字母 `I` 或其他小模型）从这行字的前后直接穿梭插过，达到 2D HTML 文字绝对无法实现的物理层级遮挡效果。
* **翻译阻隔效应**：由于它本质上是由 WebGL 在 Canvas 画布中画出的矢量顶点和像素，不属于网页 HTML 文本节点（DOM Nodes），因此即使用户开启了 Chrome 等浏览器的网页翻译，这些文字依然会保持原始的英文字体排版，不会被强制翻译破坏排版结构。

---

### 💡 方案三：相机轨迹动画控制 (GSAP 曲线飞行)
整个主页的滚动过程并不是真正的页面滚动，而是通过滚轮的进度驱动摄像机在三维空间中做平滑飞行。

* **轨迹节点规划**：
  网站在 JS 代码中定义了一个包含 8 个关键镜头的数组：
  ```javascript
  const scrollSteps = [
    { name: "joystick", from: {x: 2.093, y: -4.505, z: 44.601}, to: {x: -2.484, y: 3.733, z: 30.641} },
    { name: "middle",   from: {x: -2.484, y: 3.733, z: 30.641}, to: {x: -1.475, y: 9.953, z: 18.201} },
    { name: "space",    from: {x: -1.475, y: 9.953, z: 18.201}, to: {x: 0.783, y: 14.749, z: 13.3} },
    // ... 依次到末尾的 awards 节点
  ];
  ```
* **GSAP 绑定**：
  使用 **GSAP Timeline** 和 **ScrollTrigger** 插件，将页面的滚动百分比绑定到当前相机的 `position`（位置）和 `target`（看点方向）。
* **惯性平滑与自适应**：
  开启 `scrub: true` 和 `ScrollSmoother`，不仅可以消除用户用鼠标滚轮时带来的画面颤抖，还能根据桌面端（Desktop）和移动端（Mobile）屏幕比例，动态自适应相机的开始和结束视角。

---

### 💡 方案四：模型打包与传输优化 (Draco 压缩)
由于整站使用了多达 30 个 `.glb` 三维模型，如果直接加载原文件，首屏流量将突破 20MB，导致严重的白屏加载问题。

* **网格压缩**：所有模型在上线前均通过谷歌开源的 **Draco** 压缩技术进行处理，将 3D 网格的顶点和几何数据高倍率压缩。
* **解压加载**：
  在网页 JS 中初始化解压加载器，并将 Draco 核心文件放入静态资源目录 `/newModels/`：
  ```javascript
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath("/newModels/");
  dracoLoader.preload();
  
  const glbLoader = new GLTFLoader();
  glbLoader.setDRACOLoader(dracoLoader);
  ```
  通过这种方案，模型体积被压缩了 60% 以上，最大的核心水母模型 `Jellyfish.glb` 在高精度网格下仅占 3.7MB。

---

## 3. 全站 3D 模型 (.glb) 资产清单

以下是该网站已确认加载的 31 个 3D GLB 模型列表：

| 模型名称 | 文件类型/作用 | 部署/获取源 URL |
| :--- | :--- | :--- |
| **`BG2.glb`** | 无缝摄影棚背景模型 | `https://noomoagency.com/newModels/BG2.glb` |
| **`Platform-O.glb`** | 3D 浮动定位平台几何体 | `https://noomoagency.com/newModels/Platform-O.glb` |
| **`Jellyfish.glb`** | 实验室场景发光水母主体 (3.7MB) | `https://noomoagency.com/newModels/Jellyfish.glb` |
| **`CoinbaseBall2.glb`**| Coinbase 案例三维联名小球 | `https://noomoagency.com/newModels/CoinbaseBall2.glb` |
| **`Dendy3.glb`** | Joystick 场景红白机经典控制器 | `https://noomoagency.com/newModels/Dendy3.glb` |
| **`awwwardsModel.glb`**| Awwwards 3D 奖杯 | `https://noomoagency.com/newModels/awwwardsModel.glb` |
| **`webbby.glb`** | Webby 3D 螺旋奖杯 | `https://noomoagency.com/newModels/webbby.glb` |
| **`reddot.glb`** | Red Dot 3D 红点设计奖杯 | `https://noomoagency.com/newModels/reddot.glb` |
| **`SFDF_op1.glb`** | SF Design Week 3D 字母奖杯 | `https://noomoagency.com/newModels/SFDF_op1.glb` |
| **`Bitcoin.glb`** | 比特币 3D 旋转金色符号 | `https://noomoagency.com/newModels/Bitcoin.glb` |
| **`Rocket.glb`** | 太空场景 3D 火箭模型 | `https://noomoagency.com/newModels/Rocket.glb` |
| **`Clouds.glb`** | 太空背景 3D 云朵 | `https://noomoagency.com/newModels/Clouds.glb` |
| **`Sun.glb`** | 3D 太阳发光模型 | `https://noomoagency.com/newModels/Sun.glb` |
| **`Plug.glb`** | 实验室 3D 关联插头 | `https://noomoagency.com/newModels/Plug.glb` |
| **`lightning.glb`** | 实验室 3D 能量闪电 | `https://noomoagency.com/newModels/lightning.glb` |
| **`Eye.glb`** | 主页面浮游字母旁的大眼睛 | `https://noomoagency.com/newModels/Eye.glb` |
| **`HeartLocation.glb`**| 3D 心形地图定位针 | `https://noomoagency.com/newModels/HeartLocation.glb` |
| **`Like.glb`** | 3D 点赞/握拳手势模型 | `https://noomoagency.com/newModels/Like.glb` |
| **`goblet.glb`** | 3D 欧式高脚杯几何体 | `https://noomoagency.com/newModels/goblet.glb` |
| **`heart.glb`** | 网站主域 3D 爱心几何体 | `https://noomoagency.com/newModels/heart.glb` |
| **`netrixtest3.glb`** | Netrix 抽象测试模型 | `https://noomoagency.com/newModels/netrixtest3.glb` |
| **`playWithMesh.glb`** | 网格可交互式模型 | `https://noomoagency.com/newModels/playWithMesh.glb` |
| **`SoundOff.glb`** | 3D 禁音控制标志 | `https://noomoagency.com/newModels/SoundOff.glb` |
| **`Cards2Anim.glb`** | 浮动卡片展示几何体 | `https://noomoagency.com/newModels/Cards2Anim.glb` |
| **`M.glb`** / **`N.glb`** / **`O.glb`** / **`4.glb`** | 3D 拼接字母与数字 | `https://noomoagency.com/newModels/M.glb` 等 |
| **`Man.glb`** | 乌克兰艺术人物头像雕塑 (Story 专用) | `https://noomo-website.cdn.prismic.io/..._Man.glb` |
| **`Middle.glb`** | 空间对称几何模型 (Middle 案例专用) | `https://noomo-website.cdn.prismic.io/..._Middle.glb` |
| **`heart_prismic.glb`** | 动态心跳爱心模型 (Labs/Love 案例专用) | `https://noomo-website.cdn.prismic.io/..._heart.glb` |
