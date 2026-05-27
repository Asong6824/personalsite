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
    id: "temma",
    name: "天満駅",
    line: "大阪環状線",
    city: "大阪",
    prefecture: "大阪府",
    operator: "JR西日本",
    address: "大阪府大阪市北区錦町1-20",
    lat: 34.7049,
    lng: 135.5121,
  },
  {
    id: "shin-imamiya",
    name: "新今宮駅",
    line: "大阪環状線",
    city: "大阪",
    prefecture: "大阪府",
    operator: "JR西日本",
    address: "大阪府大阪市浪速区恵美須西3-17-1",
    lat: 34.6502,
    lng: 135.5007,
  },
  {
    id: "tennoji",
    name: "天王寺駅",
    line: "大阪環状線",
    city: "大阪",
    prefecture: "大阪府",
    operator: "JR西日本",
    address: "大阪府大阪市天王寺区悲田院町10-45",
    lat: 34.6470,
    lng: 135.5115,
  },
  {
    id: "rinku-town",
    name: "りんくうタウン駅",
    line: "関西空港線",
    city: "泉佐野",
    prefecture: "大阪府",
    operator: "JR西日本",
    address: "大阪府泉佐野市りんくう往来北1番地",
    lat: 34.4113,
    lng: 135.2998,
  },
  {
    id: "kansai-airport",
    name: "関西空港駅",
    line: "関西空港線",
    city: "田尻",
    prefecture: "大阪府",
    operator: "JR西日本",
    address: "大阪府泉南郡田尻町泉州空港中1番",
    lat: 34.4358,
    lng: 135.2434,
  },
  {
    id: "wakayama",
    name: "和歌山駅",
    line: "阪和線",
    city: "和歌山",
    prefecture: "和歌山県",
    operator: "JR西日本",
    address: "和歌山県和歌山市美園町3-1",
    lat: 34.2322,
    lng: 135.1913,
  },
  {
    id: "kii-tanabe",
    name: "紀伊田辺駅",
    line: "紀勢本線（きのくに線）",
    city: "田辺",
    prefecture: "和歌山県",
    operator: "JR西日本",
    address: "和歌山県田辺市湊1番24号",
    lat: 33.7331,
    lng: 135.3842,
  },
  {
    id: "shingu",
    name: "新宮駅",
    line: "紀勢本線",
    city: "新宮",
    prefecture: "和歌山県",
    operator: "JR西日本",
    address: "和歌山県新宮市徐福2丁目1番1号",
    lat: 33.7252,
    lng: 135.9941,
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
  {
    id: "ibaraki",
    name: "茨木駅",
    line: "東海道本線（JR京都線）",
    city: "茨木",
    prefecture: "大阪府",
    operator: "JR西日本",
    address: "大阪府茨木市駅前一丁目1-10",
    lat: 34.8154,
    lng: 135.5623,
  },
  {
    id: "jr-sojiji",
    name: "JR総持寺駅",
    line: "東海道本線（JR京都線）",
    city: "茨木",
    prefecture: "大阪府",
    operator: "JR西日本",
    address: "大阪府茨木市庄一丁目28番55号",
    lat: 34.8283,
    lng: 135.5773,
  },
  {
    id: "takatsuki",
    name: "高槻駅",
    line: "東海道本線（JR京都線）",
    city: "高槻",
    prefecture: "大阪府",
    operator: "JR西日本",
    address: "大阪府高槻市白梅町1-1",
    lat: 34.8521,
    lng: 135.6179,
  },
  {
    id: "yamazaki",
    name: "山崎駅",
    line: "東海道本線（JR京都線）",
    city: "大山崎",
    prefecture: "京都府",
    operator: "JR西日本",
    address: "京都府乙訓郡大山崎町字大山崎小字西谷24-1",
    lat: 34.8922,
    lng: 135.6799,
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
    id: "hanazono",
    name: "花園駅",
    line: "山陰本線（嵯峨野線）",
    city: "京都",
    prefecture: "京都府",
    operator: "JR西日本",
    address: "京都府京都市右京区花園寺ノ内町5",
    lat: 35.0186,
    lng: 135.7178,
  },
  {
    id: "inari",
    name: "稲荷駅",
    line: "JR奈良線",
    city: "京都",
    prefecture: "京都府",
    operator: "JR西日本",
    address: "京都府京都市伏見区深草稲荷御前町",
    lat: 34.9668,
    lng: 135.7707,
  },
  {
    id: "yamashina",
    name: "山科駅",
    line: "東海道本線（琵琶湖線）",
    city: "京都",
    prefecture: "京都府",
    operator: "JR西日本",
    address: "京都府京都市山科区安朱北屋敷町",
    lat: 34.9923,
    lng: 135.8166,
  },
  {
    id: "minami-kusatsu",
    name: "南草津駅",
    line: "東海道本線（琵琶湖線）",
    city: "草津",
    prefecture: "滋賀県",
    operator: "JR西日本",
    address: "滋賀県草津市野路一丁目",
    lat: 35.0037,
    lng: 135.9473,
  },
  {
    id: "maibara",
    name: "米原駅",
    line: "東海道本線（琵琶湖線）",
    city: "米原",
    prefecture: "滋賀県",
    operator: "JR西日本",
    address: "滋賀県米原市米原",
    lat: 35.3147,
    lng: 136.2898,
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
    id: "sannomiya",
    name: "三ノ宮駅",
    line: "東海道本線（JR神戸線）",
    city: "神戸",
    prefecture: "兵庫県",
    operator: "JR西日本",
    address: "兵庫県神戸市中央区布引町四丁目1-1",
    lat: 34.6942,
    lng: 135.1944,
  },
  {
    id: "suma-kaihin-koen",
    name: "須磨海浜公園駅",
    line: "山陽本線（JR神戸線）",
    city: "神戸",
    prefecture: "兵庫県",
    operator: "JR西日本",
    address: "兵庫県神戸市須磨区松風町5丁目2番43号",
    lat: 34.6472,
    lng: 135.1266,
  },
  {
    id: "suma",
    name: "須磨駅",
    line: "山陽本線（JR神戸線）",
    city: "神戸",
    prefecture: "兵庫県",
    operator: "JR西日本",
    address: "兵庫県神戸市須磨区須磨浦通4丁目2",
    lat: 34.6423,
    lng: 135.1129,
  },
  {
    id: "tarumi",
    name: "垂水駅",
    line: "山陽本線（JR神戸線）",
    city: "神戸",
    prefecture: "兵庫県",
    operator: "JR西日本",
    address: "兵庫県神戸市垂水区神田町",
    lat: 34.6293,
    lng: 135.0538,
  },
  {
    id: "maiko",
    name: "舞子駅",
    line: "山陽本線（JR神戸線）",
    city: "神戸",
    prefecture: "兵庫県",
    operator: "JR西日本",
    address: "兵庫県神戸市垂水区東舞子町3番-1",
    lat: 34.6335,
    lng: 135.0338,
  },
  {
    id: "himeji",
    name: "姫路駅",
    line: "山陽本線（JR神戸線）",
    city: "姫路",
    prefecture: "兵庫県",
    operator: "JR西日本",
    address: "兵庫県姫路市駅前町188番",
    lat: 34.8268,
    lng: 134.6905,
  },
  {
    id: "okayama",
    name: "岡山駅",
    line: "山陽新幹線",
    city: "岡山",
    prefecture: "岡山県",
    operator: "JR西日本",
    address: "岡山県岡山市北区駅元町1-1",
    lat: 34.6665,
    lng: 133.9181,
  },
  {
    id: "kurashiki",
    name: "倉敷駅",
    line: "山陽本線",
    city: "倉敷",
    prefecture: "岡山県",
    operator: "JR西日本",
    address: "岡山県倉敷市阿知1-1-1",
    lat: 34.6017,
    lng: 133.7659,
  },
  {
    id: "kanazawa",
    name: "金沢駅",
    line: "北陸新幹線",
    city: "金沢",
    prefecture: "石川県",
    operator: "JR西日本",
    address: "石川県金沢市木ノ新保町1-1",
    lat: 36.578,
    lng: 136.6482,
  },
  {
    id: "tsuruga",
    name: "敦賀駅",
    line: "北陸新幹線",
    city: "敦賀",
    prefecture: "福井県",
    operator: "JR西日本",
    address: "福井県敦賀市木ノ芽町",
    lat: 35.6425,
    lng: 136.0745,
  },
  {
    id: "takaoka",
    name: "高岡駅",
    line: "城端線・氷見線",
    city: "高岡",
    prefecture: "富山県",
    operator: "JR西日本",
    address: "富山県高岡市下関町",
    lat: 36.7406,
    lng: 137.0161,
  },
  {
    id: "shin-takaoka",
    name: "新高岡駅",
    line: "北陸新幹線",
    city: "高岡",
    prefecture: "富山県",
    operator: "JR西日本",
    address: "富山県高岡市下黒田",
    lat: 36.7270,
    lng: 137.0119,
  },
  {
    id: "amaharashi",
    name: "雨晴駅",
    line: "氷見線",
    city: "高岡",
    prefecture: "富山県",
    operator: "JR西日本",
    address: "富山県高岡市太田",
    lat: 36.8148,
    lng: 137.0416,
  },
  {
    id: "toyama",
    name: "富山駅",
    line: "北陸新幹線",
    city: "富山",
    prefecture: "富山県",
    operator: "JR西日本",
    address: "富山県富山市明輪町1-225",
    lat: 36.7014,
    lng: 137.2134,
  },
  {
    id: "tottori",
    name: "鳥取駅",
    line: "山陰本線",
    city: "鳥取",
    prefecture: "鳥取県",
    operator: "JR西日本",
    address: "鳥取県鳥取市東品治町111",
    lat: 35.4940,
    lng: 134.2259,
  },
  {
    id: "ogaki",
    name: "大垣駅",
    line: "東海道本線",
    city: "大垣",
    prefecture: "岐阜県",
    operator: "JR東海",
    address: "岐阜県大垣市高屋町1丁目",
    lat: 35.3703,
    lng: 136.6069,
  },
  {
    id: "atsuta",
    name: "熱田駅",
    line: "東海道本線",
    city: "名古屋",
    prefecture: "愛知県",
    operator: "JR東海",
    address: "愛知県名古屋市熱田区森後町2丁目",
    lat: 35.1300,
    lng: 136.9101,
  },
  {
    id: "toyohashi",
    name: "豊橋駅",
    line: "東海道本線",
    city: "豊橋",
    prefecture: "愛知県",
    operator: "JR東海",
    address: "愛知県豊橋市花田町字西宿",
    lat: 34.7629,
    lng: 137.3821,
  },
  {
    id: "shizuoka",
    name: "静岡駅",
    line: "東海道本線",
    city: "静岡",
    prefecture: "静岡県",
    operator: "JR東海",
    address: "静岡県静岡市葵区黒金町50",
    lat: 34.9717,
    lng: 138.3891,
  },
  {
    id: "shimizu",
    name: "清水駅",
    line: "東海道本線",
    city: "静岡",
    prefecture: "静岡県",
    operator: "JR東海",
    address: "静岡県静岡市清水区真砂町1-1",
    lat: 35.0234,
    lng: 138.4891,
  },
  {
    id: "ishikawacho",
    name: "石川町駅",
    line: "根岸線",
    city: "横浜",
    prefecture: "神奈川県",
    operator: "JR東日本",
    address: "神奈川県横浜市中区石川町2丁目72",
    lat: 35.4387,
    lng: 139.6430,
  },
  {
    id: "ofuna",
    name: "大船駅",
    line: "東海道本線・横須賀線・根岸線",
    city: "鎌倉",
    prefecture: "神奈川県",
    operator: "JR東日本",
    address: "神奈川県鎌倉市大船1丁目1-1",
    lat: 35.3536,
    lng: 139.5311,
  },
  {
    id: "kamakura",
    name: "鎌倉駅",
    line: "横須賀線",
    city: "鎌倉",
    prefecture: "神奈川県",
    operator: "JR東日本",
    address: "神奈川県鎌倉市小町1丁目1-1",
    lat: 35.3189,
    lng: 139.5507,
  },
  {
    id: "yokosuka",
    name: "横須賀駅",
    line: "横須賀線",
    city: "横須賀",
    prefecture: "神奈川県",
    operator: "JR東日本",
    address: "神奈川県横須賀市東逸見町1丁目1-1",
    lat: 35.2841,
    lng: 139.6559,
  },
  {
    id: "fujisawa",
    name: "藤沢駅",
    line: "東海道本線",
    city: "藤沢",
    prefecture: "神奈川県",
    operator: "JR東日本",
    address: "神奈川県藤沢市藤沢",
    lat: 35.3388,
    lng: 139.4873,
  },
  {
    id: "hiratsuka",
    name: "平塚駅",
    line: "東海道本線",
    city: "平塚",
    prefecture: "神奈川県",
    operator: "JR東日本",
    address: "神奈川県平塚市宝町1番1号",
    lat: 35.3276,
    lng: 139.3505,
  },
  {
    id: "kawasaki",
    name: "川崎駅",
    line: "東海道本線",
    city: "川崎",
    prefecture: "神奈川県",
    operator: "JR東日本",
    address: "神奈川県川崎市川崎区駅前本町26-1",
    lat: 35.5314,
    lng: 139.6970,
  },
  {
    id: "shinagawa",
    name: "品川駅",
    line: "山手線",
    city: "東京",
    prefecture: "東京都",
    operator: "JR東日本",
    address: "東京都港区高輪3丁目",
    lat: 35.6291,
    lng: 139.7389,
  },
  {
    id: "ebisu",
    name: "恵比寿駅",
    line: "山手線",
    city: "東京",
    prefecture: "東京都",
    operator: "JR東日本",
    address: "東京都渋谷区恵比寿南一丁目5-5",
    lat: 35.6467,
    lng: 139.7101,
  },
  {
    id: "tamachi",
    name: "田町駅",
    line: "山手線",
    city: "東京",
    prefecture: "東京都",
    operator: "JR東日本",
    address: "東京都港区芝5丁目33",
    lat: 35.6457,
    lng: 139.7476,
  },
  {
    id: "shibuya",
    name: "渋谷駅",
    line: "山手線",
    city: "東京",
    prefecture: "東京都",
    operator: "JR東日本",
    address: "東京都渋谷区渋谷2丁目",
    lat: 35.6585,
    lng: 139.7013,
  },
  {
    id: "harajuku",
    name: "原宿駅",
    line: "山手線",
    city: "東京",
    prefecture: "東京都",
    operator: "JR東日本",
    address: "東京都渋谷区神宮前",
    lat: 35.6702,
    lng: 139.7027,
  },
  {
    id: "shinjuku",
    name: "新宿駅",
    line: "山手線",
    city: "東京",
    prefecture: "東京都",
    operator: "JR東日本",
    address: "東京都新宿区新宿3丁目",
    lat: 35.6909,
    lng: 139.7003,
  },
  {
    id: "takadanobaba",
    name: "高田馬場駅",
    line: "山手線",
    city: "東京",
    prefecture: "東京都",
    operator: "JR東日本",
    address: "東京都新宿区高田馬場1丁目",
    lat: 35.7123,
    lng: 139.7038,
  },
  {
    id: "ikebukuro",
    name: "池袋駅",
    line: "山手線",
    city: "東京",
    prefecture: "東京都",
    operator: "JR東日本",
    address: "東京都豊島区南池袋2丁目",
    lat: 35.7289,
    lng: 139.7104,
  },
];

// ---------------------------------------------------------------------------
// 印章收藏记录：只记录这一次收藏本身，不重复维护车站基础信息
// ---------------------------------------------------------------------------

export const stampRecords: StampRecord[] = [
  {
    id: "086",
    stationId: "shin-osaka",
    date: "2025/02/06",
    images: {
      stamp: "https://blog-assets-asong.tos-cn-beijing.volces.com/life/train/stamp/jrw-shinosaka.jpg",
    },
    size: "square",
  },
  {
    id: "085",
    stationId: "kyoto",
    date: "2025/01/23",
    collectedAt: "駅ビル 展望台入口",
    images: {
      stamp: "https://blog-assets-asong.tos-cn-beijing.volces.com/life/train/stamp/jrw-kyoto.jpg",
    },
    size: "square",
  },
  {
    id: "083",
    stationId: "nagoya",
    date: "2025/01/23",
    images: {
      stamp: "https://blog-assets-asong.tos-cn-beijing.volces.com/life/train/stamp/jrc-r150-nagoya.jpg",
    },
    size: "square",
  },
  {
    id: "080",
    stationId: "yokohama",
    date: "2023/11/15",
    images: {
      stamp: "https://blog-assets-asong.tos-cn-beijing.volces.com/life/train/stamp/jre-yokohama.jpg",
    },
    size: "square",
  },
  {
    id: "077",
    stationId: "kanazawa",
    date: "2023/08/19",
    images: {
      stamp: "https://blog-assets-asong.tos-cn-beijing.volces.com/life/train/stamp/jrw-kanazawa.jpg",
    },
    size: "square",
  },
  {
    id: "088",
    stationId: "osaka",
    date: "2025/05/25",
    images: {
      stamp: "https://blog-assets-asong.tos-cn-beijing.volces.com/life/train/stamp/jrw-osaka.jpg",
    },
    size: "square",
  },
  {
    id: "089",
    stationId: "suita",
    date: "2025/05/25",
    images: {
      stamp: "https://blog-assets-asong.tos-cn-beijing.volces.com/life/train/stamp/jrw-suita.jpg",
    },
    size: "square",
  },
  {
    id: "090",
    stationId: "ibaraki",
    date: "2025/05/25",
    images: {
      stamp: "https://blog-assets-asong.tos-cn-beijing.volces.com/life/train/stamp/jrw-ibaraki.jpg",
    },
    size: "square",
  },
  {
    id: "091",
    stationId: "jr-sojiji",
    date: "2025/05/25",
    images: {
      stamp: "https://blog-assets-asong.tos-cn-beijing.volces.com/life/train/stamp/jrw-jr_sojiji.jpg",
    },
    size: "square",
  },
  {
    id: "092",
    stationId: "takatsuki",
    date: "2025/05/25",
    images: {
      stamp: "https://blog-assets-asong.tos-cn-beijing.volces.com/life/train/stamp/jrw-takatsuki.jpg",
    },
    size: "square",
  },
  {
    id: "093",
    stationId: "yamazaki",
    date: "2025/05/25",
    images: {
      stamp: "/images/stamps/kyoto_B83A2E.png",
    },
    size: "square",
  },
  // TODO: 请替换以下占位日期和图片 URL
  {
    id: "094",
    stationId: "ogaki",
    date: "2026/05/25",
    collectedAt: "改札外 観光案内所（JR東海实体印章已撤去）",
    images: {
      stamp: "https://blog-assets-asong.tos-cn-beijing.volces.com/life/train/stamp/jrc-r150-oogaki.jpg",
    },
    story: "大垣駅的实体印章已撤去，这枚是改札外观光案内所的『水の都・大垣』印章。",
    size: "square",
  },
  {
    id: "095",
    stationId: "atsuta",
    date: "2026/05/25",
    images: {
      stamp: "https://blog-assets-asong.tos-cn-beijing.volces.com/life/train/stamp/jrc-r150-atsuta.jpg",
    },
    story: "熱田神宮の最寄り駅。JR東海的数字印章。",
    size: "square",
  },
  {
    id: "096",
    stationId: "toyohashi",
    date: "2026/05/25",
    images: {
      stamp: "https://blog-assets-asong.tos-cn-beijing.volces.com/life/train/stamp/jrc-r150-toyohashi.jpg",
    },
    size: "square",
  },
  {
    id: "097",
    stationId: "shizuoka",
    date: "2026/05/25",
    images: {
      stamp: "https://blog-assets-asong.tos-cn-beijing.volces.com/life/train/stamp/jrc-r150-sizuoka.jpg",
    },
    size: "square",
  },
  {
    id: "098",
    stationId: "shimizu",
    date: "2026/05/25",
    images: {
      stamp: "https://blog-assets-asong.tos-cn-beijing.volces.com/life/train/stamp/jrc-r150-simizu.jpg",
    },
    story: "改札を出ると富士山が目の前に現れる駅。",
    size: "square",
  },
  {
    id: "099",
    stationId: "ishikawacho",
    date: "2026/05/25",
    images: {
      stamp: "https://blog-assets-asong.tos-cn-beijing.volces.com/life/train/stamp/jre-ishikawacho.jpg",
    },
    story: "横浜中華街の最寄り駅。",
    size: "square",
  },
  {
    id: "100",
    stationId: "ofuna",
    date: "2026/05/25",
    images: {
      stamp: "https://blog-assets-asong.tos-cn-beijing.volces.com/life/train/stamp/jre-ofuna.jpg",
    },
    size: "square",
  },
  {
    id: "101",
    stationId: "kamakura",
    date: "2026/05/25",
    images: {
      stamp: "https://blog-assets-asong.tos-cn-beijing.volces.com/life/train/stamp/jre-kamakura.jpg",
    },
    story: "鶴岡八幡宮への玄関口。",
    size: "square",
  },
  {
    id: "102",
    stationId: "yokosuka",
    date: "2026/05/25",
    images: {
      stamp: "https://blog-assets-asong.tos-cn-beijing.volces.com/life/train/stamp/jre-yokosuka.jpg",
    },
    story: "階段のない駅舎で知られる。",
    size: "square",
  },
  {
    id: "103",
    stationId: "fujisawa",
    date: "2026/05/25",
    images: {
      stamp: "https://blog-assets-asong.tos-cn-beijing.volces.com/life/train/stamp/jre-fujisawa.jpg",
    },
    story: "江ノ電の起点駅。",
    size: "square",
  },
  {
    id: "104",
    stationId: "hiratsuka",
    date: "2026/05/25",
    images: {
      stamp: "https://blog-assets-asong.tos-cn-beijing.volces.com/life/train/stamp/jre-hiratsuka.jpg",
    },
    story: "湘南ひらつか七夕まつりの街。",
    size: "square",
  },
  {
    id: "105",
    stationId: "kawasaki",
    date: "2026/05/25",
    images: {
      stamp: "https://blog-assets-asong.tos-cn-beijing.volces.com/life/train/stamp/jre-kawasaki.jpg",
    },
    size: "square",
  },
  {
    id: "106",
    stationId: "shinagawa",
    date: "2026/05/25",
    images: {
      stamp: "https://blog-assets-asong.tos-cn-beijing.volces.com/life/train/stamp/jre-shinagawa.jpg",
    },
    size: "square",
  },
  {
    id: "107",
    stationId: "ebisu",
    date: "2026/05/25",
    images: {
      stamp: "https://blog-assets-asong.tos-cn-beijing.volces.com/life/train/stamp/jre-ebisu.jpg",
    },
    size: "square",
  },
  {
    id: "108",
    stationId: "tamachi",
    date: "2026/05/25",
    images: {
      stamp: "https://blog-assets-asong.tos-cn-beijing.volces.com/life/train/stamp/jre-tamachi.jpg",
    },
    size: "square",
  },
  {
    id: "109",
    stationId: "shibuya",
    date: "2026/05/25",
    images: {
      stamp: "https://blog-assets-asong.tos-cn-beijing.volces.com/life/train/stamp/jre-shibuya.jpg",
    },
    size: "square",
  },
  {
    id: "110",
    stationId: "harajuku",
    date: "2026/05/25",
    images: {
      stamp: "https://blog-assets-asong.tos-cn-beijing.volces.com/life/train/stamp/jre-harajuku.jpg",
    },
    size: "square",
  },
  {
    id: "111",
    stationId: "shinjuku",
    date: "2026/05/25",
    images: {
      stamp: "https://blog-assets-asong.tos-cn-beijing.volces.com/life/train/stamp/jre-shinjuku.jpg",
    },
    size: "square",
  },
  {
    id: "112",
    stationId: "takadanobaba",
    date: "2026/05/25",
    images: {
      stamp: "https://blog-assets-asong.tos-cn-beijing.volces.com/life/train/stamp/jre-takadanobaba.jpg",
    },
    size: "square",
  },
  {
    id: "113",
    stationId: "ikebukuro",
    date: "2026/05/25",
    images: {
      stamp: "https://blog-assets-asong.tos-cn-beijing.volces.com/life/train/stamp/jre-ikebukuro.jpg",
    },
    size: "square",
  },
  {
    id: "114",
    stationId: "amaharashi",
    date: "2026/05/25",
    images: {
      stamp: "https://blog-assets-asong.tos-cn-beijing.volces.com/life/train/stamp/jrw-amaharashi.jpg",
    },
    size: "square",
  },
  {
    id: "115",
    stationId: "hanazono",
    date: "2026/05/25",
    images: {
      stamp: "https://blog-assets-asong.tos-cn-beijing.volces.com/life/train/stamp/jrw-hanazono.jpg",
    },
    size: "square",
  },
  {
    id: "116",
    stationId: "himeji",
    date: "2026/05/25",
    images: {
      stamp: "https://blog-assets-asong.tos-cn-beijing.volces.com/life/train/stamp/jrw-himeji.jpg",
    },
    size: "square",
  },
  {
    id: "117",
    stationId: "inari",
    date: "2026/05/25",
    images: {
      stamp: "https://blog-assets-asong.tos-cn-beijing.volces.com/life/train/stamp/jrw-inari.jpg",
    },
    size: "square",
  },
  {
    id: "118",
    stationId: "kurashiki",
    date: "2026/05/25",
    images: {
      stamp: "https://blog-assets-asong.tos-cn-beijing.volces.com/life/train/stamp/jrw-kurashiki.jpg",
    },
    size: "square",
  },
  {
    id: "119",
    stationId: "maibara",
    date: "2026/05/25",
    images: {
      stamp: "https://blog-assets-asong.tos-cn-beijing.volces.com/life/train/stamp/jrw-maibara.jpg",
    },
    size: "square",
  },
  {
    id: "120",
    stationId: "maiko",
    date: "2026/05/25",
    images: {
      stamp: "https://blog-assets-asong.tos-cn-beijing.volces.com/life/train/stamp/jrw-maiko.jpg",
    },
    size: "square",
  },
  {
    id: "121",
    stationId: "okayama",
    date: "2026/05/25",
    images: {
      stamp: "https://blog-assets-asong.tos-cn-beijing.volces.com/life/train/stamp/jrw-okayama.jpg",
    },
    size: "square",
  },
  {
    id: "122",
    stationId: "sannomiya",
    date: "2026/05/25",
    images: {
      stamp: "https://blog-assets-asong.tos-cn-beijing.volces.com/life/train/stamp/jrw-sannomiya.jpg",
    },
    size: "square",
  },
  {
    id: "123",
    stationId: "shingu",
    date: "2026/05/25",
    images: {
      stamp: "https://blog-assets-asong.tos-cn-beijing.volces.com/life/train/stamp/jrw-shingu.jpg",
    },
    size: "square",
  },
  {
    id: "124",
    stationId: "suma",
    date: "2026/05/25",
    images: {
      stamp: "https://blog-assets-asong.tos-cn-beijing.volces.com/life/train/stamp/jrw-suma.jpg",
    },
    size: "square",
  },
  {
    id: "125",
    stationId: "takaoka",
    date: "2026/05/25",
    images: {
      stamp: "https://blog-assets-asong.tos-cn-beijing.volces.com/life/train/stamp/jrw-takaoka.jpg",
    },
    size: "square",
  },
  {
    id: "126",
    stationId: "tarumi",
    date: "2026/05/25",
    images: {
      stamp: "https://blog-assets-asong.tos-cn-beijing.volces.com/life/train/stamp/jrw-tarumi.jpg",
    },
    size: "square",
  },
  {
    id: "127",
    stationId: "temma",
    date: "2026/05/25",
    images: {
      stamp: "https://blog-assets-asong.tos-cn-beijing.volces.com/life/train/stamp/jrw-temma.jpg",
    },
    size: "square",
  },
  {
    id: "128",
    stationId: "tennoji",
    date: "2026/05/25",
    images: {
      stamp: "https://blog-assets-asong.tos-cn-beijing.volces.com/life/train/stamp/jrw-tennoji.jpg",
    },
    size: "square",
  },
  {
    id: "129",
    stationId: "tottori",
    date: "2026/05/25",
    images: {
      stamp: "https://blog-assets-asong.tos-cn-beijing.volces.com/life/train/stamp/jrw-tottori.jpg",
    },
    size: "square",
  },
  {
    id: "130",
    stationId: "toyama",
    date: "2026/05/25",
    images: {
      stamp: "https://blog-assets-asong.tos-cn-beijing.volces.com/life/train/stamp/jrw-toyama.jpg",
    },
    size: "square",
  },
  {
    id: "131",
    stationId: "tsuruga",
    date: "2026/05/25",
    images: {
      stamp: "https://blog-assets-asong.tos-cn-beijing.volces.com/life/train/stamp/jrw-tsuruga.jpg",
    },
    size: "square",
  },
  {
    id: "132",
    stationId: "wakayama",
    date: "2026/05/25",
    images: {
      stamp: "https://blog-assets-asong.tos-cn-beijing.volces.com/life/train/stamp/jrw-wakayama.jpg",
    },
    size: "square",
  },
  {
    id: "133",
    stationId: "yamashina",
    date: "2026/05/25",
    images: {
      stamp: "https://blog-assets-asong.tos-cn-beijing.volces.com/life/train/stamp/jrw-yamashina.jpg",
    },
    size: "square",
  },
  {
    id: "134",
    stationId: "kansai-airport",
    date: "2026/05/25",
    images: {
      stamp: "https://blog-assets-asong.tos-cn-beijing.volces.com/life/train/stamp/jrw-kansaiairport.jpg",
    },
    size: "square",
  },
  {
    id: "135",
    stationId: "kii-tanabe",
    date: "2026/05/25",
    images: {
      stamp: "https://blog-assets-asong.tos-cn-beijing.volces.com/life/train/stamp/jrw-kiitanabe.jpg",
    },
    size: "square",
  },
  {
    id: "136",
    stationId: "minami-kusatsu",
    date: "2026/05/25",
    images: {
      stamp: "https://blog-assets-asong.tos-cn-beijing.volces.com/life/train/stamp/jrw-minamikusatsu.jpg",
    },
    size: "square",
  },
  {
    id: "137",
    stationId: "rinku-town",
    date: "2026/05/25",
    images: {
      stamp: "https://blog-assets-asong.tos-cn-beijing.volces.com/life/train/stamp/jrw-rinkutown.jpg",
    },
    size: "square",
  },
  {
    id: "138",
    stationId: "shin-imamiya",
    date: "2026/05/25",
    images: {
      stamp: "https://blog-assets-asong.tos-cn-beijing.volces.com/life/train/stamp/jrw-shinimamiya.jpg",
    },
    size: "square",
  },
  {
    id: "139",
    stationId: "shin-takaoka",
    date: "2026/05/25",
    images: {
      stamp: "https://blog-assets-asong.tos-cn-beijing.volces.com/life/train/stamp/jrw-shintakaoka.jpg",
    },
    size: "square",
  },
  {
    id: "140",
    stationId: "suma-kaihin-koen",
    date: "2026/05/25",
    images: {
      stamp: "https://blog-assets-asong.tos-cn-beijing.volces.com/life/train/stamp/jrw-sumakaihinkoen.jpg",
    },
    size: "square",
  },
];

// ---------------------------------------------------------------------------
// 车站关系：用于展开卡片里的 SVG 可达线路动画
// ---------------------------------------------------------------------------

export const stationRoutes: StationRoute[] = [
  { fromStationId: "shin-osaka", toStationId: "kyoto", line: "東海道新幹線", duration: "約15分" },
  { fromStationId: "shin-osaka", toStationId: "nagoya", line: "東海道新幹線", duration: "約50分" },
  { fromStationId: "kyoto", toStationId: "shin-osaka", line: "東海道新幹線", duration: "約15分" },
  { fromStationId: "kyoto", toStationId: "nagoya", line: "東海道新幹線", duration: "約35分" },
  { fromStationId: "nagoya", toStationId: "kyoto", line: "東海道新幹線", duration: "約35分" },
  { fromStationId: "nagoya", toStationId: "shin-osaka", line: "東海道新幹線", duration: "約50分" },
  { fromStationId: "yokohama", toStationId: "nagoya", line: "東海道新幹線", duration: "約1時間30分" },
  { fromStationId: "kanazawa", toStationId: "nagoya", line: "特急・新幹線接続", duration: "約2時間30分" },
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
