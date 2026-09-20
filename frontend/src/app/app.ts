import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';

import { Navbar } from './components/navbar/navbar';
import { ThemeService } from './services/theme.service';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar],
  templateUrl: './app.html'
})
export class App {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  constructor() {
    // Initialize the saved global theme even on the public login/register pages.
    inject(ThemeService);
  }

  get showNavbar(): boolean {
    const path = this.router.url.split(/[?#]/)[0];
    return path !== '/login' && path !== '/register' && this.auth.isLoggedIn();
  }
}
