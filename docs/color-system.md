# 网站配色系统

本文记录「大盈若冲」当前网站的实际配色结构、使用范围与代码来源。它是一份现状基线：用于理解页面之间的颜色关系、判断新增颜色应落在哪一层，并为后续 token 收敛提供依据。

---

## 一、设计总览

全站以 **warm editorial（暖色编辑纸张）** 为视觉基线：米色背景、深炭灰正文、暖灰卡片和分隔线。四个频道共享这层底色，再通过局部强调色、排版、材质和动效形成差异。

当前配色可以分为五层：

1. **站点品牌层**：页面背景、全局导航和基础墨色。
2. **通用 UI 层**：表单、弹窗、图表、焦点环等组件 token，使用暖石中性色与编辑蓝，并提供配套暗色模式。
3. **页面叙事层**：首页从站点墨色、蓝色和陶土橙色阶中选择叙事色。
4. **频道表达层**：技术/生活共享暖色编辑色，金融使用绿与琥珀，创意使用玻璃光晕和紫色链接。
5. **内容可视化层**：文章内图表、地图和手绘组件按业务语义使用局部色板。

这些层级已经收敛到同一套颜色原料：TypeScript/Canvas 从 `src/lib/site-palette.ts` 取值，Tailwind 与 CSS 从 `src/app/site-palette.css` 取值，页面再经 `--channel-*` 和通用语义 token 组合。组件不保留 Hex fallback；默认值由 `:root` 统一提供。

---

## 二、全站核心色板

核心色定义在 `src/lib/site-theme.ts`，同时映射到 `src/app/globals.css` 中的站点及频道变量。

| 角色 | 色值 | 代码 token | 主要用途 |
|------|------|------------|----------|
| 页面背景 | `#F0EEE7` | `SITE_WARM_BACKGROUND`、`--site-page-bg`、`--channel-bg` | `html`、`body`、首页、频道页、文章页、Three.js 背景 |
| 纸张表面 | `#E2DBCE` | `SITE_WARM_SURFACE`、`--channel-card` | 卡片、标签、内容分区 |
| 高层表面 | `#D8D0C3` | `SITE_WARM_SURFACE_HIGH`、`--channel-card-hover` | Hover、边框、较深纸张层级 |
| 主墨色 | `#141413` | `SITE_WARM_INK`、`--site-nav-ink`、`--channel-ink` | 标题、正文、导航、主要图形 |
| 次级墨色 | `#68645D` | `SITE_WARM_MUTED`、`--site-nav-muted`、`--channel-muted` | 摘要、时间、注释、辅助文字 |

### 基础使用原则

- 页面外层默认使用 `#F0EEE7`，不要重新引入纯白作为正式页面主背景。
- 正文和标题优先使用 `#141413`，弱化信息使用 `#68645D`。
- 卡片层级优先使用 `#E2DBCE` 和 `#D8D0C3`，阴影不是主要层级手段。
- Three.js 场景使用由 `SITE_WARM_BACKGROUND` 动态换算出的 `SITE_WARM_BACKGROUND_THREE`，保持与 DOM 背景无缝衔接。
- React/Three.js 代码优先复用 `src/lib/site-theme.ts`；CSS 作用域内优先使用相应变量。
- `:root` 提供完整的 `--channel-bg/card/card-hover/ink/muted/border/accent` 默认值；频道作用域只负责覆写，因此组件直接使用 `var(--channel-*)`，不再重复写 Hex fallback。

### 扩展色轮（颜色原料层）

`src/lib/site-palette.ts` 在核心五色之外提供一套更细的颜色原料。结构参考 Tailwind 的色相家族与 `50–950` 数字阶梯，但所有色值都由本站选定的六个锚点展开，没有复制 Tailwind 默认颜色。

| 原始锚点 | 色板位置 | 设计角色 |
|----------|----------|----------|
| `#CBCADA` | `violet-300` | 薰衣草灰、浅紫表面 |
| `#7C8C62` | `lime-600` | 橄榄叶、自然强调 |
| `#C0D1CA` | `emerald-300` | 薄荷灰、浅绿表面 |
| `#E2DBCE` | `stone-200` | 米纸卡片、暖色基底 |
| `#759AC8` | `blue-500` | 编辑蓝、冷色主强调 |
| `#CC7C5E` | `orange-500` | 陶土橙、暖色主强调 |

扩展色板包含 17 个彩色家族（red 至 rose）和 5 个中性色家族（slate、gray、zinc、neutral、stone），每个家族包含 `50/100/200/300/400/500/600/700/800/900/950` 十一档。浅色向纸张底色收敛，深色向暖黑墨色收敛，同一档位尽量维持接近的感知明度。

这套色板属于**原料层**。组件优先引用背景、正文、边框、强调、成功、警告等语义 token；需要明确固定色阶时使用 `site-*` Tailwind 工具类。分类图表从不同色相区域交错取色，而不是沿色轮连续取色。完整预览见 [`docs/site-palette.html`](site-palette.html)，其中可点击任意颜色复制 Hex。

---

## 三、全局导航

导航采用核心暖色板的半透明衍生色，定义在 `src/app/globals.css`：

| 角色 | 当前值 |
|------|--------|
| 导航文字 | `#141413` |
| 次级/渐变文字 | `stone-600` |
| Hover 表面 | `stone-200 / 42%` |
| Active 表面 | `stone-300 / 78%` |
| Pending 表面 | `stone-300 / 90%` |
| 导航边框 | `stone-600 / 18%` |
| Focus 光圈 | `blue-500 / 45%` |

移动导航面板使用约 95% 不透明度的 `#F0EEE7` 并叠加背景模糊。导航状态主要通过表面深浅区分，不使用频道强调色。

---

## 四、通用 UI 语义色

`src/app/site-palette.css` 通过 Tailwind v4 `@theme` 注册完整扩展色板，可使用 `bg-site-blue-500`、`text-site-stone-700` 等工具类。`src/app/globals.css` 的 `:root` 与 `.dark` 再从中选择颜色，组成通用组件的语义 token。业务组件应优先使用语义 token，只有绘图、装饰和明确需要固定色阶时才直接引用色相档位。

### 亮色模式

| Token 组 | 当前选色 | 用途 |
|----------|----------|------|
| `--background` / `--foreground` | 暖纸画布 / 主墨 | 未覆写主题的通用组件 |
| `--card` / `--popover` | `stone-50` | 卡片、浮层 |
| `--primary` | `blue-500` | 主操作和强调状态 |
| `--accent` | `blue-200` | 低强度强调表面 |
| `--secondary` / `--muted` | `stone-100` | 次级表面与弱化信息 |
| `--destructive` | `red-700` | 删除、错误和危险操作 |
| `--border` / `--input` | `stone-300` / `stone-100` | 边框和输入表面 |
| `--ring` | 半透明 `blue-500` | 键盘焦点 |
| `--chart-1` 至 `--chart-5` | 蓝、陶土橙、橄榄、紫、蓝绿交错 | 通用图表 |

### 暗色模式

`.dark` 将通用 UI 切换为 `slate-950/900` 暗面、`stone-100` 文字和较亮的 `blue-400` 强调色。需要注意：

- `html`、`body`、首页及主要频道仍显式使用 `#F0EEE7`。
- 技术、生活和金融文章样式也大多显式指定亮色。
- 因此当前暗色模式主要覆盖通用组件，并不是全站完整的深色主题。
- 新组件不能只依赖 `.dark` 存在就假定所在页面会变成深色背景。

---

## 五、首页配色

当前正式首页以统一暖背景承载 WebGL 叙事，文字、信号点、卡片和 SVG 均直接消费站点色板。

| 角色 | 色值 | 用途 |
|------|------|------|
| 场景与页面背景 | `#F0EEE7` | DOM、加载遮罩、Three.js scene、背景贴图 |
| 首页主文字 | `--color-site-ink` | 标题、列表、连线、加载进度、页脚 |
| 首页弱化文字 | `site-ink / 28–72%` | 说明、元信息、非活跃条目 |
| 图片占位表面 | `stone-200` | 最新文章图片容器 |
| 观察卡片表面 | `lime-50 / 82%` | Observe 信号卡 |
| Express 信号橙 | `orange-500` | 表达网络的重点节点 |
| Express 次级标签蓝灰 | `slate-600` | 表达网络节点的次级文字 |
| 最新文章反白文字 | `--color-site-canvas` | 标签 hover 时深底上的浅文字 |

橙色只作为叙事信号，不是全站操作色。首页实现位于 `src/components/home/`，结构说明见 `docs/homepage-design.md`。

`src/app/home.module.css` 中的 scholarly 变量也已接入扩展色板：主色使用编辑蓝 `blue-500`，次级蓝使用 `sky-500`，表面使用 `stone` 色阶。

---

## 六、频道配色

### 技术频道

技术频道直接使用全站 warm editorial 基线：

| 角色 | 色值 |
|------|------|
| 背景 | `#F0EEE7` |
| 卡片 | `#E2DBCE` |
| Hover / 边框 | `stone-300`（`#D1CABC`） |
| 标题与正文 | `#141413` |
| 辅助文字 | `stone-600`（`#5E574A`） |

频道本身没有独占的高饱和强调色。彩色主要来自文章中的技术图表和手绘组件，详细现状见 `docs/sketchy-components.md`。

### 生活频道

生活频道与技术频道共享背景、卡片、墨色和边框，通过排版、光晕、旅行图片和 3D 内容形成差异。`src/app/home.module.css` 中的 scholarly 主题补充以下强调色：

| 角色 | 色值 | 用途 |
|------|------|------|
| 编辑蓝 | `blue-500`（`#759AC8`） | 主要状态、链接与焦点 |
| 天蓝 | `sky-500`（`#629DB5`） | 次级强调与渐变过渡 |
| 按钮渐变 | `blue-600 → blue-800` | 深色主要按钮 |
| 按钮浅文字 | `stone-50`（`#F8F6F4`） | 深蓝按钮上的文字 |

生活频道的蓝色是局部强调，不替代 `#141413` 正文。

### 金融频道

金融频道以暖背景为底，使用深绿和琥珀建立杂志及市场数据语义。

| 角色 | 色值 | 用途 |
|------|------|------|
| 页面背景 | `#F0EEE7` | 频道、专栏和文章背景 |
| 主文字 | `neutral-900` / `emerald-950` | 标题、深色 CTA、研究标题 |
| 正文/次要文字 | `neutral-600` | 摘要、导航、正文 |
| 元信息 | `neutral-500` | 日期、英文副标题、空状态 |
| 主强调绿 | `lime-700` / `emerald-700` | 链接、标签、市场语义 |
| 浅装饰线 | `neutral-300` | 分隔、占位和弱化信息 |
| 主卡片 | `stone-50` | 内容卡片、页脚、标签 |
| 次级卡片 | `neutral-200` | 次级专题、头像和占位 |
| 琥珀强调 | `amber-400–700` | 警告、按钮、标题下划线 |

金融文章页、市场研究组件、实验性 `DataWall` 和图表均从同一色板取值；金融涨跌语义通过 `PLOT_SEMANTIC` 统一为中国习惯的涨红跌绿。

### 创意频道

创意频道使用与全站一致的暖米色纸张背景作为无限画布，以黑白中性色建立网格和排版秩序。颜色由不同作品卡片各自承担，不再使用统一的液态玻璃材质。

| 角色 | 当前实现 | 用途 |
|------|----------|------|
| 页面背景 | `#F0EEE7` | 无限横向画布（对齐全站暖底） |
| 构造网格 | `site-neutral-400 / 45%` | 卡片间虚线参考线 |
| 主标题 | `site-neutral-900` | 频道标题和卡片标题 |
| 次级文字 | `site-neutral-500` | 描述和辅助信息 |
| 主要强调 | `violet-600` | 标题、信号条与局部实验卡 |
| 卡片边框 | `site-neutral-200` | 浅色作品卡边界 |
| 深色作品面 | `site-neutral-900/950` | 设计与信号卡片 |
| 文章链接 | `violet-700` | 正文链接 |
| 链接 Hover | `violet-800` | 正文链接 Hover |
| 引用边框 | `violet-600` | 文章引用强调 |

频道首页允许每张作品卡从色轮中选择自己的色相，`violet-600` 作为跨卡片的弱连接信号；文章阅读页继续使用同一 violet 色阶的链接与引用规则。

---

## 七、专栏与特殊主题

### 日本行纪 / MUJI

`.theme-muji` 与 warm editorial 基线一致，并补充地图状态：

| 角色 | 色值 |
|------|------|
| 背景 | `#F0EEE7` |
| 纸张/已访问 | `#E2DBCE` |
| Hover/边框 | `stone-300`（`#D1CABC`） |
| 木色 | `stone-700`（`#423C31`） |
| 灰褐辅助文字 | `stone-600`（`#5E574A`） |
| 停留 / 长期居住 | `lime-300` / `lime-600` |
| 未访问地图 | `stone-300`（`#D1CABC`） |

这里的“MUJI”差异主要来自排版、地图、留白和材质，而非另起一套棕色主题。

### 文章详情页

- 技术、生活：复用 warm editorial 色板。
- 金融：正文使用 neutral，标题使用 neutral/emerald 深色，链接和引用使用 lime/emerald。
- 创意：背景和正文保持 warm editorial，链接与引用使用紫色。
- 未识别频道的 fallback 文章也使用站点 canvas、neutral 和 blue token。

---

## 八、内容可视化与媒体

文章内的图表、地图、代码高亮和交互组件可以使用业务语义色，但必须与所在页面背景协调。

- 手绘技术图表的当前颜色与分层记录在 `docs/sketchy-components.md`。
- 通用图表可使用 `--chart-1` 至 `--chart-5`；当前按编辑蓝、陶土橙、橄榄、紫、蓝绿交错取色，避免连续使用相邻色相。
- 代码高亮使用 GitHub Light 风格，并针对暖灰代码背景适配；它属于代码语法语义层，不应拿来定义普通 UI。
- 图片可以保留自身色彩；金融频道会通过灰度和 `mix-blend-multiply` 将图片纳入杂志色调。
- 状态不能只依赖颜色表达，应同时使用文字、图标、线型、形状或纹理。

### 绘图配色方案

文章图表与数据可视化统一使用 `src/lib/plot-palette.ts`。`PLOT_HUES` 直接由 17 个 chromatic 家族的 `200/500/700` 档生成，`PLOT_NEUTRALS` 直接引用 foundation 与 stone 色阶，不再维护第二套 Hex。

- 分类顺序色板（`PLOT_CATEGORICAL`）：blue → orange → lime → violet → teal → rose → amber → indigo → emerald → red → sky → fuchsia，共 12 色。
- 五档色阶（`PLOT_SCALES`）：从对应家族选取 `100/300/500/700/900`，并保留旧键名以兼容现有图表。
- 语义标注色（`PLOT_SEMANTIC`）：成功/跌 `emerald-700`、危险/涨 `red-700`、警告 `amber-700`、信息 `blue-700`。
- 黄色与浅色档只作大面积填充，不用于小字号文字或细线；坐标轴与主文字使用 foundation ink 或深色档。
- 完整色轮见 [`docs/site-palette.html`](site-palette.html)。

---

## 九、代码来源与维护入口

| 范围 | 主要文件 |
|------|----------|
| 全站暖色常量 | `src/lib/site-theme.ts` |
| 站点扩展色轮 | `src/lib/site-palette.ts` |
| Tailwind 扩展色板变量 | `src/app/site-palette.css` |
| 全局、导航、通用 UI、暗色及频道变量 | `src/app/globals.css` |
| 首页/生活 scholarly 变量 | `src/app/home.module.css` |
| 文章频道样式 | `src/components/article/article-channel-styles.ts` |
| 首页叙事色 | `src/components/home/`（消费 `site-*`，不自建色值） |
| 技术频道 | `src/components/features/TechChannelLayout.tsx` |
| 生活频道 | `src/components/features/LifeChannelLayout.tsx` |
| 金融频道与专栏 | `src/components/finance/` |
| 创意频道 | `src/components/creative/CreativeInfiniteCanvas.tsx`（`src/app/blog/creative/page.tsx` 仅挂载） |
| 日本行纪主题 | `src/app/globals.css` 的 `.theme-muji` |
| 手绘图表 | `content/components/sketchy/`、`content/components/rag/` |

维护时遵循以下顺序：

1. 修改全站颜色原料时，先更新 `site-palette.ts` 与 `site-palette.css`，两边必须保持同名同值；`site-theme.ts`、语义 token 和组件只选择这些原料。
2. 修改频道强调色时，只影响相应频道及其文章样式，不改写全站核心色。
3. 修改通用 UI 的 `primary`、`accent` 或图表 token 时，确认不会误影响内容页面中的第三方组件。
4. 新增暗色样式时，必须明确是单个组件支持暗色，还是准备扩展全站暗色主题。
5. 新增业务图表颜色时从 `plot-palette.ts` 选择；不要在图表组件附近新增 Hex。

---

## 十、当前边界

- 全站暖色编辑基线、频道强调色、首页叙事色、通用 UI 和共享图表都已接入扩展色板。
- UI 中不直接使用 Tailwind 默认颜色家族，统一使用 `site-*` 家族或语义 token。
- 暗色模式不是全站完整主题。
- 原始 Hex 只允许出现在色板源文件、第三方品牌标志、内容素材（如书封配色）以及测试 fixture 中；透明黑白只用于阴影、遮罩、玻璃高光和 Canvas 纹理等光学运算，不承担主题语义。
