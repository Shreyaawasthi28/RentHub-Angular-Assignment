
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { Register } from './register';
import { vi } from 'vitest';
describe('Register', () => {
  let component: Register;
  let fixture: ComponentFixture<Register>;
  let router: Router;

  beforeEach(async () => {
    localStorage.clear();

    await TestBed.configureTestingModule({
      imports: [Register],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Register);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);

    // Mock navigation in tests.
    vi.spyOn(router, 'navigate').mockResolvedValue(true);

    fixture.detectChanges();
    await fixture.whenStable();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should create the Register component', () => {
    expect(component).toBeTruthy();
  });

  it('should show an error when fields are empty', () => {
    component.register();

    expect(component.message).toBe('Please fill in all fields.');
  });

  it('should reject passwords shorter than 6 characters', () => {
    component.name = 'Test User';
    component.email = 'test@example.com';
    component.password = '123';

    component.register();

    expect(component.message).toBe(
      'Password must be at least 6 characters.'
    );
  });

  it('should reject an already registered email', () => {
    localStorage.setItem(
      'rentHubUsers',
      JSON.stringify([
        {
          name: 'Existing User',
          email: 'test@example.com',
          password: 'password123',
        },
      ])
    );

    component.name = 'New User';
    component.email = 'TEST@example.com';
    component.password = 'password123';

    component.register();

    expect(component.message).toBe(
      'This email is already registered. Please login.'
    );
  });

  it('should save a new user with a normalized email', () => {
    component.name = '  Test User  ';
    component.email = ' TEST@example.com ';
    component.password = 'password123';

    component.register();

    const savedUser = JSON.parse(
      localStorage.getItem('rentHubUsers') || '[]'
    ).find((user: { email: string }) => user.email === 'test@example.com');

    expect(savedUser.name).toBe('Test User');
    expect(savedUser.email).toBe('test@example.com');
    expect(savedUser.password).toBe('password123');
  });

  it('should navigate to login after successful registration', () => {
    component.name = 'Test User';
    component.email = 'test@example.com';
    component.password = 'password123';

    component.register();

    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });
});
