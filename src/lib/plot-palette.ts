// src/lib/plot-palette.ts
//
// 绘图配色只从站点扩展色板选色。图表代码消费这里的语义组合，不再维护第二套 Hex。

import {
  SITE_CHROMATIC_NAMES,
  SITE_CHROMATIC_PALETTE,
  SITE_FOUNDATION,
  SITE_NEUTRAL_PALETTE,
  type SiteChromaticName,
  type SiteColorScale,
} from "./site-palette";

export interface PlotNeutrals {
  canvas: string;
  card: string;
  border: string;
  ink: string;
  muted: string;
}

export const PLOT_NEUTRALS: PlotNeutrals = {
  canvas: SITE_FOUNDATION.canvas,
  card: SITE_NEUTRAL_PALETTE.stone[200],
  border: SITE_NEUTRAL_PALETTE.stone[300],
  ink: SITE_FOUNDATION.ink,
  muted: SITE_NEUTRAL_PALETTE.stone[600],
};

export interface PlotHue {
  /** 深色：文字、细线或高对比数据点。 */
  deep: string;
  /** 主色：图形填充与系列识别。 */
  main: string;
  /** 浅色：背景、区间或淡填充。 */
  soft: string;
}

export type PlotHueName = SiteChromaticName;

function createHue(scale: SiteColorScale): PlotHue {
  return {
    deep: scale[700],
    main: scale[500],
    soft: scale[200],
  };
}

/** 与站点色轮一一对应的 17 个图表色相。 */
export const PLOT_HUES = Object.fromEntries(
  SITE_CHROMATIC_NAMES.map((name) => [name, createHue(SITE_CHROMATIC_PALETTE[name])]),
) as Record<PlotHueName, PlotHue>;

/** 多系列图表的推荐取色顺序，优先拉开相邻系列的色相距离。 */
export const PLOT_CATEGORICAL: string[] = [
  SITE_CHROMATIC_PALETTE.blue[500],
  SITE_CHROMATIC_PALETTE.orange[500],
  SITE_CHROMATIC_PALETTE.lime[600],
  SITE_CHROMATIC_PALETTE.violet[600],
  SITE_CHROMATIC_PALETTE.teal[600],
  SITE_CHROMATIC_PALETTE.rose[600],
  SITE_CHROMATIC_PALETTE.amber[600],
  SITE_CHROMATIC_PALETTE.indigo[600],
  SITE_CHROMATIC_PALETTE.emerald[700],
  SITE_CHROMATIC_PALETTE.red[700],
  SITE_CHROMATIC_PALETTE.sky[700],
  SITE_CHROMATIC_PALETTE.fuchsia[700],
];

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

function createScale(scale: SiteColorScale): PlotScale {
  return [scale[100], scale[300], scale[500], scale[700], scale[900]];
}

/** 兼容原有图表键名；具体颜色统一映射到新色轮。 */
export const PLOT_SCALES: Record<PlotScaleName, PlotScale> = {
  terracotta: createScale(SITE_CHROMATIC_PALETTE.red),
  warmOrange: createScale(SITE_CHROMATIC_PALETTE.orange),
  mustard: createScale(SITE_CHROMATIC_PALETTE.amber),
  olive: createScale(SITE_CHROMATIC_PALETTE.lime),
  financeGreen: createScale(SITE_CHROMATIC_PALETTE.emerald),
  grayTeal: createScale(SITE_CHROMATIC_PALETTE.teal),
  blue: createScale(SITE_CHROMATIC_PALETTE.blue),
  slate: createScale(SITE_NEUTRAL_PALETTE.slate),
  grayPurple: createScale(SITE_CHROMATIC_PALETTE.violet),
  berry: createScale(SITE_CHROMATIC_PALETTE.rose),
  deepBrown: createScale(SITE_NEUTRAL_PALETTE.stone),
  deepSea: createScale(SITE_CHROMATIC_PALETTE.sky),
};

export interface PlotSemantic {
  success: string;
  danger: string;
  warning: string;
  info: string;
}

/** 金融涨跌沿用中国习惯：涨用 danger，跌用 success。 */
export const PLOT_SEMANTIC: PlotSemantic = {
  success: SITE_CHROMATIC_PALETTE.emerald[700],
  danger: SITE_CHROMATIC_PALETTE.red[700],
  warning: SITE_CHROMATIC_PALETTE.amber[700],
  info: SITE_CHROMATIC_PALETTE.blue[700],
};
