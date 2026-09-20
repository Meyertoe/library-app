import { DOCUMENT } from '@angular/common';
import { inject, Injectable, signal } from '@angular/core';

type Theme = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly storageKey = 'library.theme';
  readonly theme = signal<Theme>('light');

  constructor() {
    try {
      if (localStorage.getItem(this.storageKey) === 'dark') this.theme.set('dark');
    } catch {
      // The app remains usable if the browser disallows local storage.
    }
    this.applyTheme();
  }

  toggle(): void {
    this.theme.update(theme => theme === 'light' ? 'dark' : 'light');
    this.applyTheme();
    try {
      localStorage.setItem(this.storageKey, this.theme());
    } catch {
      // The selected theme still works for the current page.
    }
  }

  private applyTheme(): void {
    this.document.documentElement.setAttribute('data-bs-theme', this.theme());
  }
}
