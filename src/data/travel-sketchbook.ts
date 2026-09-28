import type {
  TravelSketchbookCopy,
  TravelSketchbookPage,
  TravelSketchbookVolume,
} from "@/components/features/LifeSketchbook/types";

const ASSET_BASE = "/life/sketchbook/meng-to-sketchbook";

/**
 * Temporary upstream spreads. Replace each entry with a personal travel
 * spread while keeping the 1760×1240 transparent-canvas contract.
 * Add `href` when the spread has a corresponding published article.
 */
const singaporeSketchbookPages: readonly TravelSketchbookPage[] = [
  {
    id: "marina-bay-sands",
    title: "Marina Bay Sands",
    place: "Bayfront",
    image: `${ASSET_BASE}/marina-bay-sands.png`,
    alt: "Marina Bay Sands watercolor travel sketch",
  },
  {
    id: "gardens-by-the-bay",
    title: "Gardens by the Bay",
    place: "Supertree Grove",
    image: `${ASSET_BASE}/gardens-by-the-bay.png`,
    alt: "Gardens by the Bay watercolor travel sketch",
  },
  {
    id: "merlion",
    title: "The Merlion",
    place: "Merlion Park",
    image: `${ASSET_BASE}/merlion.png`,
    alt: "The Merlion watercolor travel sketch",
  },
  {
    id: "buddha-tooth",
    title: "Buddha Tooth Relic Temple",
    place: "Chinatown",
    image: `${ASSET_BASE}/buddha-tooth.png`,
    alt: "Buddha Tooth Relic Temple watercolor travel sketch",
  },
  {
    id: "joo-chiat",
    title: "Joo Chiat Shophouses",
    place: "Katong",
    image: `${ASSET_BASE}/joo-chiat.png`,
    alt: "Joo Chiat shophouses watercolor travel sketch",
  },
  {
    id: "lau-pa-sat",
    title: "Lau Pa Sat",
    place: "Raffles Quay",
    image: `${ASSET_BASE}/lau-pa-sat.png`,
    alt: "Lau Pa Sat watercolor travel sketch",
  },
  {
    id: "marina-bay-skyline",
    title: "Marina Bay Skyline",
    place: "The Bay",
    image: `${ASSET_BASE}/marina-bay-skyline.png`,
    alt: "Marina Bay skyline watercolor travel sketch",
  },
  {
    id: "singapore-river",
    title: "Singapore River",
    place: "Boat Quay",
    image: `${ASSET_BASE}/singapore-river.png`,
    alt: "Singapore River watercolor travel sketch",
  },
  {
    id: "botanic-gardens",
    title: "Botanic Gardens",
    place: "Tanglin",
    image: `${ASSET_BASE}/botanic-gardens.png`,
    alt: "Singapore Botanic Gardens watercolor travel sketch",
  },
];

const singaporeSketchbookCopy: TravelSketchbookCopy = {
  title: "大盈若冲",
  kicker: "Travel notes / watercolor memories",
  aboutLabel: "关于这本手绘本",
  about:
    "这里收集旅途中值得慢慢回看的片段。每一个跨页是一处地方、一段时间，也可以连接到一篇更完整的旅行记录。",
  indexLabel: "旅行目录",
  footer: "大盈若冲 · 旅行手绘本",
};

export const travelSketchbookVolumes: readonly TravelSketchbookVolume[] = [
  {
    id: "singapore",
    title: "新加坡旅行手绘本",
    description: "以水彩跨页记录滨海湾、牛车水、如切与新加坡河沿途的旅行片段。",
    coverImage: `${ASSET_BASE}/marina-bay-skyline.png`,
    defaultPageId: "marina-bay-skyline",
    pages: singaporeSketchbookPages,
    copy: singaporeSketchbookCopy,
  },
];

export const defaultTravelSketchbookVolume = travelSketchbookVolumes[0];

export function getTravelSketchbookVolume(volumeId: string) {
  return travelSketchbookVolumes.find((volume) => volume.id === volumeId);
}

// Compatibility exports for callers that still render the default volume.
export const travelSketchbookPages = defaultTravelSketchbookVolume.pages;
export const travelSketchbookCopy = defaultTravelSketchbookVolume.copy;
