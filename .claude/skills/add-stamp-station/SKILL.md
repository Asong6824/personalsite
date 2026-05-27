---
name: add-stamp-station
description: 向日本车站印章收藏页添加新的车站元数据和印章记录。涉及日文信息搜索、数据写入 src/data/stamps.ts、去重检查。触发词："添加车站印章"、"新增印章车站"、"添加车站"、"stamp station"、"駅スタンプ追加"。
---

# Add Stamp Station — 添加印章收藏车站

## 适用场景

- 用户旅行后收集了新车站印章，需要添加到印章收藏页
- 用户想批量添加多个车站（如一条线路上的所有车站）
- 用户需要补充已有车站的详细信息（经纬度、地址、线路图等）

## 核心 Workflow

### Step 1：搜索车站信息（必须用日文关键字）

对每个新车站，用**日文汉字**搜索以下信息：

| 字段 | 搜索关键字示例 | 说明 |
|------|---------------|------|
| `name` | `「駅名」駅` | 使用日文汉字站名，如「大阪駅」「高槻駅」 |
| `line` | `「駅名」駅 所属路線` | 如「JR京都線」「東海道本線」 |
| `city` | `「駅名」駅 所在地` | 市区町村名 |
| `prefecture` | `「駅名」駅 都道府県` | 如「大阪府」「京都府」 |
| `operator` | `「駅名」駅 運営` | 如「JR西日本」「JR東日本」 |
| `address` | `「駅名」駅 住所` | 详细地址（可选但推荐） |
| `lat` / `lng` | `「駅名」駅 緯度経度 座標` | 用于地图展示（可选但推荐） |

> ⚠️ **必须使用日文关键字搜索**，中文或英文搜索结果中的站名、线路名可能不准确。优先参考 Wikipedia、JR 官方站点（jr-odekake.net）、Navitime 等来源。

### Step 2：检查是否已存在（去重）

打开 `src/data/stamps.ts`，查看 `stations` 数组：

```bash
grep -n 'id: "' src/data/stamps.ts
```

- 如果 `stationId` 已存在 → **跳过**，只补充缺失字段
- 如果 `stationId` 不存在 → **新增**一条 `StationInfo` 记录

### Step 3：写入车站元数据（`stations` 数组）

在 `src/data/stamps.ts` 的 `stations` 数组中插入新车站：

```typescript
{
  id: "osaka",                    // 英文小写，用连字符分隔
  name: "大阪駅",                  // 日文汉字站名（必须）
  line: "東海道本線（JR京都線）",  // 所属线路（必须）
  city: "大阪",                    // 城市（必须）
  prefecture: "大阪府",            // 都道府県（必须）
  operator: "JR西日本",            // 运营公司（推荐）
  address: "大阪府大阪市北区梅田三丁目1-1",  // 详细地址（可选）
  lat: 34.7024,                   // 纬度（可选，用于地图）
  lng: 135.4959,                  // 经度（可选，用于地图）
  railDiagram: { ... },           // 线路示意图（可选，见下方说明）
}
```

**`id` 命名规则：**
- 英文小写，单词间用连字符 `-` 连接
- 避免与现有 id 冲突
- 示例：`osaka`, `shin-osaka`, `jr-sojiji`, `takatsuki`

**地理顺序建议：**
- 如果添加的是同一条线路上的多个车站，建议按线路走向（如从东到西、从南到北）排列，方便日后维护。

### Step 4：添加印章记录（`stampRecords` 数组）

如果用户有该车站的印章照片，在 `stampRecords` 数组中添加：

```typescript
{
  id: "088",                      // 收藏编号，递增不重复
  stationId: "osaka",             // 对应 stations 中的 id
  date: "2025/05/25",             // 收集日期 YYYY/MM/DD
  collectedAt: "改札外 案内所",    // 盖章位置（可选）
  images: {
    stamp: "https://blog-assets-asong.tos-cn-beijing.volces.com/stamps/088-osaka-stamp.jpg",
                                    // ↑ 印章照片 URL（上传到 TOS 后填写）
    station: "...",               // 车站外观照片（可选）
    context: "...",               // 盖章场景照片（可选）
    album: ["..."],               // 多张相关照片（可选）
  },
  story: "那天从京都赶过来...",    // 与车站的故事（可选）
  size: "square",                 // 卡片尺寸: square / wide / large
}
```

**编号规则：**
- 使用 3 位数字字符串（如 `"088"`）
- 查看现有最大编号，递增分配
- 现有编号范围：`076`–`087`，下一个从 `088` 开始

**图片存储：**
- 生产环境：上传到火山引擎 TOS，使用完整 URL
- 开发测试：可放 `public/images/stamps/` 目录，使用路径如 `/images/stamps/xxx.png`

### Step 5：添加车站关系（`stationRoutes` 数组，可选）

如果需要在展开卡片中显示"从该站可达的其他收藏车站"，添加路线关系：

```typescript
{ fromStationId: "osaka", toStationId: "kyoto", line: "東海道本線", duration: "約30分" },
```

- `fromStationId` 和 `toStationId` 必须都对应已收藏的车站（即有 stampRecords）
- `duration` 使用日文格式，如「約30分」「約1時間15分」
- `routeType` 可选，用于地图线型颜色（`shinkansen` / `railway` / `subway` / `monorail` / `air`）

## 数据格式速查

### StationInfo 完整字段

```typescript
interface StationInfo {
  id: string;           // 稳定英文 ID（必须）
  name: string;         // 駅名（必须）
  line: string;         // 线路名（必须）
  city: string;         // 城市（必须）
  prefecture: string;   // 都道府県（必须）
  operator?: string;    // 运营公司
  address?: string;     // 详细地址
  lat?: number;         // 纬度
  lng?: number;         // 经度
  railDiagram?: {       // 线路示意图（展开卡片用）
    viewBox?: string;
    lines: Array<{ path, label, color, routeType?, strokeWidth?, dashArray? }>;
    nodes: Array<{ label, stationId?, x, y, role: "current"|"collected"|"direction" }>;
    badges?: Array<{ label, color }>;
  };
}
```

### StampRecord 完整字段

```typescript
interface StampRecord {
  id: string;           // 收藏编号（必须）
  stationId: string;    // 关联车站 ID（必须）
  date: string;         // 收集日期 YYYY/MM/DD（必须）
  collectedAt?: string; // 盖章位置
  images: {
    stamp: string;      // 印章照片 URL（必须）
    station?: string;   // 车站外观照片
    context?: string;   // 场景照片
    album?: string[];   // 照片集
  };
  story?: string;       // 故事/游记
  note?: string;        // 备注
  size: "square" | "wide" | "large";  // 卡片尺寸（必须）
}
```

## 完整示例：添加大阪～京都间的 JR 车站

```typescript
// --- stations 数组新增 ---
{
  id: "osaka",
  name: "大阪駅",
  line: "東海道本線（JR京都線）",
  city: "大阪",
  prefecture: "大阪府",
  operator: "JR西日本",
  address: "大阪府大阪市北区梅田三丁目1-1",
  lat: 34.7024,
  lng: 135.4959,
},
{
  id: "suita",
  name: "吹田駅",
  line: "東海道本線（JR京都線）",
  city: "吹田",
  prefecture: "大阪府",
  operator: "JR西日本",
  address: "大阪府吹田市朝日町1-1",
  lat: 34.7631,
  lng: 135.5237,
},

// --- stampRecords 数组新增 ---
{
  id: "088",
  stationId: "osaka",
  date: "2025/05/25",
  collectedAt: "改札外 中央口案内所",
  images: {
    stamp: "https://blog-assets-asong.tos-cn-beijing.volces.com/stamps/088-osaka-stamp.jpg",
  },
  story: "大阪駅的印章设计很经典...",
  size: "square",
},
{
  id: "089",
  stationId: "suita",
  date: "2025/05/25",
  images: {
    stamp: "https://blog-assets-asong.tos-cn-beijing.volces.com/stamps/089-suita-stamp.jpg",
  },
  size: "square",
},

// --- stationRoutes 数组新增（可选） ---
{ fromStationId: "osaka", toStationId: "suita", line: "JR京都線", duration: "約9分" },
{ fromStationId: "suita", toStationId: "osaka", line: "JR京都線", duration: "約9分" },
```

## 验证清单

添加完成后检查：

- [ ] `stations` 数组中 `id` 不重复
- [ ] `stampRecords` 中 `stationId` 能在 `stations` 中找到对应
- [ ] `stampRecords` 中 `id` 编号不重复且递增
- [ ] `stationRoutes` 中的 `fromStationId` / `toStationId` 都有对应的印章记录
- [ ] 日文站名、线路名使用正确的汉字（参考搜索结果）
- [ ] 经纬度数据准确（优先使用 Navitime、MapFan 等来源）

## 常见错误

| 错误 | 现象 | 修复 |
|------|------|------|
| `stationId` 写错或不存在 | 页面白屏或报错 `Unknown stationId` | 核对 `stations` 数组中的 `id` |
| `stampRecords` 编号重复 | 后一条记录覆盖前一条 | 检查编号唯一性 |
| 使用中文站名 | 与项目风格不一致 | 改用日文汉字，如「大阪駅」而非「大阪站」 |
| 漏加 `stampRecords` | 车站信息存在但印章页不显示该卡片 | 添加对应的 `stampRecords` 条目 |
| `images.stamp` 路径错误 | 图片加载失败显示「画像未配置」 | 检查 URL 或本地路径是否正确 |
| `size` 字段缺失 | TypeScript 编译报错 | 补充 `size: "square"`（或 `wide` / `large`） |
