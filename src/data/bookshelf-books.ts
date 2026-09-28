import booksData from "@/content/books.json";

export interface ThreeBookOpenTarget {
  type: "three-book";
}

export interface SketchbookOpenTarget {
  type: "sketchbook";
  sketchbookId: string;
  initialSpreadId?: string;
}

export interface ArticleOpenTarget {
  type: "article";
  href: string;
}

export type BookshelfOpenTarget =
  | ThreeBookOpenTarget
  | SketchbookOpenTarget
  | ArticleOpenTarget;

export interface BookshelfBook {
  id: string;
  title: string;
  shortTitle: string;
  author: string;
  description: string;
  coverUrl: string;
  year: number;
  pageCount: number;
  href?: string;
  chapters?: readonly [string, string, string];
  open: BookshelfOpenTarget;
}

interface BookshelfBookSource extends Omit<BookshelfBook, "open" | "shortTitle"> {
  shortTitle?: string;
  open?: BookshelfOpenTarget;
}

function deriveShortTitle(title: string) {
  const shortened = title.split(/[（(]/, 1)[0]?.trim();
  return shortened || title;
}

function normalizeOpenTarget(book: BookshelfBookSource): BookshelfOpenTarget {
  if (book.open?.type === "sketchbook" && book.open.sketchbookId) {
    return book.open;
  }
  if (book.open?.type === "article" && book.open.href.startsWith("/blog/")) {
    return book.open;
  }
  if (book.open?.type === "three-book") {
    return book.open;
  }
  if (book.href?.startsWith("/blog/")) {
    return { type: "article", href: book.href };
  }
  return { type: "three-book" };
}

function normalizeBook(book: BookshelfBookSource): BookshelfBook {
  return {
    ...book,
    shortTitle: book.shortTitle?.trim() || deriveShortTitle(book.title),
    href: book.href?.startsWith("/blog/") ? book.href : undefined,
    open: normalizeOpenTarget(book),
  };
}

export function getBookshelfOpenHref(book: BookshelfBook) {
  if (book.open.type === "article") return book.open.href;
  if (book.open.type !== "sketchbook") return undefined;

  const pathname = `/blog/life/sketchbook/${encodeURIComponent(book.open.sketchbookId)}`;
  const searchParams = new URLSearchParams();
  if (book.open.initialSpreadId) {
    searchParams.set("spread", book.open.initialSpreadId);
  }
  searchParams.set("fromBook", book.id);
  return `${pathname}?${searchParams.toString()}`;
}

/**
 * Shared content model for every bookshelf presentation. Presentation-specific
 * geometry, palettes and animation settings belong to their renderers.
 */
export const bookshelfBooks: readonly BookshelfBook[] = Object.freeze(
  (booksData as BookshelfBookSource[]).map(normalizeBook),
);
