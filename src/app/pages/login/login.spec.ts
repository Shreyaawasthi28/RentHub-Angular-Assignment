
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Login } from './login';

describe('Login', () => {
  let component: Login;
  let fixture: ComponentFixture<Login>;

  beforeEach(async () => {
    localStorage.clear();

    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Login);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should create the Login component', () => {
    expect(component).toBeTruthy();
  });

  it('should show an error for an unregistered email', () => {
    component.email = 'unknown@example.com';
    component.password = 'password123';

    component.login();

    expect(component.message).toBe(
      'Incorrect email or password. Please try again.'
    );
  });

  it('should show an error for incorrect credentials', () => {
    localStorage.setItem(
      'rentHubUsers',
      JSON.stringify([
        {
          name: 'Test User',
          email: 'user@example.com',
          password: 'password123',
        },
      ])
    );

    component.email = 'user@example.com';
    component.password = 'wrongpass';

    component.login();

    expect(component.message).toBe(
      'Incorrect email or password. Please try again.'
    );
  });

  it('should set login status for valid credentials', () => {
    localStorage.setItem(
      'rentHubUsers',
      JSON.stringify([
        {
          name: 'Test User',
          email: 'user@example.com',
          password: 'password123',
        },
      ])
    );

    component.email = ' USER@example.com ';
    component.password = 'password123';

    component.login();

    expect(localStorage.getItem('rentHubLoggedIn')).toBe('true');
    expect(
      JSON.parse(localStorage.getItem('rentHubUser') || '{}').password
    ).toBeUndefined();
  });
});
