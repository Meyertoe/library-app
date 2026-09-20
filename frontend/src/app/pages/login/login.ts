import { Component, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink],
  templateUrl: './login.html'
})
export class Login {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  readonly registered = inject(ActivatedRoute).snapshot.queryParamMap.get('registered') === 'true';
  username = '';
  password = '';
  submitting = false;
  errorMessage = '';

  submit(form: NgForm): void {
    if (form.invalid || this.submitting) return;
    this.submitting = true;
    this.errorMessage = '';
    this.auth.login({ username: this.username.trim(), password: this.password })
      .pipe(finalize(() => this.submitting = false))
      .subscribe({
        next: () => void this.router.navigate(['/']),
        error: (error: HttpErrorResponse) => {
          this.errorMessage = error.status === 401
            ? 'Fel användarnamn eller lösenord.'
            : error.status === 400
              ? 'Kontrollera användarnamn och lösenord.'
              : 'Det gick inte att logga in. Försök igen om en stund.';
        }
      });
  }
}
