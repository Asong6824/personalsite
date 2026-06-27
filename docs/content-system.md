# 内容系统

## MDX 文件组织

- 所有博客文章存放于 `content/blog/`，按频道/专栏用子目录组织。
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
---
```

---

## 频道与专栏配置

`src/lib/channels.ts` 中定义 `CHANNELS_CONFIG`，包含以下频道：

- **tech**（技术）：Golang 精进之路、通用技术、产品设计、设计美学
- **life**（生活）：日本行纪、年度总结、杂记
- **finance**（金融）：财经投资
- **creative**（创意）：设计美学、产品设计

每篇文章的频道与专栏归属逻辑：优先使用 frontmatter 中的 `channel`/`column` 字段，否则通过 `tags` 匹配专栏配置中的 `tags` 进行自动归类。

`channel` / `column` 一旦显式填写，就必须存在于 `CHANNELS_CONFIG`。当前索引脚本对不存在的专栏只输出 warning，不会阻止构建；新增或迁移文章时不要把 warning 当成有效分类。

当前内容目录仍有迁移中的重复文章和少量未配置专栏。清理完成前，判断文章归属时应同时检查 frontmatter、索引与 `CHANNELS_CONFIG`，不能只依赖文件目录。

---

## 文章索引

- `src/lib/post-index.ts` 负责扫描文件系统、解析 frontmatter、排序（置顶优先，其次按日期降序）。
- 索引写入 `src/data/posts/index.json`，同时在内存中缓存（`_memIndex`），避免开发时重复磁盘 IO。
- `src/lib/post.ts` 提供文章读取接口。开发环境绕过文章缓存；生产环境中，文章详情 TTL 为 15 分钟，频道/专栏列表为 8 分钟，文章列表和摘要为 10 分钟。
- **索引重建策略**：开发环境下，`getOrBuildPostsIndex()` 会对比磁盘文件集合与索引中的 `rel` 字段集合，任一方向不一致（新增、删除、改名）都会触发自动重建。生产环境信任构建时生成的索引。
