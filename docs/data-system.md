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

- 存储在 `src/data/datasets/<id>.json`。
- 索引文件 `src/data/datasets/index.json`。
- 支持时间序列（`series[].points[]`）与分类（`items[]`）两种结构。
- API 路由提供列表过滤、详情查询与点位追加。

---

## Notion 集成

- `src/app/api/notion/` 提供 Notion 数据查询接口。
- 使用 `@notionhq/client` 作为官方 SDK。
