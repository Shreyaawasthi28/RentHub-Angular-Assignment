
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  ActivatedRoute,
  convertToParamMap,
  provideRouter,
} from '@angular/router';
import { of } from 'rxjs';
import { ApartmentDetails } from './apartment-details';
import { AuthService } from '../../services/auth.service';
import { FavoritesService } from '../../services/favorites.service';
import { InquiryService } from '../../services/inquiry.service';
import { DEMO_LANDLORD } from '../../services/rent-hub.service';

const POST_ID = 1700000000000;

async function createComponent(
  id: number
): Promise<ComponentFixture<ApartmentDetails>> {
  await TestBed.configureTestingModule({
    imports: [ApartmentDetails],
    providers: [
      // Router provider for RouterLink dependencies.
      provideRouter([]),
      {
        provide: ActivatedRoute,
        useValue: { paramMap: of(convertToParamMap({ id: String(id) })) },
      },
    ],
  }).compileComponents();

  const fixture = TestBed.createComponent(ApartmentDetails);
  fixture.detectChanges();
  await fixture.whenStable();

  return fixture;
}

describe('ApartmentDetails', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should create', async () => {
    const fixture = await createComponent(1);

    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should show amenities and the demo landlord for a sample listing', async () => {
    const fixture = await createComponent(1);
    const page: HTMLElement = fixture.nativeElement;

    expect(page.querySelectorAll('.amenity-list li').length).toBe(4);
    expect(
      page.querySelector(`a[href="mailto:${DEMO_LANDLORD.email}"]`)
    ).toBeTruthy();
  });

  it('should ask logged-out users to log in before sending an inquiry', async () => {
    const fixture = await createComponent(1);

    expect(fixture.nativeElement.querySelector('#inquiryMessage')).toBeNull();
    expect(fixture.componentInstance.canSendInquiry).toBe(false);
  });

  it('should send an inquiry to the listing owner', async () => {
    new AuthService().login('renter@renthub.com', 'Renter@123');

    const fixture = await createComponent(1);
    const component = fixture.componentInstance;

    component.inquiryMessage = 'Is this apartment still available?';
    component.sendInquiry();

    const [received] = TestBed.inject(InquiryService).getReceived(
      DEMO_LANDLORD.email
    );

    expect(component.inquirySent).toBe(true);
    expect(received.fromEmail).toBe('renter@renthub.com');
    expect(received.apartmentId).toBe(1);
  });

  it('should not let owners send an inquiry to themselves', async () => {
    new AuthService().login(DEMO_LANDLORD.email, 'Landlord@123');

    const fixture = await createComponent(1);

    expect(fixture.componentInstance.canSendInquiry).toBe(false);
  });

  it('should toggle a favourite for a logged-in user', async () => {
    new AuthService().login('renter@renthub.com', 'Renter@123');

    const fixture = await createComponent(1);
    const component = fixture.componentInstance;

    component.toggleFavorite();

    expect(component.isFavorite).toBe(true);
    expect(TestBed.inject(FavoritesService).getFavoriteIds()).toEqual([1]);
  });

  it('should show features, amenities and contact details of a posted listing', async () => {
    localStorage.setItem(
      'rentHubPosts',
      JSON.stringify([
        {
          id: POST_ID,
          title: 'Posted Listing',
          location: 'Kanpur',
          rent: 15000,
          amenities: ['Gym', 'Lift'],
          furnished: 'Semi-Furnished',
          vegetarianPreference: 'No Preference',
          contactName: 'Asha Landlord',
          contactEmail: 'asha@example.com',
          contactPhone: '9876543210',
        },
      ])
    );

    const fixture = await createComponent(POST_ID);
    const page: HTMLElement = fixture.nativeElement;
    const text = page.textContent ?? '';

    expect(page.querySelectorAll('.amenity-list li').length).toBe(2);
    expect(text).toContain('Semi-Furnished');
    expect(text).toContain('No Preference');
    expect(text).toContain('Asha Landlord');
    expect(
      page.querySelector('a[href="mailto:asha@example.com"]')
    ).toBeTruthy();
    expect(page.querySelector('a[href="tel:9876543210"]')).toBeTruthy();
  });
});
