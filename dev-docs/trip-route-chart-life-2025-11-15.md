# TripRouteChart（生活频道版）技术方案 — 2025-11-15

## 目标与范围
- 组件定位：用于生活频道文章，左侧展示蛇形时间线（行程与日期），右侧展示地图连线（全球任意范围），两侧点位 hover 联动
- 使用场景：MDX 正文内直接调用，适配生活频道整体视觉（棕色、纸张感、直角卡片等）
- 非功能要求：右侧地图固定大小，不允许缩放或拖拽；避免 SSR 报错与无用体积

## 技术栈与加载策略
- 基础：Next.js App Router + `next-mdx-remote/rsc` 渲染 MDX
- 可视化：`@amcharts/amcharts5`（含 `map`、`timeline`、`geodata`）
- 加载方式：在组件内部使用 `use client` + 动态 `import()`，仅在浏览器环境实例化 amCharts；卸载时 `dispose()`

## 组件接口
- 组件文件：`src/components/features/TripRouteChart.jsx`
- props
  - `points: Array<{ name, coordinates:[lon,lat], date, distance, population?, category? }>`
  - `mainColor?: string`（默认 `#c83830`）
  - `secondaryColor?: string`（默认 `#d9cec8`）
  - `height?: number`（默认 `600`）
  - `layout?: 'split'|'stack'`（默认 `split`，移动端可自动 stack）
  - `mapConfig?: { geoKey?: string; geoJSON?: object; view?: { type:'home'|'fitBounds', center?:{lon,lat}, zoom?:number, bounds?:[[number,number],[number,number]] }, interactive?: { pan?: boolean, zoom?: boolean } }`

## 地图资源与范围控制
- 地图数据来源（二选一）
  - `geoKey`：按需加载包内内置地理数据，例如 `worldLow`、`region/world/europeLow`、`countries/JPLow`
    - 动态导入示例：`const geodata = (await import('@amcharts/amcharts5-geodata/worldLow')).default`
  - `geoJSON`：传入自定义 GeoJSON（本地或远程拉取后注入）
- 视图范围
  - `view.type === 'home'`：使用 `center:{lon,lat}` 与 `zoom`，初始化后执行 `chart.goHome()` 固定视图
  - `view.type === 'fitBounds'`：传 `bounds`，根据边界计算中心与缩放；适合区域化聚焦
- 交互禁用（固定大小）
  - 地图实例参数：`panX:'none'`, `panY:'none'`, `wheelX:'none'`, `wheelY:'none'`；不挂载 `zoomControl`
  - 外层容器固定高度宽度（默认左右各 50%，高度由 `height` 控制）

## 渲染流程（关键步骤）
1. 初始化根与主题
   - 左侧：`am5timeline.SerpentineChart`，配置 `levelCount`, `startLocation`, `endLocation`
   - 右侧：`am5map.MapChart`，`projection: geoMercator()`，`homeGeoPoint/homeZoomLevel` 来自 `view`
2. 地图系列
   - `MapPolygonSeries`：`geoJSON` 指向内置或自定义地理数据；填充 `secondaryColor`
   - `MapPointSeries`：城市点与标签，`idField:'name'`，`heatRules` 映射 `population` 到半径
   - `MapLineSeries`：基于 `pointsToConnect` 连线行程
3. 时间线系列
   - `CurveLineSeries`：`xAxis` 为距离（`distance` km），`yAxis` 为分类 `category='city'`
   - `heatRules` 与 `bullets`：圆点、tooltip（展示名称、日期、人口等）
4. 联动交互
   - 两侧均以 `name` 为 `idField`，在 `pointerover/pointerout` 事件中互相查找对侧系列的子弹容器并触发 `hover()/unhover()`
5. 资源释放
   - 组件卸载时 `root.dispose()`；避免路由切换泄漏

## 生活频道样式适配
- 视觉基调：参考生活频道与专栏样式（棕色系、纸感、直角卡片）
  - 频道页：`src/components/features/ChannelLayout.jsx:67`、`src/components/features/LifeChannelLayout.jsx:85` 等
  - 专栏页主题：`src/components/features/ColumnLayout.jsx:18-33`（life 使用直角 `rounded-none` 与棕色主色）
- TripRouteChart 外层：
  - 卡片边框：`border: '1px solid #E5DDD5'`
  - 背景：`'#FEFCFA'`
  - 文字与标签：主文案用 `#8B7355`，辅助说明用 `#A0927D`
  - 直角风格：容器不使用圆角，或通过 props 允许切换（默认直角）
- 地图/时间线配色
  - `mainColor` 维持路线/圆点主色（默认深红可替换为 `#8B7355` 以统一频道风格）
  - `secondaryColor` 作为底图填充（浅棕/米色调），与文字颜色对比充足

## MDX 集成（仅生活频道）
- 渲染路径
  - 生活频道文章：`src/app/blog/life/[columnSlug]/[postSlug]/page.jsx:10` 设定 `CHANNEL_KEY = 'life'`，调用 `PostLayout`
- 注册组件
  - 在 `PostLayout` 的 `mdxComponents` 仅在 `isLifeChannel` 为真时注入 `TripRouteChart`
  - 参考位置：
    - 频道判断：`src/components/features/PostLayout.jsx:29`
    - 组件映射定义：`src/components/features/PostLayout.jsx:32`
- 示例代码（PostLayout 片段）
  ```jsx
  // src/components/features/TripRouteChart.jsx — 新建客户端组件
  // src/components/features/PostLayout.jsx — 仅生活频道映射
  const mdxComponents = {
    ...(isLifeChannel && {
      TripRouteChart: TripRouteChart,
    }),
    StockComparisonChart: StockComparisonChart,
    // 其他映射...
  };
  ```
- 非生活通用文章页（`src/app/blog/[slug]/page.jsx:97`）无需注册，避免跨频道使用

## MDX 使用示例
```mdx
<TripRouteChart
  height={600}
  mainColor="#8B7355"
  secondaryColor="#d9cec8"
  mapConfig={{
    geoKey: "worldLow",
    view: { type: "home", center: { lon: 20, lat: 10 }, zoom: 1.8 },
    interactive: { pan: false, zoom: false }
  }}
  points={[
    { distance: 0, name: "Vilnius", date: "2025-05-01", population: 607404, coordinates: [25.279652, 54.687157] },
    { distance: 462, name: "Warsaw",  date: "2025-05-02", population: 1793579, coordinates: [21.01178, 52.22977] },
    { distance: 1033,name: "Berlin",  date: "2025-05-03", population: 3769000, coordinates: [13.41053, 52.52437] },
    // ...更多点位
  ]}
/>
```

## 验证与发布
- 本地验证
  - 在生活频道下的测试文章插入示例，运行 `npm run dev`，验证左右联动、地图不可缩放、样式一致
- 构建与体积
  - 动态导入保证 SSR 安全；按需加载 geodata，避免无关区域体积
- 可观测性
  - 控制台警告：无数据或字段缺失时给出提示，不中断渲染

## 后续扩展
- 支持自定义 tooltip 模板（旅程备注、交通方式）
- `mapConfig` 支持更多投影方式与区域 geodata 映射
- 小屏自适应：自动 `stack` 布局并提供切换按钮（时间线/地图）