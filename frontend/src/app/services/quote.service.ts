import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Quote, QuoteRequest } from '../models/quote';

@Injectable({ providedIn: 'root' })
export class QuoteService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/quotes';

  getAll() { return this.http.get<Quote[]>(this.apiUrl); }
  getById(id: number) { return this.http.get<Quote>(`${this.apiUrl}/${id}`); }
  create(quote: QuoteRequest) { return this.http.post<Quote>(this.apiUrl, quote); }
  update(id: number, quote: QuoteRequest) { return this.http.put<void>(`${this.apiUrl}/${id}`, quote); }
  delete(id: number) { return this.http.delete<void>(`${this.apiUrl}/${id}`); }
}
