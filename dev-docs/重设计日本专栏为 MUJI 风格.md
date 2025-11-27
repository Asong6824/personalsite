## 目标
- 清空并重设计生活频道下“日本”专栏页，建立统一 MUJI 配色与版式。
- 打造两大区域：File Cover（左日本地图，右竖排“日本”）与 Container（日本简介 + 文章列表）。
- 为后续 Figma 导出组件提供 MUJI 主题变量，统一低饱和、中性、温暖极简的视觉风格。

## MUJI 配色规范
- 颜色变量（低饱和、中性、温暖）：
  - `--muji-bg`: `#F7F4EF`（温暖米白，页面背景）
  - `--muji-paper`: `#FEFCFA`（纸感白，卡片背景）
  - `--muji-ink`: `#4A4A4A`（柔和墨色，正文）
  - `--muji-taupe`: `#A0927D`（低饱和褐灰，说明文字）
  - `--muji-wood`: `#8B7355`（温暖木色，标题/强调）
  - `--muji-border`: `#E5DDD5`（浅暖灰，边框）
  - `--muji-accent`: `#C8B99C`（细节点缀线）
- 添加方式：在 `src/app/globals.css` 中新增 `.theme-muji { ... }` 作用域变量；页面根包裹元素加 `className="theme-muji"`。

## 日本地图状态颜色设计
- 语义目标：在日本地图上用由浅入深的三种颜色表达旅行深度（游玩过 < 住宿过 < 居住过），保持 MUJI 低饱和、温暖、中性风格。
- 颜色定义：
  - 游玩过（浅）：`#EAE3D8`（温暖米白的浅砂色，低饱和，轻覆盖）
  - 住宿过（中）：`#CBB89B`（偏褐灰的中间层次，与 `--muji-accent` 氛围统一）
  - 居住过（深）：`#8B7355`（与 `--muji-wood` 一致的深木色，强调稳定与归属）
- 变量命名（在 `.theme-muji` 作用域中新增）：
  - `--muji-map-visited: #EAE3D8`
  - `--muji-map-stayed: #CBB89B`
  - `--muji-map-lived: #8B7355`
- 使用建议：
  - 根据都道府县状态设置 SVG `path` 的 `fill` 为对应 `var(--muji-map-...)`。
  - 保持统一细描边：`stroke: white` 或 `stroke: var(--muji-paper)`，`stroke-width: 0.5`，以保证温暖细腻的分割效果。
  - 悬浮高亮只增强描边与轻微亮度（如 `stroke: var(--muji-wood)`、`stroke-width: 2`、`filter: brightness(1.05)`），避免改变状态填充色造成语义混淆。
- 可读性与一致性：三色在 `--muji-bg` 背景下具备良好层次与对比；整体维持低饱和度与温暖中性，符合 MUJI 原则。

## 页面改造
- 路由入口：`src/app/blog/life/[columnSlug]/page.jsx:42-59` 已对 `japan` 使用定制布局，沿用入口。
- 重写日本专栏布局：`src/components/features/columns/life/JapanColumnLayout.jsx`
  - 接口：加入 `posts` 参数用于文章列表（现文件未使用 `posts`）。
  - File Cover（首屏）：
    - 左侧：卡片包裹 `Japan` 地图，来源 `public/images/maps/japan.svg`；卡片上下增加“JAPAN”提示与“日本列岛地图概览”说明；卡片使用 `--muji-paper` 背景、`--muji-border` 边框。
    - 右侧：竖排“日本”大字，使用 `--muji-wood` 颜色、轻字重，字距稍扩，呼应 MUJI 极简。
    - 页面背景使用 `--muji-bg`。
  - Container（正文区）：
    - 顶部：专栏标题与 `columnConfig.description` 的简介，采用 `--muji-wood`/`--muji-taupe`。
    - 文章列表：复用通用 `ColumnLayout.jsx` 的列表结构与动效（`src/components/features/ColumnLayout.jsx:92-167`），但替换为 MUJI 主题色与直角卡片（`rounded-none`），边框与底色来自 MUJI 变量；每卡片展示标题、摘要、作者、日期与标签。
- 面包屑：保留并切换到 MUJI 配色（墨色 + 木色分隔符）。

## Figma 导出组件的 MUJI 化
- 统一调色并去除强紫：
  - `/.figma/93_235/index.module.scss`：将 `background-image: linear-gradient(...)` 改为纯色或极低对比背景（`var(--muji-bg)`），右侧标题使用 `--muji-wood`/`--muji-paper`。
  - `/.figma/93_239/index.module.scss`：地图容器 `maps` 改用 MUJI 变量；删除或弱化 `pin` 的高对比白。
  - `/.figma/85_215/index.module.scss`：替换全部紫色为 MUJI 变量，标题与说明文字按 `--muji-wood`/`--muji-taupe`。
  - `/.figma/42_86/index.module.scss`：`japan` 图尺寸保留，周围背景改用 `--muji-paper`，必要时为 SVG 设定 `filter: saturate(.7) brightness(1.02)` 以匹配低饱和温暖基调。
- 使用方式：在需要展示 Figma 组件的页面或段落外层加 `.theme-muji`，其内部 SCSS 使用 `var(--muji-...)`。

## 代码更新点
- `src/app/globals.css`
  - 新增 `.theme-muji { --muji-bg ... }` 变量块；可选添加 MUJI 卡片/按钮/分隔线的工具类（如 `.muji-card`、`.muji-sep`）。
- `src/components/features/columns/life/JapanColumnLayout.jsx`
  - 更新签名：`function JapanColumnLayout({ channelKey, channelConfig, columnKey, columnConfig, posts })`。
  - 根元素添加 `className="theme-muji"`，所有颜色改为 `var(--muji-...)`。
  - 新增 Container：简介 + 基于 `posts` 的文章列表（复用通用列表结构与动画，替换成 MUJI 颜色与直角卡片）。
- `src/app/blog/life/[columnSlug]/page.jsx`
  - 保持现有传参（已传入 `posts`），无需路由变更。

## 文章数据来源
- `getPostsByColumn('life','japan')` 已在路由使用（`page.jsx:21-22,34-37`）；当前存在日本相关文章：
  - `content/blog/japan-travel-sapporo.mdx`
  - `content/blog/japan-train-generality.mdx`
  - `content/blog/japan-live.mdx`
  - `content/blog/japan-gion-matsuri.mdx`
- Container 将按该数据渲染。

## 验证
- 启动本地开发后访问 `/blog/life/japan`，检查：
  - 首屏 File Cover 的背景、卡片边框与竖排汉字是否符合 MUJI 原则。
  - Container 的简介与文章列表颜色和边距是否统一低饱和、温暖极简。
  - 移动端断点下栅格与竖排标题显示正常。

## 交付内容
- MUJI 主题变量与工具类。
- 重写的日本专栏 MUJI 布局（File Cover + Container）。
- Figma 导出组件的 MUJI 调色方案与落地到 SCSS 变量化。