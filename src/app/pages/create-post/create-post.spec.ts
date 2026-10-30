
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  ActivatedRoute,
  Router,
  convertToParamMap,
  provideRouter,
} from '@angular/router';
import { vi } from 'vitest';
import { CreatePost } from './create-post';
import { AuthService } from '../../services/auth.service';

const OWNER_EMAIL = 'owner@example.com';
const POST_ID = 1700000000000;

function logIn(email: string): void {
  const auth = new AuthService();
  auth.register('Test User', email, 'password123');
  auth.login(email, 'password123');
}

function savePost(ownerEmail: string): void {
  localStorage.setItem(
    'rentHubPosts',
    JSON.stringify([
      {
        id: POST_ID,
        title: 'Owner Listing',
        location: 'Kanpur',
        rent: 10000,
        ownerEmail,
      },
    ])
  );
}

async function createComponent(
  id: string | null
): Promise<ComponentFixture<CreatePost>> {
  await TestBed.configureTestingModule({
    imports: [CreatePost],
    providers: [
      // Router provider for RouterLink and navigation.
      provideRouter([]),
      {
        provide: ActivatedRoute,
        useValue: {
          snapshot: { paramMap: convertToParamMap(id ? { id } : {}) },
        },
      },
    ],
  }).compileComponents();

  vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);

  const fixture = TestBed.createComponent(CreatePost);
  fixture.detectChanges();
  await fixture.whenStable();

  return fixture;
}

describe('CreatePost', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should create', async () => {
    const fixture = await createComponent(null);

    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should save the logged-in user as the owner of a new post', async () => {
    logIn(OWNER_EMAIL);
    const component = (await createComponent(null)).componentInstance;

    component.showPreview = true;
    component.submitPost();

    const [savedPost] = JSON.parse(localStorage.getItem('rentHubPosts') || '[]');
    expect(savedPost.ownerEmail).toBe(OWNER_EMAIL);
  });

  it('should let the owner edit their listing', async () => {
    savePost(OWNER_EMAIL);
    logIn(OWNER_EMAIL);

    const component = (await createComponent(String(POST_ID))).componentInstance;

    expect(component.isEditMode).toBe(true);
    expect(component.isBlocked).toBe(false);
    expect(component.property.title).toBe('Owner Listing');
  });

  it('should not open the preview until the wireframe fields are filled', async () => {
    logIn(OWNER_EMAIL);
    const component = (await createComponent(null)).componentInstance;

    Object.assign(component.property, {
      title: 'Spacious 2 BHK Apartment',
      location: '12 Mall Road, Kanpur',
      rent: 15000,
      bedrooms: 2,
      area: 900,
      description: 'A bright apartment close to the market and metro.',
      contactName: 'Owner',
      contactEmail: 'owner@example.com',
      contactPhone: '9876543210',
      furnished: 'Furnished',
      vegetarianPreference: 'No Preference',
    });

    component.previewPost();
    expect(component.showPreview).toBe(false);

    Object.assign(component.property, {
      type: 'Apartment',
      buildingName: 'Green Valley',
      sharedProperty: 'No',
      leaseType: 'Both',
      priceMode: 'Per Month',
    });

    component.previewPost();
    expect(component.showPreview).toBe(true);
  });

  it('should reject a description over 1400 characters', async () => {
    const component = (await createComponent(null)).componentInstance;

    component.property.description = 'a'.repeat(1401);
    component.previewPost();

    expect(component.showPreview).toBe(false);
  });

  it('should add photos by URL up to the limit and remove them', async () => {
    const component = (await createComponent(null)).componentInstance;

    for (let i = 0; i < 6; i++) {
      component.photoUrl = `https://example.com/photo-${i}.jpg`;
      component.addPhotoUrl();
    }

    expect(component.property.photos.length).toBe(5);
    expect(component.photoMessage).toContain('up to 5 photos');

    component.removePhoto(0);
    expect(component.property.photos[0]).toBe('https://example.com/photo-1.jpg');
  });

  it('should let the demo landlord edit a sample listing', async () => {
    new AuthService().login('landlord@renthub.com', 'Landlord@123');

    const component = (await createComponent('1')).componentInstance;

    expect(component.isEditMode).toBe(true);
    expect(component.property.title).toBe('Modern Green Residence');

    component.property.rent = 13000;
    component.showPreview = true;
    component.submitPost();

    const [saved] = JSON.parse(localStorage.getItem('rentHubPosts') || '[]');
    expect(saved.id).toBe(1);
    expect(saved.rent).toBe(13000);
    expect(saved.ownerEmail).toBe('landlord@renthub.com');
  });

  it('should block editing a listing posted by another user', async () => {
    savePost(OWNER_EMAIL);
    logIn('someone-else@example.com');

    const fixture = await createComponent(String(POST_ID));
    const component = fixture.componentInstance;

    expect(component.isEditMode).toBe(false);
    expect(component.isBlocked).toBe(true);
    expect(component.message).toBe('You can only edit listings that you posted.');
    expect(fixture.nativeElement.querySelector('form')).toBeNull();
  });
});
