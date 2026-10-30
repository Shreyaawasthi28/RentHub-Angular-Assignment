import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import {
  AMENITIES,
  POSTS_KEY,
  PROPERTY_TYPES,
  RentHubService,
} from '../../services/rent-hub.service';

interface Property {
  type: string;
  buildingName: string;
  sharedProperty: string;
  title: string;
  location: string;
  rent: number | null;
  negotiable: boolean;
  priceMode: string;
  bedrooms: number | null;
  area: number | null;
  leaseType: string;
  description: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  furnished: string;
  vegetarianPreference: string;
  amenities: string[];
  photos: string[];
}

interface SavedProperty extends Partial<Property> {
  id: number;
  ownerEmail?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const MAX_PHOTOS = 5;
export const MAX_DESCRIPTION_LENGTH = 1400;
// Uploaded photos are resized so several fit in localStorage.
const MAX_PHOTO_DIMENSION = 1024;

@Component({
  selector: 'app-create-post',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './create-post.html',
  styleUrl: './create-post.css',
})
export class CreatePost implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly authService = inject(AuthService);
  private readonly rentHubService = inject(RentHubService);
  private readonly changeDetector = inject(ChangeDetectorRef);

  readonly propertyTypes = PROPERTY_TYPES;
  readonly availableAmenities = AMENITIES;
  readonly leaseTypes = ['Long term (6+ months)', 'Short term', 'Both'];
  readonly priceModes = ['Per Month', 'Utilities included in rent'];
  readonly maxPhotos = MAX_PHOTOS;
  readonly maxDescriptionLength = MAX_DESCRIPTION_LENGTH;

  message = '';
  photoMessage = '';
  photoUrl = '';
  showPreview = false;
  isEditMode = false;
  // True when the requested listing cannot be edited (missing or not owned).
  isBlocked = false;
  editingId: number | null = null;
  private editingOwnerEmail: string | undefined;

  property: Property = this.createEmptyProperty();

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');

    if (idParam !== null) {
      const id = Number(idParam);

      if (!Number.isFinite(id)) {
        this.message = 'Invalid property ID.';
        this.isBlocked = true;
        return;
      }

      this.loadPropertyForEditing(id);
    }
  }

  private createEmptyProperty(): Property {
    return {
      type: '',
      buildingName: '',
      sharedProperty: '',
      title: '',
      location: '',
      rent: null,
      negotiable: false,
      priceMode: '',
      bedrooms: null,
      area: null,
      leaseType: '',
      description: '',
      contactName: '',
      contactEmail: '',
      contactPhone: '',
      furnished: '',
      vegetarianPreference: '',
      amenities: [],
      photos: [],
    };
  }

  private isSavedProperty(value: unknown): value is SavedProperty {
    if (typeof value !== 'object' || value === null || !('id' in value)) {
      return false;
    }

    return Number.isFinite(Number(value.id));
  }

  private isOwnedByCurrentUser(ownerEmail: string | undefined): boolean {
    const currentEmail = this.authService.getCurrentUser()?.email;

    return !!currentEmail && ownerEmail === currentEmail;
  }

  // Posted listings and sample listings can both be edited by their owner.
  private loadPropertyForEditing(id: number): void {
    const listing = this.rentHubService.getApartmentById(id);

    if (!listing) {
      this.message = 'Property not found. You can return to Home.';
      this.isBlocked = true;
      return;
    }

    if (!this.isOwnedByCurrentUser(listing.ownerEmail)) {
      this.message = 'You can only edit listings that you posted.';
      this.isBlocked = true;
      return;
    }

    this.editingId = id;
    this.editingOwnerEmail = listing.ownerEmail;
    this.isEditMode = true;

    this.property = {
      type: listing.type,
      buildingName: listing.buildingName ?? '',
      sharedProperty: listing.sharedProperty ?? '',
      title: listing.title,
      location: listing.location,
      rent: listing.rent,
      negotiable: listing.negotiable ?? false,
      priceMode: listing.priceMode ?? '',
      bedrooms: listing.bedrooms,
      area: listing.area || null,
      leaseType: listing.leaseType ?? '',
      description: listing.description,
      contactName: listing.contactName ?? '',
      contactEmail: listing.contactEmail ?? '',
      contactPhone: listing.contactPhone ?? '',
      furnished: listing.furnished ?? '',
      vegetarianPreference: listing.vegetarianPreference ?? '',
      amenities: [...listing.amenities],
      photos: listing.photos?.length ? [...listing.photos] : [listing.image],
    };
  }

  toggleAmenity(amenity: string, checked: boolean): void {
    if (checked && !this.property.amenities.includes(amenity)) {
      this.property.amenities = [...this.property.amenities, amenity];
    } else if (!checked) {
      this.property.amenities = this.property.amenities.filter(
        (item) => item !== amenity
      );
    }
  }

  async onPhotosSelected(input: HTMLInputElement): Promise<void> {
    const files = Array.from(input.files ?? []);
    input.value = '';
    this.photoMessage = '';

    const space = MAX_PHOTOS - this.property.photos.length;

    if (files.length > space) {
      this.photoMessage = `You can add up to ${MAX_PHOTOS} photos.`;
    }

    for (const file of files.slice(0, Math.max(space, 0))) {
      if (!file.type.startsWith('image/')) {
        this.photoMessage = `${file.name} is not an image.`;
        continue;
      }

      try {
        const photo = await this.resizeImage(file);
        this.property.photos = [...this.property.photos, photo];
      } catch {
        this.photoMessage = `Unable to read ${file.name}.`;
      }
    }

    // File reading finishes outside Angular's event handling, so refresh the view.
    this.changeDetector.markForCheck();
  }

  addPhotoUrl(): void {
    const url = this.photoUrl.trim();
    this.photoMessage = '';

    if (!/^https?:\/\/\S+$/i.test(url)) {
      this.photoMessage = 'Please enter a valid image URL starting with http(s)://';
      return;
    }

    if (this.property.photos.length >= MAX_PHOTOS) {
      this.photoMessage = `You can add up to ${MAX_PHOTOS} photos.`;
      return;
    }

    this.property.photos = [...this.property.photos, url];
    this.photoUrl = '';
  }

  removePhoto(index: number): void {
    this.property.photos = this.property.photos.filter((_, i) => i !== index);
  }

  private resizeImage(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onerror = () => reject(reader.error);
      reader.onload = () => {
        const image = new Image();

        image.onerror = () => reject(new Error('Invalid image'));
        image.onload = () => {
          const scale = Math.min(
            1,
            MAX_PHOTO_DIMENSION / Math.max(image.width, image.height)
          );
          const canvas = document.createElement('canvas');
          canvas.width = Math.round(image.width * scale);
          canvas.height = Math.round(image.height * scale);
          canvas
            .getContext('2d')
            ?.drawImage(image, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/jpeg', 0.75));
        };
        image.src = String(reader.result);
      };

      reader.readAsDataURL(file);
    });
  }

  // Returns the first validation problem, or null when the form is valid.
  private validate(): string | null {
    const p = this.property;
    const text = (value: string, min: number) => value.trim().length >= min;

    if (
      !p.type ||
      !text(p.buildingName, 2) ||
      !p.sharedProperty ||
      !text(p.title, 5) ||
      !text(p.location, 3) ||
      !text(p.description, 20) ||
      p.description.trim().length > MAX_DESCRIPTION_LENGTH ||
      !text(p.contactName, 2) ||
      p.rent === null ||
      p.rent <= 0 ||
      !p.priceMode ||
      p.bedrooms === null ||
      p.bedrooms < 1 ||
      p.bedrooms > 20 ||
      p.area === null ||
      p.area <= 0 ||
      !p.leaseType ||
      !p.furnished ||
      !p.vegetarianPreference
    ) {
      return 'Please fill all required fields correctly.';
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.contactEmail.trim())) {
      return 'Please enter a valid email address.';
    }

    if (p.contactPhone.replace(/\D/g, '').length !== 10) {
      return 'Please enter a valid 10-digit phone number.';
    }

    return null;
  }

  previewPost(): void {
    const error = this.validate();

    this.message = error ?? '';
    this.showPreview = error === null;
  }

  editPost(): void {
    this.showPreview = false;
    this.message = '';
  }

  submitPost(): void {
    if (!this.showPreview) {
      this.message = 'Please preview your property before submitting.';
      return;
    }

    let savedPosts: SavedProperty[];

    try {
      const storedData = localStorage.getItem(POSTS_KEY);
      const parsed: unknown = storedData ? JSON.parse(storedData) : [];

      if (!Array.isArray(parsed)) {
        this.message = 'Saved property data is invalid.';
        return;
      }

      savedPosts = parsed.filter(this.isSavedProperty);
    } catch {
      this.message = 'Unable to read saved posts. Please try again.';
      return;
    }

    try {
      if (this.isEditMode && this.editingId !== null) {
        if (!this.isOwnedByCurrentUser(this.editingOwnerEmail)) {
          this.message = 'You can only edit listings that you posted.';
          return;
        }

        const updated: SavedProperty = {
          ...this.property,
          id: this.editingId,
          ownerEmail: this.editingOwnerEmail,
          updatedAt: new Date().toISOString(),
        };
        const index = savedPosts.findIndex(
          (post) => Number(post.id) === this.editingId
        );

        // Editing a sample listing saves it as a posted listing with the same ID.
        if (index === -1) {
          savedPosts = [updated, ...savedPosts];
        } else {
          savedPosts[index] = { ...savedPosts[index], ...updated };
        }

        localStorage.setItem(POSTS_KEY, JSON.stringify(savedPosts));
      } else {
        const newPost: SavedProperty = {
          ...this.property,
          id: Date.now(),
          ownerEmail: this.authService.getCurrentUser()?.email,
          createdAt: new Date().toISOString(),
        };

        localStorage.setItem(
          POSTS_KEY,
          JSON.stringify([newPost, ...savedPosts])
        );
      }

      this.router.navigate(['/']);
    } catch {
      this.message =
        'Unable to save the property. Your photos may be too large; try removing some.';
    }
  }

  resetForm(): void {
    if (this.isEditMode && this.editingId !== null) {
      this.loadPropertyForEditing(this.editingId);
    } else {
      this.property = this.createEmptyProperty();
    }

    this.showPreview = false;
    this.message = '';
    this.photoMessage = '';
  }
}
