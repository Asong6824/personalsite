# 响应式布局质量审计

## 文档目的

本文记录 2026-07-17 全站响应式巡检中发现的质量问题、根因、处理结果与剩余风险。它既是本轮工作的复盘，也是后续新增页面、文章组件和媒体资源时的回归基线。

本轮覆盖范围：

- 43 个可视路由：入口/聚合页、4 个频道、11 个专栏、23 篇已索引文章、印章页和数据演示页。
- 6 个 Chromium 核心视口：320×568、390×844、768×1024、1024×768、1440×900、1920×1080。
- 480、640、768、1024、1280、1536 六个断点的前后 1px。
- 首页 WebGL、移动导航、印章无限画布和数据图表专项交互。

状态说明：

- **已修复**：产品代码、内容或测试基础设施已经修改，并完成针对性复测。
- **规则修正**：产品行为合理，原检测方式产生误报，已修正审计规则。
- **待处理**：仍存在用户体验、资源可靠性或工程风险。
- **已接受**：当前明确不纳入覆盖，但必须保留记录。

---

## 已修复问题

| ID | 领域 | 问题与影响 | 根因 | 处理 |
|----|------|------------|------|------|
| R-01 | 测试基础设施 | 项目只有 Vitest 单元测试，没有页面级响应式回归能力 | 缺少浏览器自动化配置和路由清单 | 引入 Playwright，新增六组 Chromium 视口、失败截图、trace 和 HTML 报告 |
| R-02 | 覆盖完整性 | 动态专栏和文章容易漏测 | URL 依赖人工维护 | 从 `CHANNELS_CONFIG` 和文章索引动态生成 43 个页面路由 |
| R-03 | 文章排版 | Agent Tool 文章的 OpenAI 文档长链接在 390px 下越界 | 行内链接没有断词策略 | 为 `.article-reading-prose a` 增加 `overflow-wrap: anywhere` |
| R-04 | 数据图表 | 数据演示页表格在 390px 下被裁切 | 六列表格没有局部横向滚动容器 | 表格外层增加 `overflow-x: auto`，表格设置稳定最小宽度 |
| R-05 | 数据完整性 | 数据演示页请求 `stocks-aapl-msft-demo` 返回 404，图表无法渲染 | 示例数据文件已从仓库删除，但页面仍引用该 ID | 恢复轻量数据 fixture，并纳入页面测试 |
| R-06 | 数据展示 | 数据集图表表格显示 `undefined` 涨跌数据 | Dataset 映射只生成 points，没有生成 latest 摘要 | 由最后两个点计算 price、prevClose、change 和 changePct |
| R-07 | MDX 正确性 | 色彩文章触发 React hydration mismatch | 显式 `<p>` 内的 Markdown 又生成 `<p>`，形成非法 `<p><p>` 嵌套 | 将三个说明容器改为 `<div>`，站内浏览器确认运行时错误消失 |
| R-08 | 首页资源 | 首页长期停留在 `Initializing WebGL...`，并出现 `Invalid or unexpected token` | Draco 解码器运行时依赖 Google 远程脚本，自动化环境加载不稳定 | 将 Three.js 自带 Draco 解码器放入 `public/home-experience/runtime/draco/` 并改用站内路径 |
| R-09 | 媒体可靠性 | Go 文章 5 张图片在浏览器中全部加载失败 | 掘金图片服务按 UA/Referer 拒绝热链 | 下载原图到 `public/blog-assets/tech/go/`，MDX 改用站内资源并补充语义化 alt |
| R-10 | 调试污染 | 所有开发页面默认出现 FPS 和 React Scan 覆盖层，影响视觉检查并增加运行时噪声 | `PerformanceMonitor` 全局挂载且无显式开关 | 改为仅开发环境且 `NEXT_PUBLIC_ENABLE_PERFORMANCE_MONITOR=1` 时启用 |
| R-11 | 数据页布局 | 数据演示标题被固定 Navbar 覆盖，小屏左右留白不稳定 | 页面使用裸内联 `padding: 24`，没有站点级顶部间距 | 改为响应式 main 容器、稳定顶部间距和 `min-w-0` |
| R-12 | 移动重定向 | 生产测试中根链接预取触发 CORS，移动页面持续输出 RSC fetch 错误 | 测试基址使用 `127.0.0.1`，Middleware 重定向生成 `localhost` URL | Playwright 和 Next 测试服务器统一使用 `localhost`，保持同源 |
| R-13 | 测试稳定性 | Next dev 冷编译时首页和复杂频道偶发超过 45 秒，首次移动菜单点击可能发生在 hydration 完成前 | 高并发编译、远程资源代理和客户端 hydration 竞争 | worker 降为 2、失败自动重试一次；CI 先生产构建再使用 `next start` 测试 |
| R-14 | 断点测试 | 印章页和数据页在完成 18 次连续 resize 前达到默认超时 | 专项循环工作量高于普通页面用例 | 断点用例独立设置 120 秒超时 |
| R-15 | CI 缺口 | 响应式检查只存在于人工清单，无法阻止回归进入主分支 | 总门禁没有浏览器测试任务 | 新增独立 `responsive-check`，失败时上传报告、截图和 trace |
| R-16 | 依赖安全 | `npm audit` 报告 22 项漏洞，包含 Next critical 与 `next-mdx-remote` high | 核心依赖和传递依赖版本滞后，React Scan 引入较大的非核心依赖树 | 升级 Next 15.5.21、`next-mdx-remote` 6、ECharts 6.1、Mermaid 11.16；移除 React Scan；用已验证 override 固定 Next 的 PostCSS/Sharp 安全版本 |

---

## 检测规则修正

### 1. 页面溢出不能只看 `body.scrollWidth`

Framer Motion 入场动画会短暂把元素平移到视口外；代码块也允许在 `<pre>` 内局部横向滚动。直接使用 `max(body.scrollWidth, documentElement.scrollWidth)` 会把这两类合理行为判为页面溢出。

当前规则：

- 页面级溢出以 `document.documentElement.scrollWidth` 为准。
- 另外扫描链接、标题、段落、表格、图片、SVG 和 Canvas 的边界。
- 位于 `overflow-x: auto/scroll/hidden/clip` 容器内的内容视为受控溢出。
- 位于动画 transform 祖先内的瞬时越界不作为最终布局缺陷。
- 普通正文、媒体或控件越界仍然失败。

### 2. ECharts 不是单一 Canvas

ECharts 当前会生成多层 Canvas。专项测试不能使用要求唯一元素的 `locator("canvas")`，而应批量读取所有 Canvas 边界，并确认每一层都有稳定尺寸且位于视口内。

### 3. Reduced Motion 不能只在客户端强制开启

测试曾在导航前只为浏览器设置 `prefers-reduced-motion: reduce`，导致 Framer Motion 服务端输出与客户端首次渲染条件不同，出现 hydration 误报。当前全页面巡检不再单边修改该媒体条件。后续如需测试 reduced-motion，应让服务端与客户端使用一致条件，或放在独立的客户端行为测试中。

---

## 待处理问题

| 优先级 | ID | 问题 | 当前影响 | 建议动作 |
|--------|----|------|----------|----------|
| P1 | Q-01 | `src/data/stamps.ts` 中印章 `#093` 引用不存在的 `/images/stamps/kyoto_B83A2E.png` | 页面进入图片 fallback，山崎站印章不可见；Next 图片接口返回非图片内容 | 找回原图并上传 TOS，随后直接替换为远程 URL；不恢复 `public/images/stamps/` |
| P1 | Q-02 | TOS 印章图片在批量测试中多次出现上游 504 | 印章页首次加载变慢，部分图片短暂进入 fallback | 检查 TOS/CDN 可用性与缓存；为收藏页考虑缩略图、预生成尺寸和有限并发 |
| P2 | Q-04 | `LXGW WenKai` 仍通过 jsDelivr `@import` 加载 | 网络慢时 CSS/字体请求拖长生产浏览器测试，也影响首次排版稳定性 | 固定版本并自托管必要字重/子集，避免 `@latest` 和运行时 CSS 依赖 |
| P2 | Q-05 | 生产构建仍有多处 `<img>` ESLint warning | 可能影响 LCP、响应式图片选择和带宽 | 按首屏优先级逐步迁移 `next/image`；对 Canvas/特殊组件保留 `<img>` 时写明理由 |
| P2 | Q-06 | 尚未建立可提交的视觉快照基线 | 自动测试能发现溢出和错误，但不能发现所有间距、比例和视觉层级回归 | 对首页、四频道、文章、印章页建立少量稳定截图基线，动态区域使用 mask |
| P2 | Q-07 | 跨浏览器测试未执行 | Safari/WebKit 和 Firefox 的布局、Canvas、sticky 行为仍有残余风险 | 本轮按用户要求取消；需要发布前再增加代表页面覆盖，不必对全部文章重复执行 |
| P3 | Q-08 | 本地 Node 26 下 Playwright Firefox 安装器在下载结束后卡住；Node 22 可正常完成 | 只影响本地跨浏览器工具链，不影响当前 Chromium 测试；CI 使用 Node 20 | 本地开发统一使用项目支持的 Node LTS，并在未来增加 `.nvmrc` 或 `engines` |
| P3 | Q-09 | Node 26 下持续出现 `module.register()` deprecation 和 localStorage 实验 warning | 日志噪声会掩盖真实测试错误 | 使用 Node 20/22 LTS 运行本项目，升级相关工具后重新评估 |

---

## 已接受的覆盖边界

- 本轮只执行 Chromium；Firefox/WebKit 按用户要求取消。
- API 路由不做视觉布局测试，但数据演示页会间接验证 Dataset API。
- 研究用 `content/blog/tech/general/from-rag-technique-to-rag-philosophy-research.md` 未进入文章索引，不属于线上页面。
- 无限画布允许内部坐标和卡片位于视口外，但页面根节点不得产生浏览器级横向滚动。
- 代码块允许局部横向滚动；普通段落、链接、表格和控件不允许依靠 body 裁切隐藏内容。

---

## 验证结果与限制

已完成：

- 43 个路由在六个 Chromium 核心视口中的全量开发环境巡检。
- 7 类代表页面、6 个断点前后 1px 的边界检查。
- 首页 WebGL、移动导航、印章缩放/筛选、数据图表专项交互。
- Vitest 82 个单元测试、TypeScript 检查和 Next.js 生产构建。
- 生产模式下对首页重定向、聚合页、创意频道/专栏等受影响页面的针对性复测。

限制：

- 本地生产模式完整 330 用例曾因主机名 CORS 问题中断；修复后受影响页面已通过，但没有再次等待整套生产用例完整跑完。
- 远程字体和大量印章图片会显著拉长本地生产测试；CI 已设置生产构建、2 workers 和一次重试，但首次 CI 结果仍需观察。
- 失败截图和重点页面已经人工检查，但当前没有全量视觉 diff 基线。

---

## 后续开发质量规则

1. 新增频道、专栏或文章后，必须确认它自动出现在 `responsiveRoutes` 中。
2. MDX 中不要用显式 `<p>` 包裹会再次生成段落的 Markdown 块；复杂内容使用 `<div>`。
3. 长链接和不可分割文本必须设置断词策略；代码和宽表格必须使用局部滚动容器。
4. WebGL、解码器、核心字体和文章关键图片优先使用固定版本的站内资源，不依赖可能拒绝热链的第三方地址。
5. 调试覆盖层必须显式开启，不得成为默认页面输出。
6. 移动 UA 重定向必须保持 origin，不得硬编码或混用 `localhost` 与 `127.0.0.1`。
7. 修复响应式问题后至少运行受影响视口、相邻断点和一个桌面视口；共享文章样式变更需要运行全部文章路由。
8. Playwright 失败时先区分产品缺陷、受控局部溢出、动画瞬时状态和外部网络错误，再决定修改业务代码还是测试规则。
