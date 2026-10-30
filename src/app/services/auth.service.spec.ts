import { TestBed } from '@angular/core/testing';
import { AuthService, DEMO_ACCOUNTS } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should keep every registered account', () => {
    service.register('First User', 'first@example.com', 'password1');
    service.register('Second User', 'second@example.com', 'password2');

    expect(service.login('first@example.com', 'password1')).toBe('success');
    expect(service.login('second@example.com', 'password2')).toBe('success');
  });

  it('should reject a duplicate email regardless of case', () => {
    service.register('First User', 'user@example.com', 'password1');

    expect(
      service.register('Other User', ' USER@example.com ', 'password2')
    ).toBe('duplicate');
  });

  it('should seed demo accounts that can log in', () => {
    for (const demo of DEMO_ACCOUNTS) {
      expect(service.login(demo.email, demo.password)).toBe('success');
    }
  });

  it('should update the current user signal on login and logout', () => {
    service.register('First User', 'user@example.com', 'password1');

    service.login('user@example.com', 'password1');
    expect(service.currentUser()?.email).toBe('user@example.com');

    service.logout();
    expect(service.currentUser()).toBeNull();
  });

  it('should reject a wrong password', () => {
    service.register('First User', 'user@example.com', 'password1');

    expect(service.login('user@example.com', 'wrong-pass')).toBe('invalid');
    expect(service.isLoggedIn()).toBe(false);
  });

  it('should set and clear the current user on login and logout', () => {
    service.register('First User', 'user@example.com', 'password1');
    service.login('user@example.com', 'password1');

    expect(service.getCurrentUser()).toEqual({
      name: 'First User',
      email: 'user@example.com',
    });

    service.logout();

    expect(service.isLoggedIn()).toBe(false);
    expect(service.getCurrentUser()).toBeNull();
  });

  it('should migrate an account saved in the old single-user format', () => {
    localStorage.setItem(
      'rentHubUser',
      JSON.stringify({
        name: 'Old User',
        email: 'old@example.com',
        password: 'password1',
      })
    );

    const migrated = new AuthService();

    expect(localStorage.getItem('rentHubUser')).toBeNull();
    expect(migrated.login('old@example.com', 'password1')).toBe('success');
  });
});
