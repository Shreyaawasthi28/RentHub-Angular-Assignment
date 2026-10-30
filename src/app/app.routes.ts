
import { Routes } from '@angular/router';

import { Home } from './pages/home/home';
import { authGuard } from './guards/auth-guard';

// Home loads eagerly; other pages are lazy-loaded to keep the initial bundle small.
export const routes: Routes = [
  // Home page
  {
    path: '',
    component: Home,
    title: 'RentHub - Find your next home',
  },

  // Login and registration
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login').then((m) => m.Login),
    title: 'Login - RentHub',
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./pages/register/register').then((m) => m.Register),
    title: 'Register - RentHub',
  },

  // Apartment details
  {
    path: 'apartment/:id',
    loadComponent: () =>
      import('./pages/apartment-details/apartment-details').then(
        (m) => m.ApartmentDetails
      ),
    title: 'Apartment Details - RentHub',
  },

  // Create a new property (login required)
  {
    path: 'create-post',
    loadComponent: () =>
      import('./pages/create-post/create-post').then((m) => m.CreatePost),
    canActivate: [authGuard],
    title: 'Create Post - RentHub',
  },

  // Edit an existing property (login required)
  {
    path: 'edit-post/:id',
    loadComponent: () =>
      import('./pages/create-post/create-post').then((m) => m.CreatePost),
    canActivate: [authGuard],
    title: 'Edit Post - RentHub',
  },

  // User profile: listings, favourites and inquiries (login required)
  {
    path: 'profile',
    loadComponent: () =>
      import('./pages/profile/profile').then((m) => m.Profile),
    canActivate: [authGuard],
    title: 'My Profile - RentHub',
  },

  // Redirect unknown routes to Home
  {
    path: '**',
    redirectTo: '',
  },
];
