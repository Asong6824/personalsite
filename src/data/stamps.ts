export interface RailDiagramLine {
  /** SVG path，使用 220×150 左右的小画布坐标 */
  path: string;
  /** 线路名 */
  label: string;
  /** 线路颜色 */
  color: string;
  /** 路线类型，用于渲染额外线型 */
  routeType?: "shinkansen" | "railway" | "subway" | "monorail" | "air";
  /** 线宽 */
  strokeWidth?: number;
  /** SVG 虚线配置 */
  dashArray?: string;
}

export interface RailDiagramNode {
  /** 显示标签 */
  label: string;
  /** 对应车站 ID，可选；方向节点可以不绑定收藏车站 */
  stationId?: string;
  /** 节点位置 */
  x: number;
  y: number;
  /** 当前站 / 已收藏站 / 方向提示 */
  role: "current" | "collected" | "direction";
}

export interface RailDiagramBadge {
  /** 小徽标文字 */
  label: string;
  /** 背景色 */
  color: string;
}

export interface StationRailDiagram {
  /** SVG viewBox */
  viewBox?: string;
  /** 线路集合 */
  lines: RailDiagramLine[];
  /** 节点集合 */
  nodes: RailDiagramNode[];
  /** 运营公司/线路徽标 */
  badges?: RailDiagramBadge[];
}

export interface StationInfo {
  /** 车站稳定 ID，用于被印章、线路、旅程引用 */
  id: string;
  /** 駅名，例：東京駅 */
  name: string;
  /** 线路名，例：東海道新幹線 */
  line: string;
  /** 城市，例：東京 */
  city: string;
  /** 都道府県，例：東京都 */
  prefecture: string;
  /** 运营公司，例：JR東日本 */
  operator?: string;
  /** 详细地址（可选） */
  address?: string;
  /** 纬度（可选，日后做地图用） */
  lat?: number;
  /** 经度（可选，日后做地图用） */
  lng?: number;
  /** 无底图铁路线路示意图，优先用于印章展开卡 */
  railDiagram?: StationRailDiagram;
}

export interface StampImages {
  /** 印章本体照片 → TOS URL（必须） */
  stamp: string;
  /** 车站外观照片 → TOS URL（可选） */
  station?: string;
  /** 盖章场景 / 周边环境 → TOS URL（可选） */
  context?: string;
  /** 多张相关照片 → TOS URL 数组（可选） */
  album?: string[];
}

export interface StationRoute {
  /** 起点车站 ID */
  fromStationId: string;
  /** 终点车站 ID */
  toStationId: string;
  /** 路线类型，用于地图线型和颜色 */
  routeType?: "shinkansen" | "railway" | "subway" | "monorail" | "air";
  /** 使用线路，例：東海道新幹線 */
  line?: string;
  /** 大致耗时，例：約2時間15分 */
  duration?: string;
  /** 补充标签 */
  label?: string;
  /** 真实线路轨迹，可由 OpenStreetMap / Overpass 导入，格式为 [lng, lat] */
  geometry?: Array<[number, number]>;
}

export interface StampConnection {
  /** 可抵达车站对应的收藏编号 */
  stationId: string;
  /** 路线类型，用于地图线型和颜色 */
  routeType?: "shinkansen" | "railway" | "subway" | "monorail" | "air";
  /** 使用线路，例：東海道新幹線 */
  line?: string;
  /** 大致耗时，例：約2時間15分 */
  duration?: string;
  /** 补充标签 */
  label?: string;
  /** 真实线路轨迹，可由 OpenStreetMap / Overpass 导入，格式为 [lng, lat] */
  geometry?: Array<[number, number]>;
}

export interface StampRecord {
  /** 收藏编号 */
  id: string;
  /** 关联车站 ID */
  stationId: string;
  /** 收集日期，格式 YYYY/MM/DD */
  date: string;
  /** 具体盖章位置，例：改札外 北口案内所 */
  collectedAt?: string;
  /** 图片集合（印章图片上传到 TOS 后填 URL） */
  images: StampImages;
  /** 与这个车站的故事（支持多行文本） */
  story?: string;
  /** 简短备注 */
  note?: string;
  /** 卡片尺寸：小正方形 / 2:1长方形 / 大正方形(2×2) */
  size: "square" | "wide" | "large";
}

export interface Stamp extends StampRecord {
  /** 车站信息，由 stationId 从 stations 中解析得到 */
  station: StationInfo;
  /** 从该车站出发可抵达的收藏车站，由 stationRoutes 派生得到 */
  connections?: StampConnection[];
}

// ---------------------------------------------------------------------------
// 车站主数据：一个车站只维护一次，印章和线路通过 stationId 引用
// ---------------------------------------------------------------------------

export const stations: StationInfo[] = [
  {
    id: "tokyo",
    name: "東京駅",
    line: "東海道新幹線",
    city: "東京",
    prefecture: "東京都",
    operator: "JR東日本",
    lat: 35.6812,
    lng: 139.7671,
  },
  {
    id: "shin-osaka",
    name: "新大阪駅",
    line: "山陽新幹線",
    city: "大阪",
    prefecture: "大阪府",
    operator: "JR西日本",
    lat: 34.7335,
    lng: 135.5,
    railDiagram: {
      viewBox: "0 0 220 150",
      badges: [
        { label: "JR", color: "#0f78bd" },
        { label: "新幹線", color: "#1769ff" },
        { label: "Metro", color: "#d71920" },
      ],
      lines: [
        {
          label: "東海道・山陽新幹線",
          routeType: "shinkansen",
          color: "#1769ff",
          strokeWidth: 5,
          path: "M -18 132 C 35 120 76 112 105 100 C 135 82 170 42 238 7",
        },
        {
          label: "JR京都線",
          routeType: "railway",
          color: "#0f78bd",
          strokeWidth: 3.5,
          path: "M 122 -18 C 114 37 110 74 105 100 C 101 119 102 139 112 170",
        },
        {
          label: "御堂筋線",
          routeType: "subway",
          color: "#d71920",
          strokeWidth: 3.5,
          path: "M 54 -18 C 57 42 60 92 62 170",
        },
      ],
      nodes: [
        { label: "名古屋・東京方面", x: 196, y: 34, role: "direction" },
        { label: "京都方面", x: 151, y: 55, role: "direction" },
        { label: "新大阪", stationId: "shin-osaka", x: 105, y: 100, role: "current" },
        { label: "大阪方面", x: 112, y: 137, role: "direction" },
        { label: "広島・博多方面", x: 22, y: 125, role: "direction" },
        { label: "梅田・なんば方面", x: 61, y: 114, role: "direction" },
      ],
    },
  },
  {
    id: "kyoto",
    name: "京都駅",
    line: "東海道新幹線",
    city: "京都",
    prefecture: "京都府",
    operator: "JR西日本",
    lat: 34.9858,
    lng: 135.7588,
  },
  {
    id: "hakata",
    name: "博多駅",
    line: "九州新幹線",
    city: "福岡",
    prefecture: "福岡県",
    operator: "JR九州",
    lat: 33.5902,
    lng: 130.4206,
  },
  {
    id: "nagoya",
    name: "名古屋駅",
    line: "東海道新幹線",
    city: "名古屋",
    prefecture: "愛知県",
    operator: "JR東海",
    lat: 35.1709,
    lng: 136.8815,
  },
  {
    id: "sendai",
    name: "仙台駅",
    line: "東北新幹線",
    city: "仙台",
    prefecture: "宮城県",
    operator: "JR東日本",
    lat: 38.2601,
    lng: 140.8824,
  },
  {
    id: "sapporo",
    name: "札幌駅",
    line: "函館本線",
    city: "札幌",
    prefecture: "北海道",
    operator: "JR北海道",
    lat: 43.0687,
    lng: 141.3508,
  },
  {
    id: "yokohama",
    name: "横浜駅",
    line: "東海道本線",
    city: "横浜",
    prefecture: "神奈川県",
    operator: "JR東日本",
    lat: 35.4662,
    lng: 139.6227,
  },
  {
    id: "kobe",
    name: "神戸駅",
    line: "山陽本線",
    city: "神戸",
    prefecture: "兵庫県",
    operator: "JR西日本",
    lat: 34.6793,
    lng: 135.1786,
  },
  {
    id: "hiroshima",
    name: "広島駅",
    line: "山陽新幹線",
    city: "広島",
    prefecture: "広島県",
    operator: "JR西日本",
    lat: 34.3976,
    lng: 132.4757,
  },
  {
    id: "kanazawa",
    name: "金沢駅",
    line: "北陸新幹線",
    city: "金沢",
    prefecture: "石川県",
    operator: "JR西日本",
    lat: 36.578,
    lng: 136.6482,
  },
  {
    id: "naha",
    name: "那覇駅",
    line: "沖縄都市モノレール",
    city: "那覇",
    prefecture: "沖縄県",
    operator: "沖縄都市モノレール",
    lat: 26.2123,
    lng: 127.6792,
  },
];

// ---------------------------------------------------------------------------
// 印章收藏记录：只记录这一次收藏本身，不重复维护车站基础信息
// ---------------------------------------------------------------------------

export const stampRecords: StampRecord[] = [
  {
    id: "087",
    stationId: "tokyo",
    date: "2025/06/29",
    collectedAt: "丸の内南口 駅スタンプ corner",
    images: {
      stamp: "https://blog-assets-asong.tos-cn-beijing.volces.com/stamps/087-tokyo-stamp.jpg",
    },
    story:
      "那天从京都赶过来，暴雨。在丸の内南口的案内所里，阿姨看我湿透的样子，特意找了张新的印台帮我盖。印章上的东京站红砖墙，是我对日本的第一印象。",
    size: "large",
  },
  {
    id: "086",
    stationId: "shin-osaka",
    date: "2025/02/06",
    images: {
      stamp: "https://blog-assets-asong.tos-cn-beijing.volces.com/stamps/086-shin-osaka-stamp.jpg",
    },
    size: "square",
  },
  {
    id: "085",
    stationId: "kyoto",
    date: "2025/01/23",
    collectedAt: "駅ビル 展望台入口",
    images: {
      stamp: "https://blog-assets-asong.tos-cn-beijing.volces.com/stamps/085-kyoto-stamp.jpg",
    },
    size: "square",
  },
  {
    id: "084",
    stationId: "hakata",
    date: "2025/01/23",
    images: {
      stamp: "https://blog-assets-asong.tos-cn-beijing.volces.com/stamps/084-hakata-stamp.jpg",
    },
    size: "wide",
  },
  {
    id: "083",
    stationId: "nagoya",
    date: "2025/01/23",
    images: {
      stamp: "https://blog-assets-asong.tos-cn-beijing.volces.com/stamps/083-nagoya-stamp.jpg",
    },
    size: "square",
  },
  {
    id: "082",
    stationId: "sendai",
    date: "2024/03/02",
    collectedAt: "牛たん通り口 改札外",
    images: {
      stamp: "https://blog-assets-asong.tos-cn-beijing.volces.com/stamps/082-sendai-stamp.jpg",
    },
    story: "为了这碗牛舌特意在仙台转车。盖完章冲进善治郎，坐在吧台位看师傅切肉，那十分钟是我吃过最安静的午餐。",
    size: "large",
  },
  {
    id: "081",
    stationId: "sapporo",
    date: "2023/12/09",
    images: {
      stamp: "https://blog-assets-asong.tos-cn-beijing.volces.com/stamps/081-sapporo-stamp.jpg",
    },
    size: "square",
  },
  {
    id: "080",
    stationId: "yokohama",
    date: "2023/11/15",
    images: {
      stamp: "https://blog-assets-asong.tos-cn-beijing.volces.com/stamps/080-yokohama-stamp.jpg",
    },
    size: "square",
  },
  {
    id: "079",
    stationId: "kobe",
    date: "2023/10/22",
    images: {
      stamp: "https://blog-assets-asong.tos-cn-beijing.volces.com/stamps/079-kobe-stamp.jpg",
    },
    size: "wide",
  },
  {
    id: "078",
    stationId: "hiroshima",
    date: "2023/09/08",
    collectedAt: "新幹線口 案内所",
    images: {
      stamp: "https://blog-assets-asong.tos-cn-beijing.volces.com/stamps/078-hiroshima-stamp.jpg",
    },
    size: "square",
  },
  {
    id: "077",
    stationId: "kanazawa",
    date: "2023/08/19",
    images: {
      stamp: "https://blog-assets-asong.tos-cn-beijing.volces.com/stamps/077-kanazawa-stamp.jpg",
    },
    size: "square",
  },
  {
    id: "076",
    stationId: "naha",
    date: "2023/07/04",
    images: {
      stamp: "https://blog-assets-asong.tos-cn-beijing.volces.com/stamps/076-naha-stamp.jpg",
    },
    size: "wide",
  },
];

// ---------------------------------------------------------------------------
// 车站关系：用于展开卡片里的 SVG 可达线路动画
// ---------------------------------------------------------------------------

export const stationRoutes: StationRoute[] = [
  { fromStationId: "tokyo", toStationId: "kyoto", line: "東海道新幹線", duration: "約2時間15分" },
  { fromStationId: "tokyo", toStationId: "nagoya", line: "東海道新幹線", duration: "約1時間40分" },
  { fromStationId: "tokyo", toStationId: "sendai", line: "東北新幹線", duration: "約1時間30分" },
  { fromStationId: "tokyo", toStationId: "yokohama", line: "東海道本線", duration: "約30分" },
  { fromStationId: "shin-osaka", toStationId: "kyoto", line: "東海道新幹線", duration: "約15分" },
  { fromStationId: "shin-osaka", toStationId: "nagoya", line: "東海道新幹線", duration: "約50分" },
  { fromStationId: "shin-osaka", toStationId: "hiroshima", line: "山陽新幹線", duration: "約1時間20分" },
  { fromStationId: "shin-osaka", toStationId: "hakata", line: "山陽・九州新幹線", duration: "約2時間30分" },
  { fromStationId: "kyoto", toStationId: "shin-osaka", line: "東海道新幹線", duration: "約15分" },
  { fromStationId: "kyoto", toStationId: "nagoya", line: "東海道新幹線", duration: "約35分" },
  { fromStationId: "kyoto", toStationId: "tokyo", line: "東海道新幹線", duration: "約2時間15分" },
  { fromStationId: "hakata", toStationId: "hiroshima", line: "山陽新幹線", duration: "約1時間" },
  { fromStationId: "hakata", toStationId: "shin-osaka", line: "山陽新幹線", duration: "約2時間30分" },
  { fromStationId: "hakata", toStationId: "naha", line: "空路接続", duration: "約1時間45分" },
  { fromStationId: "nagoya", toStationId: "kyoto", line: "東海道新幹線", duration: "約35分" },
  { fromStationId: "nagoya", toStationId: "tokyo", line: "東海道新幹線", duration: "約1時間40分" },
  { fromStationId: "nagoya", toStationId: "shin-osaka", line: "東海道新幹線", duration: "約50分" },
  { fromStationId: "sendai", toStationId: "tokyo", line: "東北新幹線", duration: "約1時間30分" },
  { fromStationId: "sendai", toStationId: "sapporo", line: "東北・北海道新幹線", duration: "約5時間30分" },
  { fromStationId: "sapporo", toStationId: "sendai", line: "北海道・東北新幹線", duration: "約5時間30分" },
  { fromStationId: "sapporo", toStationId: "tokyo", line: "空路接続", duration: "約1時間40分" },
  { fromStationId: "yokohama", toStationId: "tokyo", line: "東海道本線", duration: "約30分" },
  { fromStationId: "yokohama", toStationId: "nagoya", line: "東海道新幹線", duration: "約1時間30分" },
  { fromStationId: "kobe", toStationId: "shin-osaka", line: "山陽本線", duration: "約25分" },
  { fromStationId: "kobe", toStationId: "hiroshima", line: "山陽新幹線", duration: "約1時間10分" },
  { fromStationId: "kobe", toStationId: "hakata", line: "山陽新幹線", duration: "約2時間20分" },
  { fromStationId: "hiroshima", toStationId: "kobe", line: "山陽新幹線", duration: "約1時間10分" },
  { fromStationId: "hiroshima", toStationId: "shin-osaka", line: "山陽新幹線", duration: "約1時間20分" },
  { fromStationId: "hiroshima", toStationId: "hakata", line: "山陽新幹線", duration: "約1時間" },
  { fromStationId: "kanazawa", toStationId: "tokyo", line: "北陸新幹線", duration: "約2時間30分" },
  { fromStationId: "kanazawa", toStationId: "nagoya", line: "特急・新幹線接続", duration: "約2時間30分" },
  { fromStationId: "naha", toStationId: "hakata", line: "空路接続", duration: "約1時間45分" },
  { fromStationId: "naha", toStationId: "tokyo", line: "空路接続", duration: "約2時間40分" },
];

const stationById = new Map(stations.map((station) => [station.id, station]));
const firstStampByStationId = new Map(stampRecords.map((stamp) => [stamp.stationId, stamp.id]));

function resolveStation(stationId: string) {
  const station = stationById.get(stationId);
  if (!station) {
    throw new Error(`Unknown stationId in stamp data: ${stationId}`);
  }
  return station;
}

function getStampConnections(stationId: string): StampConnection[] {
  return stationRoutes
    .filter((route) => route.fromStationId === stationId)
    .map((route): StampConnection | null => {
      const stampId = firstStampByStationId.get(route.toStationId);
      if (!stampId) return null;
      return {
        stationId: stampId,
        routeType: route.routeType,
        line: route.line,
        duration: route.duration,
        label: route.label,
        geometry: route.geometry,
      };
    })
    .filter((connection): connection is StampConnection => Boolean(connection));
}

export const stamps: Stamp[] = stampRecords.map((stamp) => ({
  ...stamp,
  station: resolveStation(stamp.stationId),
  connections: getStampConnections(stamp.stationId),
}));

// ---------------------------------------------------------------------------
// 导航与社交链接 —— 以下为占位数据，填入有效 href 后 UI 会自动显示
// ---------------------------------------------------------------------------

export const navLinks = [
  { label: "JR東日本", href: "#" },
  { label: "JR西日本", href: "#" },
  { label: "JR東海", href: "#" },
  { label: "JR九州", href: "#" },
  { label: "私鉄各社", href: "#" },
];

export const socialLinks = [
  { label: "Instagram", href: "https://instagram.com" },
  { label: "Twitter", href: "https://twitter.com" },
  { label: "Figma", href: "https://figma.com" },
];
