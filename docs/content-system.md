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
tags: string[]              # 标签数组，用于频道/专栏归类
excerpt: string             # 摘要
coverImage: string          # 封面图 URL
pinned: boolean             # 可选，置顶文章（排序优先）
channel: string             # 可选，显式指定频道（tech/life/finance/creative）
column: string              # 可选，显式指定专栏
columnSlug: string          # 可选，显式指定专栏 slug
music: string | string[]    # 可选，背景音乐 URL（数组支持多首）
hidden: boolean             # 设为 true 则文章不在列表展示，详情读取返回 null；底层索引仍保留该条目
nextReads: string[] | { slug: string, reason?: string }[]  # 可选，文章底部手动推荐阅读
---
```

### 手动推荐阅读

文章详情页支持在 frontmatter 中配置 `nextReads`，用于在正文下方展示“接下来阅读”。推荐项使用 `/blog/` 后面的完整文章 slug，例如当前文章访问地址是 `/blog/tech/ai-engineering/pi-agent`，则 slug 写 `tech/ai-engineering/pi-agent`。

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

页面渲染时会从文章索引中读取标题、摘要、日期、封面、频道和专栏信息。找不到的 slug、隐藏文章和当前文章自身会被跳过；开发环境会在控制台输出提示。

---

## 频道与专栏配置

`src/lib/channels.ts` 中定义 `CHANNELS_CONFIG`，包含以下频道：

- **tech**（技术）：Golang 精进之路、通用技术、AI 工程
- **life**（生活）：日本行纪、年度总结、杂记
- **finance**（金融）：财经投资、投资方法论
- **creative**（创意）：设计美学、产品设计、创意手记

每篇文章的频道与专栏归属完全由 frontmatter 中的 `channel`/`column` 字段决定。`channel` 必须是 `CHANNELS_CONFIG` 中存在的频道 key，`column` 必须是对应频道下的专栏 key，否则构建会失败。

`tags` 不再决定专栏归属，仅作为内容标签用于展示、SEO 和标签筛选。作者可以自由填写标签，无需担心标签与专栏配置的匹配关系。

判断文章归属时应以 frontmatter 中的 `channel`/`column` 为准。

---

## 文章索引

- `src/lib/post-index.ts` 负责扫描文件系统、解析 frontmatter、排序（置顶优先，其次按日期降序）。
- 索引写入 `src/data/posts/index.json`，同时在内存中缓存（`_memIndex`），避免开发时重复磁盘 IO。
- `src/lib/post.ts` 提供文章读取接口。开发环境绕过文章缓存；生产环境中，文章详情 TTL 为 15 分钟，频道/专栏列表为 8 分钟，文章列表和摘要为 10 分钟。
- **索引重建策略**：开发环境下，`getOrBuildPostsIndex()` 会对比磁盘文件集合与索引中的 `rel` 字段集合，任一方向不一致（新增、删除、改名）都会触发自动重建。生产环境信任构建时生成的索引。
