import { Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Route, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { appConfig } from './app.config';
import { routes } from './app.routes';
import { authGuard } from './guards/auth-guard';
import { AuthService } from './services/auth.service';
import { Login } from './pages/login/login';
import { Profile } from './pages/profile/profile';
import { CreatePost } from './pages/create-post/create-post';

// The app uses standalone components, so there is no NgModule. appConfig and
// the route table play that role; these tests check them together through the real router.
describe('App configuration (application module)', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: appConfig.providers });
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should register the application routes with the router', () => {
    const router = TestBed.inject(Router);

    expect(router.config.map((route) => route.path)).toEqual(
      routes.map((route) => route.path)
    );
  });

  it('should protect every page that needs a login', () => {
    const guarded = routes
      .filter((route) => route.canActivate?.includes(authGuard))
      .map((route) => route.path);

    expect(guarded).toEqual(['create-post', 'edit-post/:id', 'profile']);
  });

  it('should lazy-load a component for every non-home route', async () => {
    const lazyRoutes = routes.filter(
      (route): route is Route & { loadComponent: () => Promise<Type<unknown>> } =>
        typeof route.loadComponent === 'function'
    );

    expect(lazyRoutes.length).toBe(6);

    for (const route of lazyRoutes) {
      expect(await route.loadComponent()).toBeTruthy();
    }
  });

  it('should redirect a logged-out user from a protected page to Login', async () => {
    const harness = await RouterTestingHarness.create();

    await harness.navigateByUrl('/profile');

    expect(TestBed.inject(Router).url).toBe('/login');
    expect(harness.routeDebugElement?.componentInstance).toBeInstanceOf(Login);
  });

  it('should open protected pages after login', async () => {
    TestBed.inject(AuthService).login('renter@renthub.com', 'Renter@123');
    const harness = await RouterTestingHarness.create();

    expect(await harness.navigateByUrl('/profile', Profile)).toBeInstanceOf(Profile);
    expect(await harness.navigateByUrl('/create-post', CreatePost)).toBeInstanceOf(CreatePost);
  });

  it('should send unknown URLs to Home', async () => {
    const harness = await RouterTestingHarness.create();

    await harness.navigateByUrl('/does-not-exist');

    expect(TestBed.inject(Router).url).toBe('/');
  });
});
