
import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

// Check whether the user is logged in before opening a protected page.
export const authGuard: CanActivateFn = () => {
  const router = inject(Router);

  if (inject(AuthService).isLoggedIn()) {
    // Allow access to the requested page.
    return true;
  }

  // Redirect logged-out users to the Login page.
  return router.createUrlTree(['/login']);
};
