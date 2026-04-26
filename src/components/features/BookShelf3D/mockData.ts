import booksData from '../../../content/books.json';

export interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  coverUrl: string;
  year: number;
  pageCount: number;
}

// Rename this to BOOKS if desired, but kept as MOCK_BOOKS to avoid breaking imports
export const MOCK_BOOKS: Book[] = booksData as Book[];

