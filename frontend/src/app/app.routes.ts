import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/book-list/book-list').then(module => module.BookList),
    canActivate: [authGuard],
    title: 'Böcker – Library App'
  },
  {
    path: 'books/new',
    loadComponent: () => import('./pages/book-form/book-form').then(module => module.BookForm),
    canActivate: [authGuard],
    title: 'Lägg till ny bok – Library App'
  },
  {
    path: 'books/:id/edit',
    loadComponent: () => import('./pages/book-form/book-form').then(module => module.BookForm),
    canActivate: [authGuard],
    title: 'Redigera bok – Library App'
  },
  {
    path: 'quotes',
    loadComponent: () => import('./pages/quote-list/quote-list').then(module => module.QuoteList),
    canActivate: [authGuard],
    title: 'Mina citat – Library App'
  },
  {
    path: 'quotes/new',
    loadComponent: () => import('./pages/quote-form/quote-form').then(module => module.QuoteForm),
    canActivate: [authGuard],
    title: 'Lägg till citat – Library App'
  },
  {
    path: 'quotes/:id/edit',
    loadComponent: () => import('./pages/quote-form/quote-form').then(module => module.QuoteForm),
    canActivate: [authGuard],
    title: 'Redigera citat – Library App'
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login').then(module => module.Login),
    title: 'Logga in – Library App'
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/register/register').then(module => module.Register),
    title: 'Registrera dig – Library App'
  },
  { path: '**', redirectTo: '' }
];
