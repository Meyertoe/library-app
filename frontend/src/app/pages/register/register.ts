import { Component, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  imports: [FormsModule, RouterLink],
  templateUrl: './register.html'
})
export class Register {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  username = '';
  password = '';
  submitting = false;
  errorMessage = '';

  submit(form: NgForm): void {
    if (form.invalid || this.submitting) return;
    this.submitting = true;
    this.errorMessage = '';
    this.auth.register({ username: this.username, password: this.password })
      .pipe(finalize(() => this.submitting = false))
      .subscribe({
        next: () => void this.router.navigate(['/login'], { queryParams: { registered: true } }),
        error: (error: HttpErrorResponse) => {
          this.errorMessage = error.status === 409
            ? 'Användarnamnet är redan upptaget.'
            : error.status === 400
              ? 'Kontrollera användarnamnet och att lösenordet innehåller 8–128 tecken.'
              : 'Det gick inte att skapa kontot. Försök igen om en stund.';
        }
      });
  }
}
