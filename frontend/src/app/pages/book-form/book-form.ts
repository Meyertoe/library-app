import { Component, inject, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize, Observable } from 'rxjs';
import { Book, BookRequest } from '../../models/book';
import { BookService } from '../../services/book.service';

@Component({
  selector: 'app-book-form',
  imports: [FormsModule, RouterLink],
  templateUrl: './book-form.html',
  styleUrl: './book-form.css'
})
export class BookForm implements OnInit {
  private readonly bookService = inject(BookService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  book: BookRequest = { title: '', author: '', publicationDate: '' };
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
      this.loadError = 'Boken finns inte.';
      return;
    }
    this.loading = true;
    this.bookService.getById(this.id).pipe(finalize(() => this.loading = false)).subscribe({
      next: book => this.book = {
        title: book.title,
        author: book.author,
        publicationDate: book.publicationDate
      },
      error: (error: HttpErrorResponse) => {
        this.loadError = error.status === 404
          ? 'Boken finns inte.'
          : 'Det gick inte att hämta boken. Gå tillbaka och försök igen.';
      }
    });
  }

  submit(form: NgForm): void {
    if (form.invalid || this.loading || this.submitting || this.loadError) return;
    this.submitting = true;
    this.saveError = '';
    const request: BookRequest = {
      title: this.book.title.trim(),
      author: this.book.author.trim(),
      publicationDate: this.book.publicationDate
    };
    const save: Observable<Book | void> = this.id === null
      ? this.bookService.create(request)
      : this.bookService.update(this.id, request);
    save.pipe(finalize(() => this.submitting = false)).subscribe({
      next: () => void this.router.navigate(['/']),
      error: (error: HttpErrorResponse) => {
        this.saveError = error.status === 404
          ? 'Boken finns inte längre. Gå tillbaka till boklistan.'
          : error.status === 400
            ? 'Kontrollera titel, författare och publiceringsdatum.'
            : 'Det gick inte att spara boken. Försök igen.';
      }
    });
  }
}
