export interface Book {
  id: number;
  title: string;
  author: string;
  // Date-only ISO string (YYYY-MM-DD), matching .NET DateOnly.
  publicationDate: string;
}

export interface BookRequest {
  title: string;
  author: string;
  publicationDate: string;
}
