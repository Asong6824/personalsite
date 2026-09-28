import type { BookshelfBook } from "@/data/bookshelf-books";

export interface BookshelfSelection {
  id: string;
  index: number;
  total: number;
  title: string;
  author: string;
}

export interface BookshelfRendererCallbacks {
  initialBookId?: string;
  onReady?: () => void;
  onError?: (message: string) => void;
  onSelectionChange?: (selection: BookshelfSelection) => void;
  onModeChange?: (mode: "shelf" | "detail") => void;
  onOpenRequest?: (book: BookshelfBook, index: number) => void;
}

export interface BookshelfRendererController {
  ready: Promise<void>;
  resize: () => void;
  open: () => void;
  openSelected: () => void;
  close: () => void;
  previousVolume: () => void;
  nextVolume: () => void;
  selectBook: (bookId: string) => void;
  toggle: () => void;
  previousPage: () => void;
  nextPage: () => void;
  dispose: () => void;
}

export function createBookshelfRenderer(
  host: HTMLElement,
  canvas: HTMLCanvasElement,
  books: readonly BookshelfBook[],
  callbacks?: BookshelfRendererCallbacks,
): BookshelfRendererController;
