# 架构反思与优化建议

## 已实施的优化

1. **索引自动刷新（基于 mtime）**：`post-index.ts` 在开发环境下会检查最新文件的修改时间是否晚于索引构建时间，内容或 frontmatter 修改后会自动重建索引。
2. **开发环境禁用文章缓存**：`post.ts` 中的文章读取函数在 `NODE_ENV === 'development'` 时直接执行原始函数，绕过 `MemoryCache`，确保修改立即可见。
3. **索引集合一致性校验**：`post-index.ts` 对比磁盘文件集合与索引中的 `rel` 集合，新增/删除/重命名都会触发重建（解决了"总数不变但实际文件已换"的幽灵索引问题）。
4. **frontmatter `slug` 真正生效**：`post-index.ts` 在构建索引时，若 frontmatter 中提供了 `slug`，会用它覆盖文件名部分作为 URL 最后一段（目录结构保留）。
5. **路由冲突检测**：`scripts/build-posts-index.ts` 在构建索引后自动扫描，如果某篇文章的 slug 恰好等于某个频道/专栏路由（2 段路径），输出警告。
6. **删除 `tech/design` 固定路由**：移除了 `src/app/blog/tech/design/page.tsx`，统一由动态路由 `tech/[columnSlug]/page.tsx` 处理，消除了代码重复和路由拦截问题。
7. **修复专栏页文章链接 Bug**：`ColumnLayout` 和 `JapanColumnLayout` 中文章链接从 `/blog/${channel}/${column}/${post.slug}` 修正为 `/blog/${post.slug}`，解决了路径重复导致的 404。

---

## 现有架构的深层约束

**文件路径即 slug（默认可被 frontmatter 覆盖）**：
- 优点：简单直观，文件系统即真相源；同时 frontmatter `slug` 提供了覆盖文件名部分的灵活性，兼顾了组织性和 URL 定制能力。
- 缺点：目录结构部分仍受限于文件系统命名（不能含大写、空格、中文等）。对于需要完全自定义 URL 的场景（如改整个路径），当前机制仍然不够灵活。

**频道/专栏/文章的三层架构与路由并存**：
- 文章路由 `/blog/[...slug]` 与专栏路由 `/blog/tech/[columnSlug]` 是**并行而非嵌套**的，文章详情页通过 catch-all "兜底" 而非通过专栏路由渲染。
- 当前 `[columnSlug]` 只匹配单段路径，因此文章的多段路径（如 `/blog/tech/general/my-post`）能正确落入文章路由。
- **潜在冲突**：如果创建 2 段路径的文章（如 `content/blog/life/japan.mdx`），其 URL `/blog/life/japan` 会被专栏路由拦截。索引构建脚本现在会自动检测并警告此类冲突。

---

## 未来可考虑的方向

| 方向 | 说明 | 状态 |
|------|------|------|
| **frontmatter `slug` 真正生效** | 已实施。`slug` 现在覆盖文件名作为 URL 最后一段，保留目录结构。 | ✅ 已完成 |
| **路由冲突检测** | 已实施。`build-posts-index.ts` 自动检测文章路径与专栏路由的冲突。 | ✅ 已完成 |
| **删除 `tech/design` 固定路由** | 已实施。统一由动态路由处理，消除代码重复。 | ✅ 已完成 |
| **修复专栏页文章链接** | 已实施。`ColumnLayout` 和 `JapanColumnLayout` 的链接已修正。 | ✅ 已完成 |
| **开发环境索引自动刷新** | 已实施。基于 mtime + 文件集合双重检测。 | ✅ 已完成 |
| **开发环境禁用文章缓存** | 已实施。`post.ts` 在 dev 下直接执行原始函数。 | ✅ 已完成 |
| **清理冗余 `slug` frontmatter** | 当前仓库中所有文章的 `slug` 都与文件名一致，字段本身不再造成困惑（因为现在它真正生效了）。如果希望减少 frontmatter 冗余，可以批量移除，但非必须。 | 可选 |
| **文章路由前缀化** | 将文章 URL 从 `/blog/tech/general/my-post` 改为 `/blog/post/...`，彻底与频道/专栏路由解耦。需配合 301 重定向保护已有外部链接。改动较大，当前无迫切需求。 | 可选 |
| **文件监听自动重建** | 使用 `fs.watch` 或 `chokidar` 监听 `content/blog/` 目录，文件变化时实时重建索引，取代当前的 mtime 轮询。当前 mtime 检测已足够好用。 | 可选 |
