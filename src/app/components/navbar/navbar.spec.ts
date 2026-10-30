import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { vi } from 'vitest';
import { Navbar } from './navbar';
import { AuthService } from '../../services/auth.service';

describe('Navbar', () => {
  let fixture: ComponentFixture<Navbar>;
  let auth: AuthService;

  beforeEach(async () => {
    localStorage.clear();

    await TestBed.configureTestingModule({
      imports: [Navbar],
      providers: [provideRouter([])],
    }).compileComponents();

    vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    auth = TestBed.inject(AuthService);
    fixture = TestBed.createComponent(Navbar);
    fixture.detectChanges();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should show Login and Register when logged out', () => {
    const text = fixture.nativeElement.textContent;

    expect(text).toContain('Login');
    expect(text).toContain('Register');
    expect(text).not.toContain('Profile');
  });

  it('should show Profile and the user name after login', () => {
    auth.login('renter@renthub.com', 'Renter@123');
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;

    expect(text).toContain('Profile');
    expect(text).toContain('Hi, Demo Renter');
  });

  it('should log out', () => {
    auth.login('renter@renthub.com', 'Renter@123');
    fixture.detectChanges();

    fixture.componentInstance.logout();
    fixture.detectChanges();

    expect(auth.currentUser()).toBeNull();
    expect(fixture.nativeElement.textContent).toContain('Login');
  });
});
