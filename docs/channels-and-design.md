# 频道、专栏与文章

## 三层架构

```
频道（Channel）
├── 专栏（Column）
│   └── 文章（Article）
```

- **频道**：内容大分类，对应 `CHANNELS_CONFIG` 中的顶级 key（`tech` / `life` / `finance` / `creative`）。
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
| **技术** | 技术分享与学习笔记 | 4 | `/blog/tech` |
| **生活** | 生活感悟与旅行记录 | 3 | `/blog/life` |
| **金融** | 投资交易与金融市场分析 | 2 | `/blog/finance` |
| **创意** | 逻辑与感性的液态交汇 | 3 | `/blog/creative` |

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
- 金融频道当前只显示「暂无内容」占位状态；`FinanceChannelClient`、`TempoHero`、`TempoGrid`、`DataWall`、`DebugPanel` 属于未挂载的历史/实验实现，不能作为频道默认风格依据。

### 博客聚合页（`/blog`）

- 定位为首页滚动叙事之外的快捷内容入口，不使用 WebGL、滚动时间线、全屏图片或入场动画。
- 使用 warm editorial 的米色纸感背景、衬线大标题、细分隔线与无圆角目录列表。
- 首屏直接提供四个频道入口及文章数量，下方通过「内容地图」展示跨频道的主题脉络，再展示最近 12 篇文章；信息层级仍以快速扫读和直接到达为优先。
- 内容地图的人工编辑数据集中维护在 `src/data/content-graph.ts`，同时作为文章底部自动推荐的统一关系源；MDX `nextReads` 只承担人工置顶，不重复描述完整关系。
- 所有可见文章必须进入至少一条阅读脉络。`scripts/validate-content-graph.ts` 在开发、构建和响应式测试前检查 slug、关系端点、重复项、自关联以及 `nextReads` 引用。
- `src/components/features/BlogKnowledgeMap.tsx` 使用 SVG 与 `d3-force` 计算小规模关系布局。桌面端支持主题筛选、节点选择与关系理由预览；移动端退化为按脉络排列的文章列表。
- 页面主体继续保持 Server Component，仅将内容地图隔离为 Client Component。

---

## 各频道专栏详情

### 技术（tech）

| 专栏 key | 名称 | 标签 | 封面 |
|----------|------|------|------|
| `go` | Golang 精进之路 | `Go`, `golang` | 自定义封面图 |
| `general` | 通用技术 | `技术`, `programming`, `tech` | — |
| `ai-engineering` | AI 工程 | `AI工程`, `AI Engineering`, `智能体`, `Agent`, `工作流` | — |
| `knowledge-management` | 知识管理 | `知识管理`, `个人知识库`, `学习方法` | — |

**频道页设计风格**

- **整体色调**：warm editorial 主题，背景 `#F0EEE7`，卡片 `#E2DBCE`，正文/标题 `#141413`。频道页、专栏页、文章详情页通过 `data-tech-page` / `data-life-page` 下的 `--channel-*` 变量保持一致。
- **Hero**：全屏高度，左右分栏布局。左侧大标语「探索技术前沿」（Inter 粗体，6xl），副标题「谦逊，自驱，持续」，右侧放置 `public/images/channels/tech-cover.svg` 矢量插图。
- **技术栈区块**：`ProgrammerDetails` 组件展示技术栈标签云与技能熟练度。
- **专栏卡片**：左右分栏（左图右文），`rounded-2xl`，背景 `var(--channel-card)`，边框 `var(--channel-border)`，封面图 hover 时 `scale-105` 过渡。
- **文章卡片**：三列网格，背景 `var(--channel-card)`，正文 `var(--channel-muted)`，标题 `var(--channel-ink)`，顶部叠加「置顶」和「专栏」标签。
- **文章详情页**：采用「顶部信息区 → 独立媒体区 → 正文阅读区」三段结构。桌面端以 `75vw` 容器和 12 栅格组织：标题/摘要与正文都从第 2 栏开始并占 8 栏，右侧基础信息占 2 栏并与标题内容块底部对齐；媒体区占中间 10 栏；目录占右侧 2 栏并与正文保持 1 栏呼吸空间。目录仅在正文区右侧展示，只展示正文 H2-H4，不重复文章标题。
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

当前没有专栏和文章。`/blog/finance` 使用全站暖色背景，居中显示频道名和「暂无内容」，不渲染 Hero、精选、归档、专栏或市场研究区块。

---

### 创意（creative）

| 专栏 key | 名称 | 标签 | 封面 |
|----------|------|------|------|
| `design` | 设计美学 | `设计`, `design`, `视觉`, `美学`, `交互` | Unsplash |
| `product` | 产品设计 | `产品`, `product`, `设计`, `UX`, `UI` | Unsplash |
| `notes` | 创意手记 | `创意手记`, `灵感`, `网站设计`, `视觉表达`, `交互`, `地图`, `摄影` | 自定义 |

**频道页设计风格**

- **页面模型**：固定为一个视口高度（`100svh`）的横向创意画布，不产生纵向内容流。视口只展示整个画布的一部分。
- **无限循环**：画布周期重复三次，GSAP 将轨道位置限制在相邻周期之间；越过边界时归一化到内容相同的位置，因此没有可见回卷。周期宽度由排版结果动态计算，不再固定为 `2760px`。
- **输入映射**：GSAP `ScrollTrigger.observe()` 统一接收鼠标滚轮、触控板、触摸和指针拖拽。垂直滚轮输入转换为水平位移；左右方向键和 Page Up / Page Down 作为键盘入口。
- **底层网格**：每个周期固定 4 行、最少 15 列。列宽 `160px`、间距 `24px`；内容不足时保持 15 列，内容增加时以 5 列为一个阶段向右扩展。网格单元两侧绘制低对比度虚线，卡片遮住网格，空白处暴露构造线。
- **组合方式**：采用“有约束的不规则”。卡片均落在共同网格上，通过固定的原子尺寸、不同起始位置和内容形式形成错落关系，不使用瀑布流、随机绝对定位或空网格单元。
- **内容差异**：专栏、文章与获准进入频道的视觉素材共用同一套槽位，不按内容层级绑定大小；各卡片仍按稳定哈希选择影像、深色、浅色、紫色、珊瑚色或绿色表达。统一的是圆角、细边框和柔和阴影，不统一卡片配色与内部模板。
- **视觉裁切**：初始相位在左边保留上一周期的尾部，让画布呈现向两侧继续延伸的感觉；左右边缘使用轻微背景渐隐。
- **动效降级**：`prefers-reduced-motion` 下取消惯性时长，仍保留直接位移与键盘访问。
- **实现入口**：路由页保持 Server Component，读取文章与专栏数据；`src/components/creative/CreativeInfiniteCanvas.tsx` 是独立 Client Component，负责 GSAP、DOM 测量和输入事件清理。

**自动分布算法**

- 只有频道标题保留固定锚点；专栏、文章和视觉素材都进入自动布局，不再由内容层级决定固定尺寸。
- 尺寸等级完全原子化：XL=`5×3`、L=`4×2`、M=`3×2`、S=`2×1`、XS=`1×1`。每个等级只有一个尺寸，不提供 `1×2` 竖卡或同等级候选尺寸。
- `src/lib/creative/canvas-entries.ts` 先搜索一组可密铺的尺寸配额，再按编辑精选、封面表现力、标题长度、摘要、日期、专栏重复度和内容形态重复度，让专栏、文章、图片共同竞争 XL→L→M→S 槽位。内容类型本身不映射尺寸；稳定哈希只用于同分决胜、色调和视觉变体。
- `src/lib/creative/canvas-layout.ts` 按面积从大到小处理槽位，并通过精确覆盖求解器从首个空单元递归铺设固定矩形。算法优先寻找最短的完整画布；只有内容总面积或形状确实不能整铺时，才用 `1×1` 小组件补齐剩余单元。
- 每一列使用 4-bit 位掩码记录占用状态；候选位置在评分前必须通过逐列位运算碰撞检查，因此两个卡片不能共享网格单元。
- 精确密铺失败时保留评分式降级路径，候选评分考虑扩展新列、同色/同尺寸相邻、孤立单格孔洞、边缘对齐、行节奏和稳定哈希微扰。
- 排版以专栏 key、文章 slug 或素材 ID 和固定 seed 保证同一内容集结果稳定，不使用运行时随机尺寸。
- 当前频道页展示全部创意专栏、全部创意文章，以及首页 Create Gallery 中唯一标记为 `creative` 的 3D 打印素材。8 张素材仍统一维护在 `src/data/creative-gallery.ts`，通过 `surfaces` 控制展示范围；以后只需给素材增加 `creative` 即可扩充。
- 新增内容后算法会重新搜索尺寸配额与密铺方案，允许可控重排；空间不足时画布以 5 列为步长扩展。算法输出 `columns`、`placements` 和 `byId`，组件据此生成 CSS Grid 坐标与周期宽度。对应单元测试覆盖原子尺寸、内容匹配、精确密铺、最小单元封口、确定性、动态扩列和无重叠约束。

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

### 其他专栏

技术、生活（除日本外）、创造频道的专栏页统一使用 `ColumnLayout` 组件，但会按频道保留轻量差异：

- 技术、生活专栏页通过 `data-tech-page` / `data-life-page` 使用 `--channel-*` warm editorial 变量。
- 创造专栏页使用 `SITE_WARM_BACKGROUND` 作为页面背景，文章列表卡片使用 `GlassCard` 的深色玻璃表达。
