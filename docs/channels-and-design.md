# 频道、专栏与文章

## 三层架构

```
频道（Channel）
├── 专栏（Column）
│   └── 文章（Article）
```

- **频道**：内容大分类，对应 `CHANNELS_CONFIG` 中的顶级 key（`tech` / `life` / `finance` / `create`）。
- **专栏**：频道下的子主题，由 `tags` 匹配或 frontmatter 显式指定。
- **文章**：MDX 文件，通过 `tags` 自动归入专栏，或由 `channel` / `column` 字段强制指定。

归属逻辑（`src/lib/channels.ts`）：
1. 优先使用 frontmatter 中的 `channel` / `column` 字段
2. 否则通过 `tags` 匹配专栏配置中的 `tags` 进行自动归类

显式填写的 `channel` / `column` 必须存在于配置中。索引脚本目前只对无效专栏发出 warning，因此内容迁移时仍需人工处理告警。

---

## 四个频道总览

| 频道 | 描述 | 专栏数 | 路由 |
|------|------|--------|------|
| **技术** | 技术分享与学习笔记 | 7 | `/blog/tech` |
| **生活** | 生活感悟与旅行记录 | 3 | `/blog/life` |
| **金融** | 投资交易与金融市场分析 | 2 | `/blog/finance` |
| **创造** | 逻辑与感性的液态交汇 | 2 | `/blog/create` |

---

## 全站设计基线

当前站点已收敛到统一的 warm editorial 视觉基线：主背景为米色纸感 `#F0EEE7`，主文字为深炭灰 `#141413`，卡片/分隔层级使用 `#E2DBCE` / `#D8D0C3`，弱化文字使用 `#68645d`。首页、频道页、专栏页与文章详情页可以在此基线之上做频道差异化，但不应重新引入独立的深色、渐变或高饱和主题作为默认页面风格。

**代码来源**

- `src/lib/site-theme.ts`：导出 `SITE_WARM_BACKGROUND` / `SITE_WARM_BACKGROUND_THREE` 作为页面与 Three.js 场景的统一背景常量。
- `src/app/globals.css`：`[data-tech-page]`、`[data-life-page]`、`.theme-warm-editorial` 共享 `--channel-*` 变量；`.theme-muji` 也映射到同一套米色纸感 token。
- `src/app/home.module.css`：`scholarlyTheme` / `scholarlyPalette` 的 `--theme-*` 变量与 warm editorial token 对齐，供生活频道和首页旧式叙事组件复用。

**频道差异化边界**

- 技术、生活、金融、创造频道共享米色纸感背景，只在排版、卡片形态、动效和局部强调色上区分。
- 日本行纪专栏使用 `.theme-muji`，是生活频道内的特殊表达，但仍复用同一组背景、纸张、边框和文字 token。
- 创造频道可以使用液态玻璃和极淡光晕，但主背景仍来自 `SITE_WARM_BACKGROUND`。
- 金融频道当前主实现是杂志式 Editorial 页面；`FinanceChannelClient`、`TempoHero`、`TempoGrid`、`DataWall`、`DebugPanel` 属于未挂载的历史/实验实现，不能作为频道默认风格依据。

---

## 各频道专栏详情

### 技术（tech）

| 专栏 key | 名称 | 标签 | 封面 |
|----------|------|------|------|
| `go` | Golang 精进之路 | `Go`, `golang` | 自定义封面图 |
| `general` | 通用技术 | `技术`, `programming`, `tech` | — |
| `devtools` | 开发工具 | `Git`, `版本控制`, `工具`, `devtools` | — |
| `nlp` | 自然语言处理 | `NLP`, `AI`, `自然语言处理`, `大模型` | — |
| `photography` | 计算摄影 | `摄影`, `photography`, `影像` | 自定义 |
| `product` | 产品设计 | `产品`, `product`, `设计`, `UX`, `UI` | Unsplash |
| `design` | 设计美学 | `设计`, `design`, `视觉`, `美学`, `交互` | Unsplash |

**频道页设计风格**

- **整体色调**：warm editorial 主题，背景 `#F0EEE7`，卡片 `#E2DBCE`，正文/标题 `#141413`。频道页、专栏页、文章详情页通过 `data-tech-page` / `data-life-page` 下的 `--channel-*` 变量保持一致。
- **Hero**：全屏高度，左右分栏布局。左侧大标语「探索技术前沿」（Inter 粗体，6xl），副标题「谦逊，自驱，持续」，右侧放置 `tech_cover.svg` 矢量插图。
- **技术栈区块**：`ProgrammerDetails` 组件展示技术栈标签云与技能熟练度。
- **专栏卡片**：左右分栏（左图右文），`rounded-2xl`，背景 `var(--channel-card)`，边框 `var(--channel-border)`，封面图 hover 时 `scale-105` 过渡。
- **文章卡片**：三列网格，背景 `var(--channel-card)`，正文 `var(--channel-muted)`，标题 `var(--channel-ink)`，顶部叠加「置顶」和「专栏」标签。
- **文章详情页**：采用「顶部信息区 → 独立媒体区 → 正文阅读区」三段结构。桌面端以 `75vw` 容器和 12 栅格组织：标题/摘要占中间 6 栏，右侧基础信息占 2 栏并与标题内容块底部对齐；媒体区占中间 10 栏；正文区占中间 6 栏，目录占右侧 2 栏。目录仅在正文区右侧展示，只展示正文 H2-H4，不重复文章标题。
- **动效**：Framer Motion，`initial={{ opacity: 0, y: 20 }}` + `whileInView`，左右滑入错开 0.2s。

---

### 生活（life）

| 专栏 key | 名称 | 标签 | 封面 |
|----------|------|------|------|
| `japan` | 日本行纪 | `日本`, `japan`, `日本旅行`, `日本文化` | Unsplash |
| `thoughts` | 年度总结 | `年度总结`, `thoughts`, `总结`, `回顾` | 自定义 |
| `misc` | 杂记 | `杂记`, `随想`, `记录` | 自定义 |

**频道页设计风格**

- **整体色调**：与技术频道共享 warm editorial 基础配色，背景 `#F0EEE7`，卡片 `#E2DBCE`，正文/标题 `#141413`。`scholarlyPalette` / `scholarlyTheme` 中的 `--theme-surface`、`--theme-surface-high`、`--theme-ink`、`--theme-outline` 映射到该色系。
- **全局背景**：`SunlitBackground` 固定全视口光晕，营造自然采光感。
- **Hero**：全屏居中，衬线大标题「阿松的生活杂记」（`serifFont displayHeadline`，7xl，font-bold tracking-tight），副标题为等宽小字「Life & Travel」（tracking-widest uppercase），底部有 `var(--theme-outline-variant)` 细边框分隔。
- **旅行记忆**：`TravelSection` 区块，展示旅行足迹。
- **3D 书架**：`BookShelf3D` 独占一个 `100dvh` 区块，可交互的 3D 数字书架。
- **专栏卡片**：几乎无圆角（`border-radius: 2px`），背景 `var(--theme-surface-high)`，1px `var(--theme-outline-variant)` 边框，无阴影。左侧封面 + 右侧内容，「阅读更多 →」按钮使用 `var(--theme-primary)` 背景色，serif 字体。
- **文章卡片**：同样的 2px 微圆角风格，置顶标签使用 `surface-low` 背景 + `primary` 文字 + `outline-variant` 边框，无阴影。标题下方 1px 分隔线。
- **文章详情页**：沿用技术频道的三段式阅读版式，顶部信息与媒体先于正文出现，桌面端使用同一套 `75vw` 容器与 12 栅格比例，目录仅在正文区右侧展示。
- **字体**：全局 `font-light`，标题 `letter-spacing: 0.02em`，正文 `letter-spacing: 0.01em`。
- **分隔线**：章节之间使用 12px 水平细线（`var(--theme-outline-variant)`，opacity 0.6）作为视觉休息。

---

### 金融（finance）

| 专栏 key | 名称 | 标签 | 封面 |
|----------|------|------|------|
| `finance` | 财经投资 | `财经`, `finance`, `投资`, `investment` | Unsplash |
| `investment-methodology` | 投资方法论 | `价值投资`, `第一性原理`, `方法论` | — |

**频道页设计风格**

- **整体色调**：站点统一米色 `#F0EEE7`（纸质感主背景），深炭灰 `#1a1c19`（主文字），深绿 `#506354`（数据标签/点缀），中灰 `#444748`（次要文字），浅灰 `#c4c7c7`（装饰线）。组件卡片仍使用 `#f4f4ef` / `#e3e3de` 做层次区分。
- **字体栈**：
  - 正文：`Inter`
  - 大标题：`Noto Serif SC`（衬线，font-black tracking-tighter，杂志感）
  - 数据标签：`JetBrains Mono`（等宽， Insight #01、METHOD_01 等编号）
  - 装饰引用：`Newsreader`（斜体，Footer 品牌名）
- **Hero**：非全屏，顶部留白 `pt-32`，12 列网格（左 8 右 4）。左侧大字标语「在波动中寻找秩序，在不确定性中寻找确定性。」（Noto Serif SC，7xl，leading-[1.1]）。左下角装饰线（`h-px w-12 rgba(196,199,199,0.4)`）+ 英文斜体引言。右侧等宽数字 `0.618` + 「Market Efficiency Ratio」标签。
- **精选专题 Bento Grid**：
  - 大卡片（8 列）：背景图 `grayscale + mix-blend-multiply + opacity-80`，底部黑色渐变遮罩 + 白色文字，hover `scale-105`（duration-700）。标签使用琥珀色 `#ffdea5` 背景 + `#261900` 文字。
  - 竖卡（4 列）：`#e3e3de` 背景，上下分栏（标题 + 底部日期分隔线）。
  - 三小卡（各 4 列）：`#f4f4ef` 背景，底部 4px 彩色下划线（绿/琥珀/红半透明）。
- **两栏归档**：左侧「财经投资」（文章列表带缩略图，灰度图 hover 恢复彩色），右侧「投资方法论」（卡片式，hover 左侧 2px 绿色边框高亮）。
- **专栏网格**：`#f4f4ef rounded-xl p-8`，hover `shadow-lg`，顶部 JetBrains Mono 编号 `01 ::`。
- **Newsletter CTA**：深色背景 `#1a1c19`，左侧 emoji 装饰（opacity 10%），输入框 `rgba(255,255,255,0.1)` 背景，按钮琥珀色 `#ffdea5`。
- **Footer**：三栏网格，左侧 `Newsreader` 斜体「金融 Editorial」，中间导航与 Legal，右侧版权。hover 金色 `#d4af37`。
- **动效**：Framer Motion `FADE_UP`（opacity 0→1, y 20→0, duration 0.6）+ `STAGGER`（staggerChildren 0.1）。

---

### 创造（create）

| 专栏 key | 名称 | 标签 | 封面 |
|----------|------|------|------|
| `design` | 设计美学 | `设计`, `design`, `视觉`, `美学`, `交互` | Unsplash |
| `product` | 产品设计 | `产品`, `product`, `设计`, `UX`, `UI` | Unsplash |

**频道页设计风格**

- **整体色调**：站点统一米色 `#F0EEE7` 作为频道主背景，叠加极淡的白色与 `#E2DBCE` 环境光晕，保持液态玻璃的轻盈感但不脱离全站背景体系。
- **标题区**：居中对齐。上方标签「Creation Channel」（等宽字体，tracking-[0.3em] uppercase，`rounded-full border border-neutral-200`）。主标题「创造」（`text-6xl sm:text-7xl md:text-8xl font-extralight tracking-tight text-neutral-900`）。副标题「逻辑与感性的液态交汇」（`text-lg md:text-xl text-neutral-500 font-light`）。
- **分隔线**：`w-24 h-px bg-gradient-to-r from-transparent via-neutral-300 to-transparent`，scaleX 从 0 展开的入场动画。
- **专栏卡片**：核心视觉元素。
  - 尺寸固定 `300×200 px`，`rounded-[32px]`。
  - **液态玻璃效果**：使用 `LiquidGlassWrapper`，鼠标跟随的折射/模糊/色散效果。
  - 参数：`displacementScale=60`，`blurAmount=0.3`，`saturation=140`，`aberrationIntensity=2`，`elasticity=0.15`，`cornerRadius=32`。
  - Fallback 状态：`rounded-[32px] border border-neutral-200/50 shadow-sm`。
  - Hover：外部叠加一层 `pointer-events-none` 的边框，`opacity-0 group-hover:opacity-100 transition-opacity duration-500`。
- **卡片内容**：序号（等宽 01/02）、专栏名（2xl semibold）、描述（sm neutral-500）、「进入专栏 →」（hover translate-x-1）。
- **底部导航**：返回博客主页按钮，`rounded-full border border-neutral-200 hover:border-neutral-300`。
- **动效**：Framer Motion，标题 `y: -30 → 0`，卡片 `opacity: 0, y: 40 → 1, 0`（错开 0.15s），分隔线 `scaleX: 0 → 1`。

---

## 专栏页独特设计

### 日本行纪（`/blog/life/japan`）— MUJI 风格

日本专栏拥有全站最独特的设计风格，完全独立于站点默认主题：

- **CSS 作用域**：`.theme-muji`，变量定义在 `globals.css` 中（`--muji-bg`、`--muji-wood`、`--muji-paper`、`--muji-taupe`、`--muji-border`、`--muji-accent`）。
- **配色**：原木色 + 米白 + 纸质纹理，无阴影、无圆角或极小圆角（2px）。
- **布局**：12 列网格，左侧 7 列日本地图（sticky 定位），右侧 5 列竖排文字。
- **排版**：竖排文字（`writing-mode: vertical-rl`，`textOrientation: upright`），使用 `Yu Mincho` / `Hiragino Mincho ProN` / `Noto Serif JP` 日系衬线体，`font-weight: 300`，`letter-spacing: 0.06em`。三行标语错落排列（上下偏移 10%~14%）：
  - 上：「風の音」
  - 中：「道にまかせて」
  - 下：「日本みる」
- **交互**：日本地图 SVG（`InlineSvgWithHover`），hover 时 `stroke: var(--muji-wood)` + `brightness(1.05)`，点击都道府县可高亮并在左下角显示名称标签（`var(--muji-paper)` 背景 + `var(--muji-wood)` 文字 + `var(--muji-border)` 边框）。
- **文章列表**：`muji-card`，hover `shadow-lg`，标题 `font-light`，标签使用 `#F0EBE5` 背景 + `var(--muji-wood)` 文字 + `var(--muji-border)` 边框。
- **分隔线**：12px 水平线，`var(--muji-accent)`，opacity 0.6。

### 财经投资（`/blog/finance/finance`）— 杂志式 Editorial

金融专栏页与金融频道页共享同一套 Editorial 设计语言，但布局更聚焦：

- **面包屑**：首页 › 博客 › 金融 › 专栏名（`text-sm`，`#444748`，hover `#1a1c19`）。
- **列标题区**：Flex 左右对齐。左侧 `Noto Serif SC` 大标题（5xl~6xl，font-black tracking-tighter）+ 描述段落。右侧「Editorial Column」（JetBrains Mono，uppercase tracking-widest，深绿色 `#506354`）+ 底部黑色粗线（`h-1 w-24 #1a1c19`）。
- **标签过滤**：顶部 Pill 按钮栏，`rounded-full px-5 py-2`。Active 状态：`#1a1c19` 背景 + 白字。Inactive 状态：`#f4f4ef` 背景 + 黑字。
- **主内容区（8 列）**：文章列表为左图右文卡片。左侧 1/3 灰度图（`grayscale`，hover `grayscale-0 transition-all duration-700`），右侧标题带 `#ffdea5` 下划线装饰色，底部「READ ARTICLE →」（uppercase tracking-widest）。
- **侧边栏（4 列）**：
  - **专栏洞察**：`#f4f4ef` 背景卡片，含文章数量 / 作者数 / 最近更新（JetBrains Mono 数据）+「订阅此专栏」按钮（`#1a1c19` 背景白字）。
  - **热点议题**：前 3 篇文章标题列表，编号 `01 / TOPIC`（JetBrains Mono）。
  - **引用卡片**：深色背景 `#1a1c19`，aspect-[3/4]，底部 Buffett 名言（Noto Serif SC 斜体）。
- **空状态**：📭 图标 + 居中提示「该专栏暂无文章」。
- **Footer**：同金融频道页，三栏网格，Newsreader 斜体品牌名。

### 其他专栏

技术、生活（除日本外）、创造频道的专栏页统一使用 `ColumnLayout` 组件，但会按频道保留轻量差异：

- 技术、生活专栏页通过 `data-tech-page` / `data-life-page` 使用 `--channel-*` warm editorial 变量。
- 创造专栏页使用 `SITE_WARM_BACKGROUND` 作为页面背景，文章列表卡片使用 `GlassCard` 的深色玻璃表达。
- 金融专栏页不走 `ColumnLayout`，而是使用 `FinanceColumnLayout`，与金融频道首页共享杂志式 Editorial 语言。
