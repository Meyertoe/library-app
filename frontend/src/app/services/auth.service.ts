import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';
import { AuthResponse, CurrentUser, LoginRequest, RegisterRequest } from '../models/auth';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly tokenKey = 'library.token';

  register(request: RegisterRequest) {
    return this.http.post<{ message: string }>('/api/auth/register', request);
  }

  login(request: LoginRequest) {
    return this.http.post<AuthResponse>('/api/auth/login', request).pipe(
      tap(response => localStorage.setItem(this.tokenKey, response.token))
    );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
  }

  getToken(): string | null {
    const token = localStorage.getItem(this.tokenKey);
    if (!token) return null;

    try {
      const parts = token.split('.');
      if (parts.length !== 3) throw new Error('Invalid token');
      const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const claims = JSON.parse(atob(payload));
      if (typeof claims.exp === 'number' && claims.exp * 1000 > Date.now()) {
        return token;
      }
    } catch {
      // Malformed or expired tokens are removed so the user can log in again.
    }
    this.logout();
    return null;
  }

  isLoggedIn(): boolean {
    // This is only a UI check. The API validates the JWT signature and claims.
    return this.getToken() !== null;
  }

  getUsername(): string | null {
    const token = this.getToken();
    if (!token) return null;
    const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const claims = JSON.parse(atob(payload));
    return typeof claims.username === 'string' ? claims.username : null;
  }

  getCurrentUser() {
    return this.http.get<CurrentUser>('/api/auth/me');
  }
}
