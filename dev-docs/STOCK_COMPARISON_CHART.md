# StockComparisonChart 产品分析

## 1. 产品背景
- 服务于投资分析类博客、产业链研究文章和市场洞察报告，帮助作者以交互方式展示多只股票的对比走势。
- 通过可复用的 MDX 组件降低植入成本，既能在构建阶段静态拉取数据，也能在运行时发起实时请求。
- 相比静态截图，强调交互（hover/切换范围）与数据的动态更新能力。

## 2. 产品目标
| 目标 | 描述 |
| --- | --- |
| 数据可视化 | 直观展示多只股票在不同时间段的绝对/相对涨跌趋势。 |
| 内容增强 | 通过图表+表格组合提升文章说服力与可读性。 |
| 灵活配置 | 作者可在 MDX 中配置股票列表、时间范围、默认选项与数据源。 |
| 无缝集成 | 兼容 Next.js + MDX 内容体系，可用于 SSG/ISR/SSR。 |
| 低依赖性 | 数据源可替换（Yahoo、Alpha Vantage、自建 API 等）。 |

## 3. 核心功能拆解
### 3.1 趋势对比图（Line Chart）
- 支持展示价格或百分比变化，多股票颜色区分。
- Hover 显示所有股票的价格与日期 Tooltip；hover 表格行需反向高亮折线。
- 自适应亮/暗主题；可切换时间范围刷新数据或过滤本地缓存。

### 3.2 股票数据表（Data Table）
- 表格字段：Symbol、Name、Price、Change、% Change、Prev Close。
- 涨跌颜色区分（绿色↑、红色↓），与图表联动。
- 位于折线图下方，反映当前时间区间的关键指标。

### 3.3 自定义时间范围
- 通过 `ranges` props 传入多段时间：`id`、`label`、`start`、`end`。
- 用户点击切换区间，触发数据过滤或重新请求；仅一个区间时隐藏切换按钮。

### 3.4 数据加载模式
| 模式 | 行为 |
| --- | --- |
| 静态模式 | 构建期（`getStaticProps` 等）预拉数据，适合更新频率较低的文章。 |
| 动态模式 | 运行期向 `/api/stocks` 请求实时数据，适合强调时效性的内容。 |

## 4. Props 与接入方式
### 4.1 类型定义
```ts
type TimeRangePreset = {
  id: string;
  label: string;
  start: string; // YYYY-MM-DD
  end: string;   // YYYY-MM-DD
};

interface StockComparisonChartProps {
  symbols: string[];
  ranges: TimeRangePreset[];
  defaultRangeId?: string;
  source?: 'yahoo' | 'alpha' | 'custom';
  theme?: 'light' | 'dark';
}
```

### 4.2 MDX 使用示例
```tsx
<StockComparisonChart
  symbols={['BE', 'ETN', 'VRT', 'CAT']}
  ranges={[
    {
      id: 'ai-infra',
      label: 'AI Infra Rally',
      start: '2024-10-01',
      end: '2025-07-01'
    },
    {
      id: 'post-earnings',
      label: 'Post Earnings Period',
      start: '2025-07-02',
      end: '2025-11-01'
    }
  ]}
  defaultRangeId="ai-infra"
  source="yahoo"
  theme="dark"
/>
```

## 5. 交互设计
### 5.1 组件结构草图
```
+----------------------------------------------+
| Legend: BE | ETN | VRT | CAT | ...           |
|----------------------------------------------|
|   折线图（Hover Tooltip/联动高亮）           |
|----------------------------------------------|
| [1D] [5D] [1M] [6M] [YTD] [Custom...]        |
|----------------------------------------------|
| 表格：Symbol | Price | Change | %Change | ...|
+----------------------------------------------+
```

### 5.2 用户流程
1. 用户在文章中看到图表与预设时间范围按钮。
2. 点击按钮切换区间，折线图与表格同步刷新。
3. Hover 折线图显示 Tooltip；hover 表格行高亮对应曲线。
4. 静态模式仅在前端过滤本地缓存；动态模式可触发新的 API 请求。

## 6. 技术实现要点
- 基于 ECharts 等成熟图库，减少底层绘图成本并支持交互特性。
- 需要处理多股票颜色映射、主题切换、时间轴缩放等配置。
- 图表与表格共享状态（当前范围、hover 股票），可使用 React context 或 zustand 管理。
- 数据格式需规范化（时间戳/价格序列），以支持静态与动态模式共用同一渲染逻辑。
- 需考虑构建时数据缓存、API 节流与错误兜底（展示加载/失败状态）。

## 7. 待确认事项
- 数据源具体 API 及响应结构、速率限制策略。
- 是否需要百分比/价格双视图切换？
- 表格字段是否需扩展（如市值、成交量）及本地化格式要求。
- SEO/可访问性要求（例如 SSR 渲染表格、ARIA 支持）。

## 8. 数据源与接口设计（下一步产出）
### 8.1 Provider 选择
| Provider | 使用接口 | 优点 | 风险/限制 | 结论 |
| --- | --- | --- | --- | --- |
| Alpha Vantage | `TIME_SERIES_DAILY_ADJUSTED` | 官方免费、返回分红拆股调整后价格、支持多区段查询 | 每分钟 5 次/每天 500 次限制，需要 API Key | 设为默认 `source="alpha"`；利用缓存规避限流。 |
| Yahoo Finance (via RapidAPI) | `yahfin/latest` 等 | 覆盖全球市场、响应快 | 依赖第三方代理、需付费计划 | 可选 `source="yahoo"`，用于高实时性场景。 |
| Custom | 自建聚合服务 | 完全可控、可对接内部行情 | 需要维护、数据可靠性自担 | 预留 `source="custom"` 扩展点。 |

运行时使用 `ALPHA_VANTAGE_API_KEY`/`RAPIDAPI_KEY` 环境变量配置；若缺失则回退到 mock/静态数据。

### 8.2 统一数据模型
```ts
type SampledPoint = {
  timestamp: string;   // ISO string, e.g. 2024-10-01T00:00:00Z
  price: number;       // 收盘价
  change?: number;     // 相对前一日涨跌额
  changePct?: number;  // 相对前一日涨跌幅
};

type StockSeries = {
  symbol: string;
  name: string;
  currency?: string;
  points: SampledPoint[];
  latest: {
    price: number;
    change: number;
    changePct: number;
    prevClose: number;
  };
};

type StockComparisonPayload = {
  meta: {
    source: 'alpha' | 'yahoo' | 'custom';
    range: { id: string; start: string; end: string };
    generatedAt: string;
  };
  series: StockSeries[];
};
```
- 所有 Provider 响应需归一化为 `StockComparisonPayload`，组件只消费该格式。
- 若切换百分比视图，可在前端基于 `points` 衍生，不依赖 API。

### 8.3 静态模式数据流
1. `getStaticProps` 调用 `fetchStockComparison({ symbols, range, source })`。
2. `fetchStockComparison` 内部按符号串行/并行请求 Alpha Vantage，使用 `cache.js` 提供的 `withCache` 包裹（key = `${source}:${symbol}:${start}:${end}`）。
3. 将 `StockComparisonPayload` 写入页面 props 或 `.json` 静态文件，组件直接渲染，无额外请求。
4. 支持 ISR 时可配置 `revalidate` 以定期更新。

### 8.4 动态 API 合约
- Endpoint: `GET /api/stocks`
- Query 参数：
  - `symbols`: 逗号分隔字符串，如 `BE,ETN,VRT`
  - `start`, `end`: ISO 或 `YYYY-MM-DD`
  - `rangeId`: 对应前端按钮 id，可用于缓存 key
  - `source`: `'alpha' | 'yahoo' | 'custom'`（默认 `'alpha'`）
- 响应：`200 OK`，body 为 `StockComparisonPayload`

示例：
```http
GET /api/stocks?symbols=BE,ETN,VRT&start=2024-10-01&end=2025-07-01&rangeId=ai-infra&source=alpha
```
```json
{
  "meta": {
    "source": "alpha",
    "range": { "id": "ai-infra", "start": "2024-10-01", "end": "2025-07-01" },
    "generatedAt": "2025-01-03T02:10:00Z"
  },
  "series": [
    {
      "symbol": "BE",
      "name": "Bloom Energy Corp",
      "currency": "USD",
      "points": [
        { "timestamp": "2024-10-01T00:00:00Z", "price": 12.31 },
        { "timestamp": "2024-10-02T00:00:00Z", "price": 12.55, "change": 0.24, "changePct": 1.95 }
      ],
      "latest": {
        "price": 18.12,
        "change": 0.76,
        "changePct": 4.38,
        "prevClose": 17.36
      }
    }
  ]
}
```

### 8.5 缓存与限流策略
- **构建期**：利用文件级缓存（例如 `.next/cache/stocks`）储存每只股票的日线 JSON，有效期 24 小时。
- **运行期**：`/api/stocks` 层使用 in-memory LRU（基于 `cache.js`）+ `Cache-Control: s-maxage=300, stale-while-revalidate=86400`。
- **失败回退**：当外部 API 报错或限流，若缓存命中则返回陈旧数据并追加 `meta.stale=true`；否则降级到空数据并在前端标记错误状态。
- **批量请求**：Alpha Vantage 单次只支持 1 symbol，需串行并保证请求间隔 ≥ 12 秒/5 req。可在服务器层做节流或使用代理任务（例如 CRON 定时预取）。
