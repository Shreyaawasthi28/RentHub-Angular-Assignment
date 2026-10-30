
import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree, provideRouter } from '@angular/router';
import { authGuard } from './auth-guard';

describe('authGuard', () => {
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([])],
    });

    router = TestBed.inject(Router);
    localStorage.removeItem('rentHubLoggedIn');
  });

  it('should allow access when the user is logged in', () => {
    localStorage.setItem('rentHubLoggedIn', 'true');

    const result = TestBed.runInInjectionContext(() =>
      authGuard(
        {} as ActivatedRouteSnapshot,
        {} as RouterStateSnapshot
      )
    );

    expect(result).toBe(true);
  });

  it('should redirect to login when the user is logged out', () => {
    localStorage.removeItem('rentHubLoggedIn');

    const result = TestBed.runInInjectionContext(() =>
      authGuard(
        {} as ActivatedRouteSnapshot,
        {} as RouterStateSnapshot
      )
    ) as UrlTree;

    expect(result).toBeInstanceOf(UrlTree);
    expect(router.serializeUrl(result)).toBe('/login');
  });
});
