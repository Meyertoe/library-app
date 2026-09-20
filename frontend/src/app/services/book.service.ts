import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Book, BookRequest } from '../models/book';

@Injectable({ providedIn: 'root' })
export class BookService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/books';

  getAll() {
    return this.http.get<Book[]>(this.apiUrl);
  }

  getById(id: number) {
    return this.http.get<Book>(`${this.apiUrl}/${id}`);
  }

  create(book: BookRequest) {
    return this.http.post<Book>(this.apiUrl, book);
  }

  update(id: number, book: BookRequest) {
    return this.http.put<void>(`${this.apiUrl}/${id}`, book);
  }

  delete(id: number) {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
