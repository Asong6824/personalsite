// src/lib/plot-palette.ts
//
// 绘图配色方案：与全站 warm editorial（暖色编辑纸张）风格一致的图表与数据可视化色板。
// 色相环分布、对比度分级与使用规则详见 docs/color-system.md「八、内容可视化与媒体」。
//
// 设计约束：
//   - 低饱和：所有色值 OKLCH 彩度 C ≤ 0.21，避免荧光/正色冲击纸张质感。
//   - 暖色温：冷色（蓝/紫）也带暖灰底，参照 Blue Bottle #0077A3。
//   - 对比度以 #F0EEE7 画布为基准：deep ≥ 4.5:1（文字/细线）、main ≥ 3:1（图形填充）、
//     soft < 3:1（仅背景/淡填充）。

import {
  SITE_WARM_BACKGROUND,
  SITE_WARM_INK,
  SITE_WARM_MUTED,
  SITE_WARM_SURFACE,
  SITE_WARM_SURFACE_HIGH,
} from "./site-theme";

/** 中性基底：图表画布、轴线与文字，复用站点核心暖色。 */
export interface PlotNeutrals {
  /** 画布背景 #F0EEE7 */
  canvas: string;
  /** 图例底、区块 #E2DBCE */
  card: string;
  /** 网格线、轴线 #D8D0C3 */
  border: string;
  /** 主文字、主轴、描边 #141413 */
  ink: string;
  /** 次文字、次网格 #68645d */
  muted: string;
}

export const PLOT_NEUTRALS: PlotNeutrals = {
  canvas: SITE_WARM_BACKGROUND,
  card: SITE_WARM_SURFACE,
  border: SITE_WARM_SURFACE_HIGH,
  ink: SITE_WARM_INK,
  muted: SITE_WARM_MUTED,
};

/** 单个色相的三档梯度。 */
export interface PlotHue {
  /** 深色：文字/细线，米底对比度 ≥ 4.5:1 */
  deep: string;
  /** 主色：图形填充，米底对比度 ≥ 3:1 */
  main: string;
  /** 备选主色（同色相第二色，可选） */
  alt?: string;
  /** 浅色：背景/淡填充，米底对比度 < 3:1（可选） */
  soft?: string;
}

export type PlotHueName =
  | "red"
  | "berry"
  | "orange"
  | "yellow"
  | "green"
  | "teal"
  | "blue"
  | "purple"
  | "brown";

/** 九色相色板。注释标「锚点」的色值复用站点既有频道/页面色。 */
export const PLOT_HUES: Record<PlotHueName, PlotHue> = {
  /** 红 · 暖陶土 */
  red: { deep: "#8C3B2E", main: "#B85C4A", soft: "#E0A898" },
  /** 红 · 冷莓果（品红，补红-紫空档） */
  berry: { deep: "#7E3B4F", main: "#A6506B" },
  /** 橙 · 信号橙（首页锚点）+ 暖橙 */
  orange: { deep: "#A3541F", main: "#FF5A1F", alt: "#D97A2B", soft: "#EEC39B" },
  /** 黄 · 芥末 + 金（金融锚点）；黄色只作填充，勿用于文字/细线 */
  yellow: { deep: "#7A5F1B", main: "#C9A227", alt: "#D4AF37", soft: "#EAD9A8" },
  /** 绿 · 橄榄 + 金融绿（金融锚点） */
  green: { deep: "#3A4A3C", main: "#708238", alt: "#506354", soft: "#A9B89A" },
  /** 青 · 灰青 */
  teal: { deep: "#2E5250", main: "#3E6E6B", soft: "#A8C2BD" },
  /** 蓝 · Blue Bottle（生活锚点）+ 蓝灰（首页锚点） */
  blue: { deep: "#0A4D68", main: "#0077A3", alt: "#5B6375", soft: "#9BB8C4" },
  /** 紫 · 创意紫（创意锚点）+ 灰紫 */
  purple: { deep: "#443A6B", main: "#776DFF", alt: "#6B5B95", soft: "#B7ADC9" },
  /** 棕 · 木色（创意作品卡锚点） */
  brown: { deep: "#6B4F3A", main: "#A18072", soft: "#C4A88A" },
};

/** 图表分类顺序色板：多系列折线/柱状/饼图按序取色；≤8 系列取前 8 色。 */
export const PLOT_CATEGORICAL: string[] = [
  "#B85C4A", // 陶土红
  "#D97A2B", // 暖橙
  "#C9A227", // 芥末黄
  "#708238", // 橄榄绿
  "#506354", // 金融绿
  "#3E6E6B", // 灰青
  "#0077A3", // Blue Bottle
  "#5B6375", // 蓝灰
  "#6B5B95", // 灰紫
  "#A6506B", // 莓果
  "#6B4F3A", // 深棕
  "#0A4D68", // 深海蓝
];

/** 五档色阶（浅 → 深，第 3 档为原色）：分类顺序色板每色的连续渐变。 */
export type PlotScale = [string, string, string, string, string];

export type PlotScaleName =
  | "terracotta"
  | "warmOrange"
  | "mustard"
  | "olive"
  | "financeGreen"
  | "grayTeal"
  | "blue"
  | "slate"
  | "grayPurple"
  | "berry"
  | "deepBrown"
  | "deepSea";

/** 用于热力图、面积图、渐变填充；键名对应 `PLOT_CATEGORICAL` 的取色顺序。 */
export const PLOT_SCALES: Record<PlotScaleName, PlotScale> = {
  terracotta: ["#EED0CA", "#D69B8E", "#B85C4A", "#883526", "#5A1B0F"], // 陶土红
  warmOrange: ["#FFE5D1", "#F5B990", "#D97A2B", "#A75100", "#783500"], // 暖橙
  mustard: ["#F5EBCF", "#F0D89B", "#C9A227", "#9B7700", "#725600"], // 芥末黄
  olive: ["#D3D9C5", "#A3B085", "#708238", "#4A590E", "#2C3700"], // 橄榄绿
  financeGreen: ["#B2B9B3", "#849086", "#506354", "#2C3D2F", "#111E14"], // 金融绿
  grayTeal: ["#B5C2C1", "#7E9A98", "#3E6E6B", "#184644", "#012624"], // 灰青
  blue: ["#B6CDDA", "#73A5C0", "#0077A3", "#004E75", "#002D4B"], // Blue Bottle
  slate: ["#BABDC6", "#8D929E", "#5B6375", "#363D4D", "#1A1F2B"], // 蓝灰
  grayPurple: ["#C2BED1", "#988FB4", "#6B5B95", "#443568", "#251940"], // 灰紫
  berry: ["#E0C4CA", "#C68E9D", "#A6506B", "#772A45", "#4C1027"], // 莓果
  deepBrown: ["#B6ADA6", "#928072", "#6B4F3A", "#432A18", "#210F03"], // 深棕
  deepSea: ["#90A0A8", "#587889", "#0A4D68", "#00283F", "#001527"], // 深海蓝
};

/** 语义标注色：绘图注释与状态表达。 */
export interface PlotSemantic {
  /** 成功（金融语境下可作「跌」） */
  success: string;
  /** 失败/危险（金融语境下可作「涨」） */
  danger: string;
  /** 警告 / 警示 */
  warning: string;
  /** 信息 / 中性 */
  info: string;
}

/** 金融涨跌沿用中国习惯：涨=#A64040、跌=#4F7A5C；如需西方习惯则对调。 */
export const PLOT_SEMANTIC: PlotSemantic = {
  success: "#4F7A5C",
  danger: "#A64040",
  warning: "#8A6D1F",
  info: "#3E6D8E",
};
