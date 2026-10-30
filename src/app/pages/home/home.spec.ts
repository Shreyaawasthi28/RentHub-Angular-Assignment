
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Home } from './home';
import { AuthService } from '../../services/auth.service';

describe('Home', () => {
  let component: Home;
  let fixture: ComponentFixture<Home>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Home],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Home);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should create the Home component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the apartment list', () => {
    expect(component.apartments.length).toBeGreaterThan(0);
  });

  it('should initialize pagination', () => {
    expect(component.currentPage).toBe(1);
    expect(component.totalPages).toBeGreaterThan(0);
  });

  it('should display featured apartments', () => {
    expect(component.featuredApartments.length).toBeGreaterThan(0);
  });

  it('should filter listings by a minimum and maximum rent', () => {
    component.searchApartments('', '10000', '20000');

    const rents = component.filteredApartments.map((item) => item.rent);

    expect(rents.length).toBe(3);
    expect(rents.every((rent) => rent >= 10000 && rent <= 20000)).toBe(true);
    expect(component.priceError).toBe('');
  });

  it('should treat empty rent boxes as no limit', () => {
    component.searchApartments('', '', '10000');
    expect(component.filteredApartments.every((item) => item.rent <= 10000)).toBe(true);

    component.searchApartments('', '20000', '');
    expect(component.filteredApartments.every((item) => item.rent >= 20000)).toBe(true);
  });

  it('should reject a minimum rent above the maximum and keep the results', () => {
    const before = component.filteredApartments;

    component.searchApartments('', '25000', '10000');

    expect(component.priceError).toBe(
      'Minimum rent cannot be more than maximum rent.'
    );
    expect(component.filteredApartments).toBe(before);
  });

  it('should reject a negative rent', () => {
    component.searchApartments('', '-1', '');

    expect(component.priceError).toBe('Rent cannot be negative.');
  });

  it('should only treat the poster as the owner of a listing', () => {
    const auth = TestBed.inject(AuthService);
    auth.register('Owner', 'owner@example.com', 'password123');
    auth.login('owner@example.com', 'password123');

    const listing = { ...component.apartments[0], ownerEmail: 'owner@example.com' };

    expect(component.isOwner(listing)).toBe(true);
    expect(component.isOwner({ ...listing, ownerEmail: 'other@example.com' })).toBe(false);
    expect(component.isOwner({ ...listing, ownerEmail: undefined })).toBe(false);
  });

  it('should rotate featured apartments with the carousel arrows', () => {
    const firstId = component.featuredApartments[0].id;

    component.nextFeatured();
    expect(component.featuredApartments[0].id).not.toBe(firstId);

    component.previousFeatured();
    expect(component.featuredApartments[0].id).toBe(firstId);
  });

  it('should wrap around when moving before the first featured apartment', () => {
    component.previousFeatured();

    const lastApartment =
      component.filteredApartments[component.filteredApartments.length - 1];

    expect(component.featuredApartments[0].id).toBe(lastApartment.id);
    expect(component.featuredApartments.length).toBe(3);
  });
});
