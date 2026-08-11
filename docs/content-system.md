# 内容系统

## MDX 文件组织

- 所有博客文章存放于 `content/blog/`，按频道/专栏用子目录组织。
- `CHANNELS_CONFIG` 中每个专栏都必须对应一个 `content/blog/{channel}/{column}` 目录；即使专栏暂时没有文章，也要用 `.gitkeep` 保留空目录。
- **文件路径即 slug（默认可被覆盖）**：`content/blog/life/japan/kyoto.mdx` → slug `life/japan/kyoto`。
- **Frontmatter 中的 `slug` 字段现在真正生效**：如果提供了 `slug`，它会**覆盖文件名部分**作为 URL 的最后一段，目录结构保持不变。例如 `content/blog/tech/general/post.mdx` 中 `slug: "custom"` → URL `/blog/tech/general/custom`。`slug` 不能包含 `/`、`.` 等路径分隔符或遍历字符。
- 通用动态路由 `src/app/blog/[...slug]/page.tsx` 捕获所有文章详情页。

### 文件路径 → URL 映射规则

| 文件路径 | frontmatter slug | 索引 slug | 访问 URL |
|---------|-----------------|-----------|---------|
| `content/blog/tech/general/my-post.mdx` | — | `tech/general/my-post` | `/blog/tech/general/my-post` |
| `content/blog/tech/general/post.mdx` | `custom` | `tech/general/custom` | `/blog/tech/general/custom` |
| `content/blog/life/japan/kyoto.mdx` | — | `life/japan/kyoto` | `/blog/life/japan/kyoto` |
| `content/blog/hello-world.mdx` | — | `hello-world` | `/blog/hello-world` |

**关键注意**：不要将文章放在和频道/专栏路由同名的目录结构中，除非该路径确实是你期望的 URL。例如 `content/blog/tech/general/post.mdx` 的 URL 是 `/blog/tech/general/post`，这是合法的，因为专栏路由 `/blog/tech/[columnSlug]` 的 `[columnSlug]` 在 App Router 中**只匹配单个路径段**，不会拦截多段路径。

---

## Frontmatter 规范

```yaml
---
title: string               # 文章标题（必填）
date: string (YYYY-MM-DD)   # 发布日期（必填）
author: string              # 作者名
tags: string[]              # 内容标签数组（必填，至少一个）
excerpt: string             # 摘要
coverImage: string          # 封面图 URL
pinned: boolean             # 可选，置顶文章（排序优先）
channel: string             # 频道（必填：tech/life/finance/creative）
column: string              # 专栏（必填，必须属于对应频道）
columnSlug: string          # 可选，显式指定专栏 slug
hidden: boolean             # 设为 true 则文章不在列表展示，详情读取返回 null；底层索引仍保留该条目
nextReads: string[] | { slug: string, reason?: string }[]  # 可选，置顶文章底部的人工推荐
---
```

### 图片与媒体托管

- MDX 正文图片和 `coverImage` 必须使用火山引擎 TOS URL，不得新增 `/blog-assets/...`、`/images/...` 等站内静态路径。
- 图书封面和印章图片遵循同一规则，`public/` 只保留通用 UI 占位图，不保留业务图片副本或待上传目录。
- 当前 `efficient-go-cpu-macro.mdx` 中 5 张已删除的本地图片仍待补 TOS URL；在迁移完成前应视为已知媒体缺口，不要恢复到 `public/blog-assets/`。
- 上传或替换远程图片后，确认域名已在 `next.config.ts` 的 `images.remotePatterns` 中登记，并运行内容校验与构建。

### 推荐阅读与内容图谱

文章详情页会根据 `src/data/content-graph.ts` 自动生成正文下方的“接下来阅读”，通常输出 2-3 篇。推荐顺序固定为：

1. frontmatter `nextReads` 中的人工置顶项；
2. 当前文章指向的 `sequence` / `applied-in` 有向关系；
3. 与当前文章相连的 `related` / `reflection` 双向关系；
4. 当前文章所在阅读脉络中的邻近文章，优先后续文章，再补前置背景。

`nextReads` 只用于覆盖默认排序，不需要在每篇文章中重复维护图谱关系。推荐项使用 `/blog/` 后面的完整文章 slug，例如当前文章访问地址是 `/blog/tech/ai-engineering/pi-agent`，则 slug 写 `tech/ai-engineering/pi-agent`。

简写形式：

```yaml
nextReads:
  - tech/ai-engineering/pi-agent
  - creative/product/notion-zen
```

带推荐理由：

```yaml
nextReads:
  - slug: tech/ai-engineering/pi-agent
    reason: 继续理解 AI 工程化落地方式
  - slug: creative/product/notion-zen
    reason: 从产品体验角度延伸阅读
```

页面渲染时会从文章索引中读取标题、摘要、日期、封面、频道和专栏信息，并对人工项与图谱候选统一去重。找不到的 slug、隐藏文章和当前文章自身会被跳过；开发环境会在控制台输出提示。`npm run content:validate` 会在开发、构建和响应式测试前检查图谱与 `nextReads` 引用，失效引用会直接让流程失败。

所有可见文章必须至少属于一条 `CONTENT_GRAPH_TRAILS` 阅读脉络。新增文章时应同步补充脉络；只有需要表达明确语义时才新增 `CONTENT_GRAPH_RELATIONS`，不要为了凑边而创建无意义关系。

---

## 频道与专栏配置

`src/lib/channels.ts` 中定义 `CHANNELS_CONFIG`，包含以下频道：

- **tech**（技术）：Golang 精进之路、通用技术、AI 工程
- **life**（生活）：日本行纪、年度总结、杂记
- **finance**（金融）：当前无专栏，频道页显示「暂无内容」
- **creative**（创意）：设计美学、产品设计、创意手记

每篇文章的频道与专栏归属完全由 frontmatter 中的 `channel`/`column` 字段决定。`channel` 必须是 `CHANNELS_CONFIG` 中存在的频道 key，`column` 必须是对应频道下的专栏 key，否则构建会失败。

`tags` 不再决定专栏归属，仅作为内容标签用于展示、SEO 和标签筛选。作者应按下方规范填写标签，无需让标签匹配专栏配置。

判断文章归属时应以 frontmatter 中的 `channel`/`column` 为准。

### 标签规范

- 标签描述文章的主题、对象或方法，不重复承担频道/专栏归类职责。
- 每篇文章至少填写 1 个标签，通常控制在 2-5 个；具体技术、地点、工具等长尾标签可以只出现一次。
- 技术专有名词使用官方写法，如 `Agent`、`RAG`、`Go`；一般概念优先使用中文。
- 同一概念只保留一种写法。当前废弃别名及替代项维护在 `src/lib/article-tags.ts`。
- 索引构建会拒绝空标签、重复标签、首尾空格和废弃别名；超过 5 个标签会产生 warning。

---

## 文章索引

- `src/lib/post-index.ts` 负责扫描文件系统、解析 frontmatter、排序（置顶优先，其次按日期降序）。
- 索引写入 `src/data/posts/index.json`，同时在内存中缓存（`_memIndex`），避免开发时重复磁盘 IO。索引带有 schema 版本；版本变化时会自动重建。
- 索引构建会通过 MDX AST 提取正文实际使用的自定义组件，写入每篇文章的 `components` 字段。代码块中的组件示例不会被计入；正文使用未注册组件会直接导致索引构建失败。
- `src/lib/post.ts` 提供文章读取接口。开发环境绕过文章缓存；生产环境中，文章详情 TTL 为 15 分钟，频道/专栏列表为 8 分钟，文章列表和摘要为 10 分钟。
- **索引重建策略**：开发环境下，`getOrBuildPostsIndex()` 会对比磁盘文件集合与索引中的 `rel` 字段集合，任一方向不一致（新增、删除、改名）都会触发自动重建。生产环境信任构建时生成的索引。
