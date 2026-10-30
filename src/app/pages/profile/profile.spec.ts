import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { vi } from 'vitest';
import { Profile } from './profile';
import { AuthService } from '../../services/auth.service';
import { InquiryService } from '../../services/inquiry.service';
import { DEMO_LANDLORD } from '../../services/rent-hub.service';

async function createComponent(): Promise<ComponentFixture<Profile>> {
  await TestBed.configureTestingModule({
    imports: [Profile],
    providers: [provideRouter([])],
  }).compileComponents();

  const fixture = TestBed.createComponent(Profile);
  fixture.detectChanges();
  await fixture.whenStable();

  return fixture;
}

describe('Profile', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('should show the demo landlord their sample listings', async () => {
    new AuthService().login(DEMO_LANDLORD.email, 'Landlord@123');

    const fixture = await createComponent();
    const page: HTMLElement = fixture.nativeElement;

    expect(fixture.componentInstance.myListings.length).toBe(6);
    expect(page.textContent).toContain(DEMO_LANDLORD.name);
  });

  it('should show inquiries received by the landlord', async () => {
    new AuthService().login(DEMO_LANDLORD.email, 'Landlord@123');
    new InquiryService().sendInquiry({
      apartmentId: 1,
      apartmentTitle: 'Modern Green Residence',
      ownerEmail: DEMO_LANDLORD.email,
      fromName: 'Demo Renter',
      fromEmail: 'renter@renthub.com',
      message: 'Is this apartment still available?',
    });

    const fixture = await createComponent();
    const tabs: HTMLButtonElement[] = Array.from(
      fixture.nativeElement.querySelectorAll('[role="tab"]')
    );
    tabs.find((tab) => tab.textContent?.includes('Inquiries Received'))?.click();
    await fixture.whenStable();

    expect(fixture.nativeElement.textContent).toContain(
      'Is this apartment still available?'
    );
  });

  it('should delete a listing after confirmation', async () => {
    new AuthService().login(DEMO_LANDLORD.email, 'Landlord@123');
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    const component = (await createComponent()).componentInstance;
    component.deleteListing(component.myListings[0]);

    expect(component.myListings.length).toBe(5);
  });

  it('should list a renter favourites', async () => {
    new AuthService().login('renter@renthub.com', 'Renter@123');
    localStorage.setItem('rentHubFavorites_renter@renthub.com', '[2, 3]');

    const component = (await createComponent()).componentInstance;

    expect(component.favourites.map((item) => item.id)).toEqual([2, 3]);
    expect(component.myListings.length).toBe(0);
  });
});
