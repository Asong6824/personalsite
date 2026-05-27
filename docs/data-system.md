# 数据系统

## 股票数据

`src/lib/stocks/` 采用多提供商架构：

- `fetch.js` — 入口，负责路由到不同提供商、缓存、降级处理。
- `providers/alpha.js` — Alpha Vantage（需 `ALPHA_VANTAGE_API_KEY`）。
- `providers/yahoo.js` — Yahoo Finance（需 `RAPIDAPI_KEY`）。
- `providers/mock.js` — 降级 mock 数据（无 API Key 时自动回退）。
- `store.js` — 本地缓存读写（基于存储 key）。

---

## 数据集

### 存储结构

- 存储在 `src/data/datasets/<id>.json`。
- 索引文件 `src/data/datasets/index.json`。
- 支持时间序列（`series[].points[]`）与分类（`items[]`）两种结构。

### API 接口

| 方法 | 路由 | 参数 | 说明 |
|------|------|------|------|
| `GET` | `/api/datasets` | `?type=&tag=&q=` | 列表与过滤，返回 `{ metas: [] }` |
| `GET` | `/api/datasets/:id` | `?type=&from=&to=&series=` | 详情与时间裁剪，`series` 为多选（逗号分隔） |
| `PUT` | `/api/datasets/:id/series/:key` | Body: `{ t, v }` 或 `{ points: [{t,v}] }` | 追加点位到指定序列 |

缓存策略：`Cache-Control: public, s-maxage=300, stale-while-revalidate=86400`

### 前端封装

`src/lib/api/datasets.js` 提供：

```js
import { listDatasets, getDataset } from '@/lib/api/datasets'

// 列表过滤
const { metas } = await listDatasets({ type: 'timeseries', tag: 'stock' })

// 详情查询（支持时间裁剪和序列选择）
const dataset = await getDataset('my-dataset', {
  from: '2024-01-01',
  to: '2024-12-31',
  series: ['close', 'volume']
})
```

---

## 股票数据 API

| 方法 | 路由 | 参数 | 说明 |
|------|------|------|------|
| `GET` | `/api/stocks` | `?symbols=AAPL,MSFT&start=&end=&rangeId=&source=alpha&prefer=&save=1` | 股票对比数据 |

参数说明：
- `symbols` — 逗号分隔的股票代码（必填）
- `start` / `end` — 日期范围（YYYY-MM-DD）
- `rangeId` — 预设范围 ID，默认 `default`
- `source` — 数据源：`alpha` 或 `yahoo`，默认 `alpha`
- `prefer` — 优先使用的提供商回退策略
- `save` — 是否保存到本地缓存，`1` 或 `0`，默认 `1`

多提供商架构：`src/lib/stocks/fetch.js` 会按 `source` 路由到对应提供商，无 API Key 时自动降级到 `mock.js`。

---

## Notion 集成

- `src/app/api/notion/` 提供 Notion 数据查询接口。
- 使用 `@notionhq/client` 作为官方 SDK。

---

## 车站印章收藏数据

### 页面定位

印章收藏页是「日本行纪」专栏下的独立收藏体验页，目标不是文章列表或普通相册，而是一个可探索的 **駅スタンプ Atlas**：

- 第一层是紧密 Bento 收藏墙，用来快速浏览大量印章。
- 第二层是单张印章的原地展开详情，用来阅读车站信息、个人故事和可达线路。
- 第三层是筛选与组织方式，用来在 100+ 收藏规模下维持可探索性。

设计原则：

- **收藏墙优先**：默认状态保持高密度、低文字权重，日期、ID、站名只作为边角辅助信息。
- **空间记忆优先**：筛选时不重排卡片，只弱化不匹配项，避免用户失去位置感。
- **铁路关系优先于表格信息**：可达站用 SVG 线路示意表达，不做地理精确地图。
- **故事在展开层承载**：卡片本体不塞长文，点击后通过 2×2 大卡展示故事和线路。

### 存储位置

`src/data/stamps.ts` —— TypeScript 常量数据文件。当前采用规范化的前端数据表组织，并导出兼容页面使用的派生 `stamps` 数组。

核心导出：

- `stations`：车站主数据，一个车站只维护一次。
- `stampRecords`：印章收藏记录，通过 `stationId` 引用车站。
- `stationRoutes`：车站之间的可达关系，通过 `fromStationId` / `toStationId` 引用车站。
- `stamps`：由以上三组数据组合出的页面渲染数据，保留 `station` 和 `connections` 字段，供 `StampsPageClient` 直接使用。

### 数据结构

```typescript
interface StationInfo {
  id: string;          // 车站稳定 ID
  name: string;        // 駅名
  line: string;        // 线路名
  city: string;        // 城市
  prefecture: string;  // 都道府県
  operator?: string;   // 运营公司（JR東日本 等）
  address?: string;    // 详细地址
  lat?: number;        // 纬度（预留地图用）
  lng?: number;        // 经度（预留地图用）
  railDiagram?: StationRailDiagram; // 无底图铁路线路示意图
}

interface StationRailDiagram {
  viewBox?: string;
  lines: {
    path: string;       // SVG path，使用小画布坐标
    label: string;      // 线路名
    color: string;      // 线路色
    routeType?: "shinkansen" | "railway" | "subway" | "monorail" | "air";
    strokeWidth?: number;
    dashArray?: string;
  }[];
  nodes: {
    label: string;
    stationId?: string;
    x: number;
    y: number;
    role: "current" | "collected" | "direction"; // direction 只作为方向标签，不画站点圆点
  }[];
  badges?: { label: string; color: string }[];
}

interface StampRecord {
  id: string;                  // 收藏编号（如 "087"）
  stationId: string;           // 关联车站 ID
  date: string;                // 收集日期（YYYY/MM/DD）
  collectedAt?: string;        // 具体盖章位置
  images: StampImages;         // 图片 URL 集合（指向 TOS）
  story?: string;              // 与车站的个人故事
  note?: string;               // 简短备注
  size: "square" | "wide" | "large";  // 卡片尺寸（数据中保留，渲染时统一为 280×280 正方形）
}

interface StationRoute {
  fromStationId: string; // 起点车站 ID
  toStationId: string;   // 终点车站 ID
  routeType?: "shinkansen" | "railway" | "subway" | "monorail" | "air";
  line?: string;         // 使用线路
  duration?: string;     // 大致耗时
  label?: string;        // 补充标签
  geometry?: Array<[number, number]>; // 真实线路轨迹，[lng, lat]
}

interface Stamp extends StampRecord {
  station: StationInfo;             // 由 stationId 派生
  connections?: StampConnection[];  // 由 stationRoutes 派生
}

interface StampConnection {
  stationId: string;    // 可抵达车站对应的收藏编号
  routeType?: "shinkansen" | "railway" | "subway" | "monorail" | "air";
  line?: string;
  duration?: string;
  label?: string;
  geometry?: Array<[number, number]>;
}

interface StampImages {
  stamp: string;       // 印章本体照片 → TOS URL（必须）
  station?: string;    // 车站外观照片 → TOS URL（可选）
  context?: string;    // 盖章场景 → TOS URL（可选）
  album?: string[];    // 多张相关照片 → TOS URL 数组（可选）
}
```

这样拆分后，车站基础信息、印章收藏记录、站点关系不再互相重复。页面仍然消费 `stamps`，因此 UI 层不用知道底层数据是否拆表。

### 图片托管

所有印章图片存放于 **火山引擎 TOS** 对象存储：

- Bucket：`blog-assets-asong.tos-cn-beijing.volces.com`
- 建议路径：`stamps/{id}-{station}-stamp.jpg`
- 已在 `next.config.ts` `images.remotePatterns` 中配置白名单，可直接用 `next/image` 加载

### 页面布局

- **无限画布设计**：`StampsPageClient` 使用 3600×3600 的大画布；布局先根据印章数量计算一个尽量紧凑的矩形网格，再把 2×1 Hero 作为普通网格块嵌入其中，新增印章会优先补齐矩形边界，而不是向单一方向追加。
- **滑动交互**：桌面端滚轮/触摸板平移，移动端单指滑动，带惯性衰减。
- **滑动边界**：四个方向以最外围印章边缘外再延伸 180px 为界。
- **卡片尺寸**：渲染时统一为 280×280 的 1:1 正方形，圆角 `rounded-2xl`，卡片间距 6px。
- **展开交互**：点击印章卡后，当前卡片原地展开为 2×2 详情卡，展示车站信息、故事文本与基于 `connections` 的 SVG 可达线路动画。
- **线路示意动画**：展开卡右侧优先使用 `station.railDiagram` 渲染无底图铁路线路示意图，表达真实方向、线路品牌色和关键收藏节点。未配置 `railDiagram` 的车站会退回到 `lat/lng` 小范围投影路线图；后续也可把 Overpass / OSM 导出的真实线路点写入 `stationRoutes.geometry`。
- **筛选交互**：Hero 卡片底部提供「时间 / 旅程 / 铁路公司」三类顶级筛选入口；选择「铁路公司」后显示公司子筛选，筛选时保持原有 Bento 位置，只弱化不匹配的卡片，避免重排造成空间记忆丢失。

### 交互分层

#### 默认卡片

默认卡片承担“收藏墙”的视觉密度：

- 印章图片是主视觉，使用 `object-contain` 居中展示。
- 日期与 ID 放在顶部弱角标，站名放在底部弱标签。
- 图片加载失败时显示轻量「画像未配置」占位，不抢视觉权重。

#### 展开卡片

点击印章卡后，卡片原地展开为 2×2：

- 左上展示车站名、线路、都道府县、运营公司和收集地点。
- 左侧保留印章图片/占位。
- 左下展示 `story`，用于承载“我和这个车站的故事”。
- 右侧展示 `connections` 驱动的 SVG 可达线路动画和可达站列表。
- 展开靠近视口边缘的卡片时，画布会自动平移，让详情卡尽量进入可见区域。

#### Hero 筛选

Hero 卡片是页面的控制中心，当前顶级筛选为：

- **时间**：默认入口。当前版本只作为模式状态，不重排卡片。
- **旅程**：预留给未来 `tripId` / 行程分组视图。
- **铁路公司**：展示公司子筛选，当前已可用。

铁路公司筛选通过派生后的 `stamp.station.operator` 自动生成按钮。选中公司后，不匹配的卡片透明度降低，匹配卡片保持原位高亮。

### 组织策略

当收藏增长到 100+ 后，不建议只按时间或只按铁路公司排列：

- **时间**适合回看收集进度，但大量数据会变成流水账。
- **铁路公司**适合档案筛选，但会拆散同一次旅行的体验。
- **区域 / 线路 / 旅程**更适合作为默认空间组织方式。

推荐长期策略：

1. 默认视图使用 **Atlas View**：按区域或主要线路形成多个 Bento cluster。
2. 时间作为 **Timeline View**：按年份/月展示收集进度。
3. 铁路公司作为 **Operator Filter**：在原布局上高亮/弱化，不作为默认重排规则。
4. 旅程作为 **Trip View**：按一次旅行或一条路线聚焦展示。

### 后续规划

#### P0：补齐真实内容

- 上传并修正所有 TOS 图片 URL，避免页面长期显示「画像未配置」。
- 为重点车站补 `story`，优先补东京、京都、新大阪、名古屋、仙台、札幌、博多等核心节点。
- 校对 `connections`，把当前示例数据替换成更准确的可达关系。

#### P1：扩展数据模型

基础数据已经拆成 `stations`、`stampRecords`、`stationRoutes`。下一步为 100+ 收藏规模继续增加组织字段：

```typescript
region?: "hokkaido" | "tohoku" | "kanto" | "chubu" | "kansai" | "chugoku" | "shikoku" | "kyushu" | "okinawa";
operatorGroup?: "JR北海道" | "JR東日本" | "JR東海" | "JR西日本" | "JR九州" | "私鉄" | "地下鉄" | "その他";
routeOrder?: number;
tripId?: string;
```

这些字段用于后续实现区域 cluster、旅程视图和更稳定的线路顺序。

#### P2：实现真正的顶级视图

- **时间**：按年份/月组织，展示收集进度。
- **旅程**：按 `tripId` 聚焦一次旅行，展示该旅程中的站点路径。
- **铁路公司**：保留当前高亮/弱化策略，并支持 operator group 合并。

#### P3：增强线路动画

- 当前已支持两层路线 SVG：优先渲染 `railDiagram` 无底图线路示意图，未配置时使用经纬度投影 fallback。
- 新大阪已配置示例 rail diagram：新干线粗蓝线、JR 京都线蓝线、御堂筋线红线、中心站点和收藏节点。
- 下一步可为重点车站继续补 `railDiagram`，或接入 Overpass / OSM geometry，把 fallback 地理弧线替换为真实铁路线路轨迹。
- SVG 节点支持 hover/focus，显示线路名和耗时。

#### P4：移动端适配

- 桌面保持原地 2×2 展开。
- 移动端可切换为近全屏展开卡或 bottom sheet，避免 2×2 卡片被裁切。

### 与博客内容的关联

印章收藏页挂在「日本行纪」专栏下，路由为 `/blog/life/japan/stamps`。日本专栏页（`/blog/life/japan`）通过 `JapanColumnLayout` 提供入口链接。
