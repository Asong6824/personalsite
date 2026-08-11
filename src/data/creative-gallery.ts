export interface CreativeGalleryItem {
  id: string;
  src: string;
  title: string;
  eyebrow: string;
  alt: string;
  surfaces: readonly CreativeGallerySurface[];
  featured?: boolean;
}

export type CreativeGallerySurface = "home" | "creative";

/**
 * Shared Creative-stage material used by both the homepage ring and the
 * Creative channel. Keeping the list here prevents the two experiences from
 * drifting as new work is added.
 */
export const CREATIVE_GALLERY_ITEMS: readonly CreativeGalleryItem[] = [
  {
    id: "coding",
    src: "/home-experience/stages/create/cr-coding.png",
    title: "Coding",
    eyebrow: "Build · Break · Learn",
    alt: "关于编程工作流的手绘创意海报",
    surfaces: ["home"],
  },
  {
    id: "gsap",
    src: "/home-experience/stages/create/cr-gsap.png",
    title: "Motion with GSAP",
    eyebrow: "Motion study",
    alt: "GSAP 动效研究创意海报",
    surfaces: ["home"],
  },
  {
    id: "data",
    src: "/home-experience/stages/create/cr-data.png",
    title: "Data Visualization",
    eyebrow: "Observe · Understand",
    alt: "数据可视化主题手绘海报",
    surfaces: ["home"],
  },
  {
    id: "kos",
    src: "/home-experience/stages/create/cr-kos.png",
    title: "KOS Framework",
    eyebrow: "Knowledge · Action",
    alt: "KOS 知识行动框架海报",
    surfaces: ["home"],
  },
  {
    id: "3d-print",
    src: "/home-experience/stages/create/cr-3d-print.png",
    title: "3D Printing",
    eyebrow: "Form by layer",
    alt: "展示支撑结构与逐层制造的 3D 打印海报",
    surfaces: ["home", "creative"],
    featured: true,
  },
  {
    id: "map",
    src: "/home-experience/stages/create/cr-map.png",
    title: "Map Stories",
    eyebrow: "Spatial notes",
    alt: "地图与空间叙事创意海报",
    surfaces: ["home"],
  },
  {
    id: "ekistamp",
    src: "/home-experience/stages/create/cr-ekistamp.png",
    title: "Eki Stamp",
    eyebrow: "Collected traces",
    alt: "日本车站印章收藏创意海报",
    surfaces: ["home"],
  },
  {
    id: "coffee",
    src: "/home-experience/stages/create/cr-coffee.png",
    title: "Coffee Notes",
    eyebrow: "Daily ritual",
    alt: "咖啡与日常仪式创意海报",
    surfaces: ["home"],
  },
] as const;

export function getCreativeGalleryItems(surface: CreativeGallerySurface) {
  return CREATIVE_GALLERY_ITEMS.filter((item) => item.surfaces.includes(surface));
}
