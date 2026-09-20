import { Component, inject, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize, Observable } from 'rxjs';
import { Quote, QuoteRequest } from '../../models/quote';
import { QuoteService } from '../../services/quote.service';

@Component({
  selector: 'app-quote-form',
  imports: [FormsModule, RouterLink],
  templateUrl: './quote-form.html',
  styleUrl: './quote-form.css'
})
export class QuoteForm implements OnInit {
  private readonly quoteService = inject(QuoteService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  quote: QuoteRequest = { text: '', author: '' };
  id: number | null = null;
  loading = false;
  submitting = false;
  loadError = '';
  saveError = '';

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id === null) return;
    this.id = Number(id);
    if (!Number.isInteger(this.id) || this.id <= 0 || this.id > 2147483647) {
      this.loadError = 'Citatet finns inte.';
      return;
    }
    this.loading = true;
    this.quoteService.getById(this.id).pipe(finalize(() => this.loading = false)).subscribe({
      next: quote => this.quote = {
        text: quote.text,
        author: quote.author
      },
      error: (error: HttpErrorResponse) => {
        this.loadError = error.status === 404
          ? 'Citatet finns inte.'
          : 'Det gick inte att hämta citatet. Gå tillbaka och försök igen.';
      }
    });
  }

  submit(form: NgForm): void {
    if (form.invalid || this.loading || this.submitting || this.loadError) return;
    this.submitting = true;
    this.saveError = '';
    const request: QuoteRequest = {
      text: this.quote.text.trim(),
      author: this.quote.author.trim()
    };
    const save: Observable<Quote | void> = this.id === null
      ? this.quoteService.create(request)
      : this.quoteService.update(this.id, request);
    save.pipe(finalize(() => this.submitting = false)).subscribe({
      next: () => void this.router.navigate(['/quotes']),
      error: (error: HttpErrorResponse) => {
        this.saveError = error.status === 404
          ? 'Citatet finns inte längre. Gå tillbaka till citatlistan.'
          : error.status === 400
            ? 'Kontrollera citat och författare.'
            : 'Det gick inte att spara citatet. Försök igen.';
      }
    });
  }
}
