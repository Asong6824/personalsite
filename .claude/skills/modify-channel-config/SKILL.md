---
name: modify-channel-config
description: 修改频道/专栏配置，包括新增频道、新增专栏、修改专栏属性（名称、描述、tags、封面图）。涉及 channels.ts 修改、路由联动、配置校验、SEO 影响。触发词："新增频道"、"新增专栏"、"修改专栏"、"添加栏目"、"改频道配置"、"channels.ts"。
---

# Modify Channel Config — 修改频道/专栏配置

## 适用场景

- 用户要求新增一个频道（如新增 "travel" 频道）
- 用户要求新增一个专栏（如在 tech 频道下新增 "ai" 专栏）
- 用户要求修改现有专栏的名称、描述、tags 或封面图
- 用户要求删除一个专栏
- 用户不确定修改 `channels.ts` 后还需要改哪些地方

## 核心 Workflow

### Step 1：理解当前配置结构

打开 `src/lib/channels.ts`，当前配置结构：

```typescript
export const CHANNELS_CONFIG: ChannelsConfig = {
  tech: {
    name: "技术",
    description: "技术分享与学习笔记",
    icon: "/tech_cover.svg",
    columns: {
      go: {
        name: "Golang 精进之路",
        description: "Go 语言相关技术文章",
        tags: ["Go", "golang"],
        cover: "https://...",
      },
      // ...
    },
  },
  // life, finance, create ...
};
```

**频道级字段：**
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `name` | `string` | ✅ | 频道显示名称 |
| `description` | `string` | ✅ | 频道描述 |
| `icon` | `string` | ❌ | 频道图标 URL 或路径 |
| `columns` | `object` | ✅ | 专栏集合 |

**专栏级字段：**
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `name` | `string` | ✅ | 专栏显示名称 |
| `description` | `string` | ✅ | 专栏描述 |
| `tags` | `string[]` | ✅ | 文章自动归类的标签 |
| `cover` | `string` | ❌ | 专栏封面图 URL |

### Step 2：修改操作检查清单

#### 场景 A：新增专栏（最高频）

```
以在 tech 频道下新增 "ai" 专栏为例：
```

1. **在 channels.ts 中添加专栏定义**
   ```typescript
   ai: {
     name: "AI 与大模型",
     description: "人工智能与大语言模型技术",
     tags: ["AI", "LLM", "大模型", "机器学习"],
     cover: "https://...",
   },
   ```

2. **检查 tags 不冲突**
   - 新专栏的 `tags` 不能与现有专栏的 `tags` 完全重复
   - 可以有重叠（如 `设计` 在 tech/design 和 create/design 中都存在），这是允许的

3. **确认路由已存在**
   - 检查 `src/app/blog/tech/[columnSlug]/page.tsx` 是否已存在
   - 项目已使用动态路由 `[columnSlug]` 统一处理专栏页，一般**不需要新建路由文件**
   - 但若频道没有 `[columnSlug]` 动态路由，需要创建（参考现有频道如 tech/life/finance/create）

4. **保存并观察控制台**
   - 开发环境下 `config-validator.ts` 会自动运行
   - 确认输出 `✅ CHANNELS_CONFIG validation passed!`

#### 场景 B：新增频道

1. **在 channels.ts 中添加频道定义**
2. **新建频道页路由**：`src/app/blog/{channelKey}/page.tsx`
   - 参考现有频道页（如 `src/app/blog/tech/page.tsx`）
   - 使用对应的 ChannelLayout（如 `TechChannelLayout`）或通用 `ColumnLayout`
3. **新建专栏动态路由**：`src/app/blog/{channelKey}/[columnSlug]/page.tsx`
   - 参考 `src/app/blog/tech/[columnSlug]/page.tsx`
   - 修改 `CHANNEL_KEY` 常量
4. **确认首页/博客主页的频道入口**
   - 检查 `src/app/blog/page.tsx` 或首页是否会自动读取 `CHANNELS_CONFIG`
   - 若首页有硬编码的频道列表，需同步更新

#### 场景 C：修改现有专栏

| 修改项 | 影响范围 | 需要额外操作 |
|--------|----------|-------------|
| `name` | 仅显示文本 | 无 |
| `description` | 仅显示文本 | 无 |
| `tags` | 文章自动归类 | 检查现有文章的 tags 是否仍正确匹配 |
| `cover` | 仅显示图片 | 无 |
| 专栏 key | **URL 变更** | 需检查硬编码的链接、SEO、外部引用 |

#### 场景 D：删除专栏

1. 确认该专栏下**没有文章**（或文章已迁移）
2. 从 `channels.ts` 中删除专栏定义
3. 检查是否有硬编码引用该专栏 key 的代码
4. 运行索引重建，确认无 `[CONFIG]` 警告

### Step 3：联动影响检查

修改 `channels.ts` 后，以下地方可能被影响，必须检查：

- [ ] **文章归类**：修改 `tags` 后，现有文章的频道/专栏归属可能变化
  - 运行 `npm run dev` 触发索引重建
  - 检查控制台是否有 `[CONFIG]` 警告（文章引用了不存在的 channel/column）
- [ ] **路由冲突**：新增/修改专栏 key 后，检查是否与现有文章 slug 冲突
  - 运行 `tsx scripts/build-posts-index.ts`
  - 检查是否有 `[CONFLICT]` 警告
- [ ] **SEO**：频道/专栏页有结构化数据（`seo-utils.ts`）
  - 确认 `generateColumnMetadata` 和 `generateColumnStructuredData` 能正确读取新配置
- [ ] **专栏布局**：不同频道可能使用不同的 Layout 组件
  - `tech` 使用 `TechChannelLayout`
  - `life` 的 `japan` 专栏使用 `JapanColumnLayout`（特殊布局）
  - 其他一般使用 `ColumnLayout`
- [ ] **首页/导航**：若首页或 Navbar 硬编码了频道列表，需同步更新

### Step 4：验证

修改完成后必须执行：

```bash
# 1. 开发环境自动校验
npm run dev
# 观察控制台：
# - ✅ CHANNELS_CONFIG validation passed!
# - 无 [CONFIG] 警告

# 2. 手动验证路由
# 访问 /blog/{channel}/{column}
# 确认页面正常渲染，文章列表正确

# 3. 验证文章归类
# 访问 /blog
# 确认文章出现在正确的频道/专栏下
```

## 常见错误

| 错误 | 后果 | 预防 |
|------|------|------|
| 新增专栏后未检查路由是否存在 | 访问新专栏页 404 | 确认 `src/app/blog/{channel}/[columnSlug]/page.tsx` 存在 |
| `tags` 与现有专栏完全重复 | 文章归类到第一个匹配的专栏，不可预测 | 确保 tags 有区分度 |
| 专栏 key 与文章 slug 冲突 | 文章被专栏路由拦截 | 运行 `build-posts-index.ts` 检查 `[CONFLICT]` |
| 忘记给必填字段（name/description/tags） | `config-validator.ts` 报错 | 对照上方字段表检查 |
| 修改专栏 key 后未更新硬编码引用 | 链接断裂、SEO 失效 | 全局搜索旧 key |

## 快速参考：新增专栏的最小操作

```typescript
// 1. 在 channels.ts 中添加（以 tech 频道新增 ai 为例）
tech: {
  // ... 现有配置
  columns: {
    // ... 现有专栏
    ai: {
      name: "AI 与大模型",
      description: "人工智能与大语言模型技术",
      tags: ["AI", "LLM", "大模型"],
      cover: "https://...",
    },
  },
},

// 2. 确认 src/app/blog/tech/[columnSlug]/page.tsx 已存在
// 3. 运行 npm run dev，确认控制台无警告
// 4. 访问 /blog/tech/ai 验证
```

## 频道/专栏路由结构速查

```
/blog/{channel}/          → 频道页（page.tsx）
/blog/{channel}/[columnSlug] → 专栏动态路由（[columnSlug]/page.tsx）
/blog/{channel}/design     → 示例：tech 频道的 design 专栏
```

所有频道都已统一使用 `[columnSlug]` 动态路由，**不再使用固定路由文件**（旧的 `tech/design/page.tsx` 已废弃）。
