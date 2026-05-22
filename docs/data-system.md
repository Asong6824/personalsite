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
