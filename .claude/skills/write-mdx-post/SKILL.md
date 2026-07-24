---
name: write-mdx-post
description: 在项目中新增或编辑一篇 MDX 博客文章。涉及文件路径选择、frontmatter 填写、tags 归类、路由冲突检查。触发词："写篇文章"、"新增文章"、"添加博客"、"写博客"、"新建 mdx"、"发布文章"。
---

# Write MDX Post — 写博客文章

## 适用场景

- 用户要求撰写一篇新博客文章
- 用户要求编辑/修改已有文章
- 用户不确定文章该放在哪个目录

## 核心 Workflow（写新文章时）

### Step 1：确定频道与专栏

阅读 `src/lib/channels.ts` 中的 `CHANNELS_CONFIG`，根据文章主题匹配 tags：

| 频道 | 专栏 | 匹配 tags |
|------|------|-----------|
| `tech` | `go` | `Go`, `golang` |
| `tech` | `general` | `技术`, `programming`, `tech` |
| `tech` | `product` | `产品`, `product`, `设计`, `UX`, `UI` |
| `tech` | `design` | `设计`, `design`, `视觉`, `美学`, `交互` |
| `life` | `japan` | `日本`, `japan`, `日本旅行`, `日本文化` |
| `life` | `thoughts` | `年度总结`, `thoughts`, `总结`, `回顾` |
| `life` | `misc` | `杂记`, `随想`, `记录` |
| `finance` | `finance` | `财经`, `finance`, `投资`, `investment` |
| `create` | `design` | `设计`, `design`, `视觉`, `美学`, `交互` |
| `create` | `product` | `产品`, `product`, `设计`, `UX`, `UI` |

> 若文章同时匹配多个专栏，优先按用户意图或内容核心主题选择。若无法确定，放 `tech/general` 或 `life/misc`。

### Step 2：选择文件路径

路径规则直接影响 URL slug：

```
content/blog/{channel}/{column}/article-name.mdx
→ URL: /blog/{channel}/{column}/article-name
```

**决策树：**

1. **有明确专栏归属** → `content/blog/{channel}/{column}/文章名.mdx`
2. **跨专栏/无明确归属** → `content/blog/文章名.mdx`（放根目录）
3. **用户指定了自定义 slug** → 在 frontmatter 中写 `slug: "custom-name"`

> ⚠️ **路由冲突红线**：文件路径生成的 slug 不能是两段式且等于某个 `channel/column` 组合。
> 
> 例如：`content/blog/life/japan.mdx` → slug `life/japan`，这与专栏路由 `/blog/life/japan` **完全冲突**，文章将无法访问。必须改成 `content/blog/life/japan/文章名.mdx`（三段式）。

### Step 3：编写 Frontmatter

```yaml
---
title: "文章标题"               # 必填
date: "2026-05-23"              # 必填，YYYY-MM-DD
author: "作者名"                 # 可选，默认不填显示"佚名"
tags:
  - "技术"                      # 必填，决定频道/专栏归类
  - "programming"
excerpt: "文章摘要"              # 可选，用于 SEO 和列表展示
coverImage: "https://..."       # 可选，封面图 URL
pinned: false                   # 可选，true 则置顶
channel: "tech"                 # 可选，显式指定频道（一般通过 tags 自动归类即可）
column: "general"               # 可选，显式指定专栏（一般通过 tags 自动归类即可）
hidden: false                   # 可选，true 则隐藏不显示在列表中
---
```

**必填项检查清单：**
- [ ] `title` 存在且不为空
- [ ] `date` 格式为 `YYYY-MM-DD`
- [ ] `tags` 至少有一个，且能匹配到 `channels.ts` 中某专栏的 tags（除非故意不归类）

### Step 4：编写正文

- 使用标准 Markdown + JSX 语法
- 如需使用项目内置组件，参考 `docs/components.md` 中的"文章可用组件速查"
- 代码块会被自动语法高亮（PrismJS）
- 支持 GitHub Flavored Markdown（表格、删除线等）

### Step 5：验证

写完后必须执行以下检查：

1. **运行索引重建**：`npm run dev`（或 `tsx scripts/build-posts-index.ts`）
2. **观察控制台输出**：
   - 是否有 `[CONFLICT]` 警告？
   - 是否有 `[INVALID]` slug 警告？
   - 是否有 `[CONFIG]` 频道/专栏不匹配警告？
3. **确认文章出现在列表**：访问 `/blog` 查看文章是否正确归类到对应频道/专栏

## 编辑已有文章

若用户要求修改已有文章：

1. 先用 `Grep` 或 `Glob` 找到目标文件（`content/blog/**/*.mdx`）
2. 修改内容，注意：
   - 若修改了 frontmatter 中的 `slug`，需确认没有引入新的路由冲突
   - 若修改了 `tags`，可能影响文章在频道/专栏中的归类
3. 保存后刷新页面即可（开发环境会自动重建索引）

## 常见错误

| 错误 | 后果 | 预防 |
|------|------|------|
| 文章路径只有两段且等于 `channel/column` | 文章被专栏路由拦截，404 | 检查 `build-posts-index.ts` 输出的 `[CONFLICT]` 警告 |
| `tags` 与任何专栏都不匹配 | 文章无法归类到任何频道页 | 对照 `channels.ts` 中的 tags 配置 |
| frontmatter 中 `slug` 包含 `/` 或 `.` | slug 被忽略，使用文件名 | `slug` 只能包含合法 URL 字符 |
| 忘记写 `date` | 文章排序异常 | 必填 |
| `hidden: true` 后找不到文章 | 正常行为，hidden 文章不参与索引 | 确认用户意图 |

## 快速参考

```bash
# 重建索引并验证
npx tsx scripts/build-posts-index.ts

# 开发模式（自动重建）
npm run dev
```
