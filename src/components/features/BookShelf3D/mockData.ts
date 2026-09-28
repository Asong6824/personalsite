import {
  bookshelfBooks,
  type BookshelfBook,
} from "@/data/bookshelf-books";

export type Book = BookshelfBook;

// Compatibility export for the unused experimental BookCard implementation.
export const MOCK_BOOKS = bookshelfBooks;
