export interface TravelSketchbookPage {
  id: string;
  title: string;
  place: string;
  image: string;
  alt: string;
  date?: string;
  excerpt?: string;
  href?: string;
  mobileImage?: string;
}

export interface TravelSketchbookCopy {
  title: string;
  kicker: string;
  aboutLabel: string;
  about: string;
  indexLabel: string;
  footer: string;
}

export interface TravelSketchbookVolume {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  defaultPageId: string;
  pages: readonly TravelSketchbookPage[];
  copy: TravelSketchbookCopy;
}

export interface SketchbookRendererOptions {
  initialPageId?: string;
  onError?: (message: string) => void;
  onPageChange?: (page: TravelSketchbookPage, index: number) => void;
  onPageOpen?: (page: TravelSketchbookPage, index: number) => void;
  onReady?: () => void;
}

export interface SketchbookRendererController {
  dispose: () => void;
  goTo: (pageId: string) => void;
  next: () => void;
  openCurrent: () => void;
  previous: () => void;
  ready: Promise<void>;
}
