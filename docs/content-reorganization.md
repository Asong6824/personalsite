# 内容整理盘点

本文记录当前博客内容组织的历史遗留问题和建议迁移路径。盘点命令：

```bash
npm run audit:content
```

## 当前结论

- 文章索引只扫描 `content/blog/**/*.mdx`，因此 `.md` 草稿不会进入站点索引。
- 文章 URL 由物理目录和 frontmatter `slug` 共同决定。当前整理目标是让文章物理目录与 frontmatter 的 `channel`/`column` 保持一致。
- `CHANNELS_CONFIG` 中每个专栏都必须对应一个 `content/blog/{channel}/{column}` 目录；空专栏用 `.gitkeep` 保留目录。
- `tech/design` 与 `tech/product` 已移除，设计/产品类文章统一收敛到 `creative/design` 与 `creative/product`。
- `tech/devtools`、`tech/nlp`、`tech/photography` 已移除；地图绘制与 iPhone 摄影文章已迁入 `creative/notes`。
- 当前索引校验会验证 `channel`/`column` 是否存在，但不会验证文件目录是否与 frontmatter 归属一致。

## 散落在根目录的文章

已清理。当前正式文章均位于 frontmatter 对应的 `content/blog/{channel}/{column}` 目录下。

## 重复文章

以下重复文件正文一致，差异只在 frontmatter 的 `channel`/`column` 等元信息：

| 标题 | 副本 A | 副本 B | 建议 |
| --- | --- | --- | --- |
| 颜色基础知识 | `creative/design/color-basics.mdx` | `tech/design/color-basics.mdx` | 已删除 `tech/design` 副本 |
| 四大基本设计原则 | `creative/design/design-principles-basic.mdx` | `tech/design/design-principles-basic.mdx` | 已删除 `tech/design` 副本 |
| Typography排版基础 | `creative/design/typography-basics.mdx` | `tech/design/typography-basics.mdx` | 已删除 `tech/design` 副本 |
| Figma：重新定义创造 | `creative/product/figma-redefining-creation.mdx` | `figma-redefining-creation.mdx` | 已删除根目录 `tech/product` 副本 |
| Notion 与禅与我 | `creative/product/notion-zen.mdx` | `notion-zen.mdx` | 已删除根目录 `tech/product` 副本 |

## 未索引文件

`content/blog/tech/general/from-rag-technique-to-rag-philosophy-research.md` 是 `.md` 文件，当前 `src/lib/post-index.ts` 只扫描 `.mdx`，所以不会发布到站点。若它是正式文章，应改为 `.mdx` 并补齐 frontmatter；若它是研究草稿，应迁出 `content/blog/` 或显式标记为草稿资料。

## 建议迁移顺序

1. 处理未索引 `.md` 草稿：正式发布则改为 `.mdx`，否则迁出 `content/blog/`。
2. 把 `audit:content` 纳入整理前后的人工检查流程；如需要更严格门禁，可后续接入 `scripts/gate-check.ts`。
