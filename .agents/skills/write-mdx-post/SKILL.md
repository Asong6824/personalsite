---
name: write-mdx-post
description: 在项目中新增或编辑一篇 MDX 博客文章。涉及文件路径选择、frontmatter 填写、tags 规范、路由冲突检查。触发词："写篇文章"、"新增文章"、"添加博客"、"写博客"、"新建 mdx"、"发布文章"。
---

# Write MDX Post — 写博客文章

## 适用场景

- 用户要求撰写一篇新博客文章
- 用户要求编辑/修改已有文章
- 用户不确定文章该放在哪个目录

## 核心 Workflow（写新文章时）

### Step 1：确定频道与专栏

阅读 `src/lib/channels.ts` 中的 `CHANNELS_CONFIG`，根据文章的核心主题选择唯一的频道与专栏：

| 频道 | 专栏 |
|------|------|
| `tech` | `go`, `general`, `ai-engineering` |
| `life` | `japan`, `thoughts`, `misc` |
| `finance` | `finance`, `investment-methodology` |
| `creative` | `design`, `product`, `notes` |

> 若文章同时匹配多个专栏，优先按用户意图或内容核心主题选择。若无法确定，放 `tech/general` 或 `life/misc`。

### Step 2：选择文件路径

路径规则直接影响 URL slug：

```
content/blog/{channel}/{column}/article-name.mdx
→ URL: /blog/{channel}/{column}/article-name
```

**决策树：**

1. **有明确专栏归属** → `content/blog/{channel}/{column}/文章名.mdx`
2. **跨专栏/无明确归属** → 选择内容重心最接近的现有专栏
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
  - "AI"                        # 必填，仅描述文章内容
  - "Agent"
excerpt: "文章摘要"              # 可选，用于 SEO 和列表展示
coverImage: "https://..."       # 可选，封面图 URL
pinned: false                   # 可选，true 则置顶
channel: "tech"                 # 必填，显式指定频道
column: "ai-engineering"         # 必填，显式指定专栏
music: "https://..."            # 可选，背景音乐 URL，数组支持多首
hidden: false                   # 可选，true 则隐藏不显示在列表中
---
```

**必填项检查清单：**
- [ ] `title` 存在且不为空
- [ ] `date` 格式为 `YYYY-MM-DD`
- [ ] `channel`/`column` 存在且与物理目录一致
- [ ] `tags` 至少一个，通常 2-5 个，且没有同义重复

标签描述文章的主题、对象或方法，不复述频道/专栏名称。技术专有名词使用官方写法，一般概念优先使用中文；废弃别名见 `src/lib/article-tags.ts`。

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
   - 是否有 `[CONFIG]` 频道/专栏不匹配错误？
   - 是否有 `[TAGS]` 标签错误或数量 warning？
3. **确认文章出现在列表**：访问 `/blog` 查看文章是否正确归类到对应频道/专栏

## 编辑已有文章

若用户要求修改已有文章：

1. 先用 `Grep` 或 `Glob` 找到目标文件（`content/blog/**/*.mdx`）
2. 修改内容，注意：
   - 若修改了 frontmatter 中的 `slug`，需确认没有引入新的路由冲突
   - 修改 `tags` 不会改变频道/专栏归属，但会影响展示、SEO 和标签筛选
3. 保存后刷新页面即可（开发环境会自动重建索引）

## 常见错误

| 错误 | 后果 | 预防 |
|------|------|------|
| 文章路径只有两段且等于 `channel/column` | 文章被专栏路由拦截，404 | 检查 `build-posts-index.ts` 输出的 `[CONFLICT]` 警告 |
| `channel`/`column` 缺失或不存在 | 构建失败，文章无法正确归类 | 对照 `channels.ts` 中的频道和专栏 key |
| `tags` 为空、重复或使用废弃别名 | 索引验证失败 | 对照 `src/lib/article-tags.ts` 和标签规范 |
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
