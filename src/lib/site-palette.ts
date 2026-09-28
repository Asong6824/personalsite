/**
 * 站点扩展色板。
 *
 * 结构参考 Tailwind 的「色相家族 + 50–950 明度阶梯」，但颜色来自本站自己的
 * warm editorial 锚点，而不是 Tailwind 默认色值。这里是颜色原料层；页面主题、
 * 图表分类顺序和语义状态仍应通过更高层 token 选择，不直接依赖某个数字档位。
 */

export const SITE_COLOR_SHADES = [
  50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950,
] as const;

export type SiteColorShade = (typeof SITE_COLOR_SHADES)[number];
export type SiteColorScale = Record<SiteColorShade, string>;

/** 不参与 50–950 插值、但属于站点色板的固定画布与墨色。 */
export const SITE_FOUNDATION = {
  canvas: "#F0EEE7",
  ink: "#141413",
} as const;

export const SITE_CHROMATIC_NAMES = [
  "red",
  "orange",
  "amber",
  "yellow",
  "lime",
  "green",
  "emerald",
  "teal",
  "cyan",
  "sky",
  "blue",
  "indigo",
  "violet",
  "purple",
  "fuchsia",
  "pink",
  "rose",
] as const;

export type SiteChromaticName = (typeof SITE_CHROMATIC_NAMES)[number];

export const SITE_NEUTRAL_NAMES = [
  "slate",
  "gray",
  "zinc",
  "neutral",
  "stone",
] as const;

export type SiteNeutralName = (typeof SITE_NEUTRAL_NAMES)[number];

export const SITE_CHROMATIC_PALETTE: Record<
  SiteChromaticName,
  SiteColorScale
> = {
  red: {
    50: "#FBF3F2", 100: "#F6E7E6", 200: "#EDD6D4", 300: "#E3C4C0",
    400: "#D79F9A", 500: "#CC7973", 600: "#B36863", 700: "#8C504B",
    800: "#693C38", 900: "#4B2B29", 950: "#2E1A19",
  },
  orange: {
    50: "#FBF3F0", 100: "#F5E8E3", 200: "#EDD7CF", 300: "#E2C5BA",
    400: "#D7A18E", 500: "#CC7C5E", 600: "#B26B50", 700: "#8C523C",
    800: "#693D2D", 900: "#4B2C21", 950: "#2E1B14",
  },
  amber: {
    50: "#F9F4EF", 100: "#F2EAE2", 200: "#E7DACD", 300: "#DAC9B7",
    400: "#C9A988", 500: "#B98953", 600: "#A27646", 700: "#7E5B34",
    800: "#5F4427", 900: "#44311D", 950: "#291E12",
  },
  yellow: {
    50: "#F7F5F0", 100: "#EEEBE3", 200: "#E1DCCE", 300: "#D2CCB9",
    400: "#BBAF8C", 500: "#A5935B", 600: "#907F4D", 700: "#706239",
    800: "#544A2B", 900: "#3C3520", 950: "#242013",
  },
  lime: {
    50: "#F4F6F1", 100: "#E9ECE5", 200: "#DADFD2", 300: "#C8CFBF",
    400: "#A9B597", 500: "#8A9C6D", 600: "#7C8C62", 700: "#5C6947",
    800: "#454F35", 900: "#323826", 950: "#1E2217",
  },
  green: {
    50: "#F3F6F3", 100: "#E7EDE7", 200: "#D6DFD6", 300: "#C4D0C4",
    400: "#A0B7A0", 500: "#7B9F7C", 600: "#6A8A6B", 700: "#526B52",
    800: "#3D503D", 900: "#2C3A2C", 950: "#1B231B",
  },
  emerald: {
    50: "#F2F6F4", 100: "#E6EDEA", 200: "#D4E0DA", 300: "#C0D1CA",
    400: "#99B8A9", 500: "#70A08A", 600: "#608B78", 700: "#496C5C",
    800: "#375145", 900: "#283A32", 950: "#18231E",
  },
  teal: {
    50: "#F1F6F5", 100: "#E5EDEC", 200: "#D2E0DD", 300: "#BFD1CE",
    400: "#96B8B2", 500: "#6AA098", 600: "#5B8B84", 700: "#456C67",
    800: "#33514D", 900: "#253A37", 950: "#172321",
  },
  cyan: {
    50: "#F1F6F7", 100: "#E4EDEE", 200: "#D1E0E1", 300: "#BDD1D3",
    400: "#92B8BC", 500: "#629FA6", 600: "#548B91", 700: "#3F6C71",
    800: "#2F5155", 900: "#233A3D", 950: "#152325",
  },
  sky: {
    50: "#F1F6F8", 100: "#E4EDF1", 200: "#D1DFE5", 300: "#BCD0D8",
    400: "#91B6C5", 500: "#629DB5", 600: "#53899E", 700: "#3E6A7B",
    800: "#2F505C", 900: "#223942", 950: "#152328",
  },
  blue: {
    50: "#F2F5FA", 100: "#E6ECF3", 200: "#D4DDEA", 300: "#C0CEDE",
    400: "#9AB2D0", 500: "#759AC8", 600: "#6283AC", 700: "#4A6586",
    800: "#384C65", 900: "#283648", 950: "#19212C",
  },
  indigo: {
    50: "#F3F5FA", 100: "#E9EBF3", 200: "#D8DCE9", 300: "#C7CBDD",
    400: "#A5AECE", 500: "#8591C1", 600: "#737EA8", 700: "#586184",
    800: "#424963", 900: "#303447", 950: "#1D202B",
  },
  violet: {
    50: "#F5F4F9", 100: "#EBEAF1", 200: "#DCDBE7", 300: "#CBCADA",
    400: "#AEACC9", 500: "#928EBA", 600: "#7E7BA2", 700: "#625F7F",
    800: "#49475F", 900: "#353344", 950: "#201F29",
  },
  purple: {
    50: "#F6F4F9", 100: "#EDE9F1", 200: "#DFDAE6", 300: "#D0C8DA",
    400: "#B6A9C8", 500: "#9E89B8", 600: "#8976A1", 700: "#6B5B7E",
    800: "#50445E", 900: "#393143", 950: "#231E29",
  },
  fuchsia: {
    50: "#F8F3F8", 100: "#F0E8F0", 200: "#E4D8E4", 300: "#D6C6D6",
    400: "#C1A5C2", 500: "#AD83AF", 600: "#977199", 700: "#765777",
    800: "#58415A", 900: "#3F2F40", 950: "#261C27",
  },
  pink: {
    50: "#F9F3F6", 100: "#F2E8ED", 200: "#E8D7E0", 300: "#DBC5D0",
    400: "#CAA2B8", 500: "#BA7EA0", 600: "#A36D8B", 700: "#7F536C",
    800: "#603E51", 900: "#442D3A", 950: "#2A1B23",
  },
  rose: {
    50: "#FBF3F4", 100: "#F5E7E9", 200: "#ECD6D9", 300: "#E1C4C7",
    400: "#D4A0A6", 500: "#C87A86", 600: "#AF6974", 700: "#895059",
    800: "#673C43", 900: "#4A2B30", 950: "#2D1B1D",
  },
};

export const SITE_NEUTRAL_PALETTE: Record<SiteNeutralName, SiteColorScale> = {
  slate: {
    50: "#F5F7FA", 100: "#EBEFF3", 200: "#D3DDE9", 300: "#C1CCD9",
    400: "#9BA6B3", 500: "#707B8A", 600: "#4F5966", 700: "#363E48",
    800: "#222830", 900: "#13181D", 950: "#07090D",
  },
  gray: {
    50: "#F5F7F8", 100: "#ECEFF1", 200: "#D6DDE3", 300: "#C5CBD2",
    400: "#9FA5AD", 500: "#747B83", 600: "#525960", 700: "#383E43",
    800: "#24282C", 900: "#15171B", 950: "#08090B",
  },
  zinc: {
    50: "#F6F6F8", 100: "#EEEEF1", 200: "#DBDBE2", 300: "#C9CAD1",
    400: "#A4A4AB", 500: "#797981", 600: "#57575E", 700: "#3C3C42",
    800: "#27272B", 900: "#17171A", 950: "#09090B",
  },
  neutral: {
    50: "#F7F7F6", 100: "#EFEEED", 200: "#DCDCD9", 300: "#CBCAC8",
    400: "#A5A4A2", 500: "#7B7A78", 600: "#595856", 700: "#3E3D3B",
    800: "#282826", 900: "#171716", 950: "#090908",
  },
  stone: {
    50: "#F8F6F4", 100: "#F1EEE9", 200: "#E2DBCE", 300: "#D1CABC",
    400: "#ABA495", 500: "#82796A", 600: "#5E574A", 700: "#423C31",
    800: "#2C271E", 900: "#1A1710", 950: "#0B0905",
  },
};

/** 用户选定的六个原始颜色，以及它们在扩展色板中的固定位置。 */
export const SITE_PALETTE_ANCHORS = [
  { hex: "#CBCADA", family: "violet", shade: 300, label: "薰衣草灰" },
  { hex: "#7C8C62", family: "lime", shade: 600, label: "橄榄叶" },
  { hex: "#C0D1CA", family: "emerald", shade: 300, label: "薄荷灰" },
  { hex: "#E2DBCE", family: "stone", shade: 200, label: "米纸" },
  { hex: "#759AC8", family: "blue", shade: 500, label: "编辑蓝" },
  { hex: "#CC7C5E", family: "orange", shade: 500, label: "陶土橙" },
] as const;
