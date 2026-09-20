import { Component, inject, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { Book } from '../../models/book';
import { CurrentUser } from '../../models/auth';
import { BookService } from '../../services/book.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-book-list',
  imports: [RouterLink],
  templateUrl: './book-list.html',
  styleUrl: './book-list.css'
})
export class BookList implements OnInit {
  private readonly bookService = inject(BookService);
  private readonly auth = inject(AuthService);
  books: Book[] = [];
  user: CurrentUser | null = null;
  userError = '';
  loading = true;
  errorMessage = '';
  deleteError = '';
  deletingId: number | null = null;

  ngOnInit(): void {
    this.loadBooks();
    this.auth.getCurrentUser().subscribe({
      next: user => this.user = user,
      error: () => this.userError = 'Det gick inte att hämta användaren.'
    });
  }

  loadBooks(): void {
    this.loading = true;
    this.errorMessage = '';
    this.bookService.getAll().pipe(finalize(() => this.loading = false)).subscribe({
      next: books => this.books = books,
      error: () => this.errorMessage = 'Det gick inte att hämta böckerna. Försök igen.'
    });
  }

  deleteBook(book: Book): void {
    if (this.deletingId !== null || !window.confirm(`Vill du radera ”${book.title}”?`)) return;
    this.deletingId = book.id;
    this.deleteError = '';
    this.bookService.delete(book.id).pipe(finalize(() => this.deletingId = null)).subscribe({
      next: () => this.books = this.books.filter(item => item.id !== book.id),
      error: (error: HttpErrorResponse) => {
        this.deleteError = error.status === 404
          ? 'Boken finns inte längre. Listan har uppdaterats.'
          : 'Det gick inte att radera boken. Försök igen.';
        if (error.status === 404) this.loadBooks();
      }
    });
  }

}
