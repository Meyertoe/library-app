import { Component, inject, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { Quote } from '../../models/quote';
import { QuoteService } from '../../services/quote.service';

@Component({
  selector: 'app-quote-list',
  imports: [RouterLink],
  templateUrl: './quote-list.html',
  styleUrl: './quote-list.css'
})
export class QuoteList implements OnInit {
  private readonly quoteService = inject(QuoteService);
  quotes: Quote[] = [];
  loading = true;
  errorMessage = '';
  deleteError = '';
  deletingId: number | null = null;

  ngOnInit(): void { this.loadQuotes(); }

  loadQuotes(): void {
    this.loading = true;
    this.errorMessage = '';
    this.quoteService.getAll().pipe(finalize(() => this.loading = false)).subscribe({
      next: quotes => this.quotes = quotes,
      error: () => this.errorMessage = 'Det gick inte att hämta citaten. Försök igen.'
    });
  }

  deleteQuote(quote: Quote): void {
    if (this.deletingId !== null || !window.confirm('Vill du radera citatet?')) return;
    this.deletingId = quote.id;
    this.deleteError = '';
    this.quoteService.delete(quote.id).pipe(finalize(() => this.deletingId = null)).subscribe({
      next: () => this.quotes = this.quotes.filter(item => item.id !== quote.id),
      error: (error: HttpErrorResponse) => {
        this.deleteError = error.status === 404
          ? 'Citatet finns inte längre. Listan har uppdaterats.'
          : 'Det gick inte att radera citatet. Försök igen.';
        if (error.status === 404) this.loadQuotes();
      }
    });
  }
}
