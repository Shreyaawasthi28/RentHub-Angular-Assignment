
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { App } from './app';
import { routes } from './app.routes';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter(routes)],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);

    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render the router outlet', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    const outlet = fixture.nativeElement.querySelector('router-outlet');

    expect(outlet).toBeTruthy();
  });

  it('should configure the home route', () => {
    expect(routes.some((route) => route.path === '')).toBe(true);
  });

  it('should configure the login route', () => {
    expect(routes.some((route) => route.path === 'login')).toBe(true);
  });

  it('should configure the registration route', () => {
    expect(routes.some((route) => route.path === 'register')).toBe(true);
  });

  it('should configure the apartment details route', () => {
    expect(routes.some((route) => route.path === 'apartment/:id')).toBe(true);
  });

  it('should protect the create-post route with auth guard', () => {
    const createPostRoute = routes.find(
      (route) => route.path === 'create-post'
    );

    expect(createPostRoute).toBeTruthy();
    expect(createPostRoute?.canActivate?.length).toBeGreaterThan(0);
  });

  it('should provide the Angular Router', () => {
    const router = TestBed.inject(Router);

    expect(router).toBeTruthy();
  });
});
