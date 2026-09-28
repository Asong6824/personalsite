import type {
  SketchbookRendererController,
  SketchbookRendererOptions,
  TravelSketchbookPage,
} from "./types";

export function createSketchbookRenderer(
  host: HTMLElement,
  pages: readonly TravelSketchbookPage[],
  options?: SketchbookRendererOptions,
): SketchbookRendererController;
