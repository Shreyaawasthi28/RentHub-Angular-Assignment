import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  AMENITIES,
  RentHubService,
  RentHubApartment,
} from '../../services/rent-hub.service';
import { AuthService } from '../../services/auth.service';
import { FavoritesService } from '../../services/favorites.service';

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  private readonly router = inject(Router);
  private readonly rentHubService = inject(RentHubService);
  private readonly authService = inject(AuthService);
  private readonly favoritesService = inject(FavoritesService);

  readonly pageSize = 3;
  currentPage = 1;
  sortBy = 'default';
  featuredIndex = 0;

  readonly availableAmenities = AMENITIES;

  selectedAmenities: string[] = [];
  apartments: RentHubApartment[] = [];
  filteredApartments: RentHubApartment[] = [];

  private searchLocation = '';
  private minRent = 0;
  private maxRent = Infinity;
  priceError = '';
  private favoriteIds = new Set<number>();

  // Featured properties follow the active filters and rotate with the carousel arrows.
  get featuredApartments(): RentHubApartment[] {
    const total = this.filteredApartments.length;
    const count = Math.min(3, total);

    return Array.from(
      { length: count },
      (_, offset) => this.filteredApartments[(this.featuredIndex + offset) % total]
    );
  }

  get paginatedApartments(): RentHubApartment[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;

    return this.filteredApartments.slice(
      startIndex,
      startIndex + this.pageSize
    );
  }

  get totalPages(): number {
    return Math.ceil(this.filteredApartments.length / this.pageSize);
  }

  get pageNumbers(): number[] {
    return Array.from(
      { length: this.totalPages },
      (_, index) => index + 1
    );
  }

  ngOnInit(): void {
    this.apartments = this.rentHubService.getApartments();
    this.favoriteIds = new Set(this.favoritesService.getFavoriteIds());
    this.applyFiltersAndSorting();
  }

  // Empty rent boxes mean "no limit". The search is skipped when the range is invalid.
  searchApartments(location = '', minRent = '', maxRent = ''): void {
    const min = minRent.trim() === '' ? 0 : Number(minRent);
    const max = maxRent.trim() === '' ? Infinity : Number(maxRent);

    if (Number.isNaN(min) || Number.isNaN(max) || min < 0 || max < 0) {
      this.priceError = 'Rent cannot be negative.';
      return;
    }

    if (min > max) {
      this.priceError = 'Minimum rent cannot be more than maximum rent.';
      return;
    }

    this.priceError = '';
    this.searchLocation = location.trim().toLowerCase();
    this.minRent = min;
    this.maxRent = max;

    this.applyFiltersAndSorting();
  }

  toggleAmenity(amenity: string, checked: boolean): void {
    if (checked && !this.selectedAmenities.includes(amenity)) {
      this.selectedAmenities = [...this.selectedAmenities, amenity];
    } else if (!checked) {
      this.selectedAmenities = this.selectedAmenities.filter(
        (item) => item !== amenity
      );
    }

    this.applyFiltersAndSorting();
  }

  clearAmenityFilters(): void {
    this.selectedAmenities = [];
    this.applyFiltersAndSorting();
  }

  clearSearch(): void {
    this.searchLocation = '';
    this.minRent = 0;
    this.maxRent = Infinity;
    this.priceError = '';
    this.selectedAmenities = [];
    this.applyFiltersAndSorting();
  }

  private applyFiltersAndSorting(): void {
    let results = this.apartments.filter((apartment) => {
      const location = apartment.location.toLowerCase();

      const matchesLocation = location.includes(this.searchLocation);
      const matchesPrice =
        apartment.rent >= this.minRent && apartment.rent <= this.maxRent;
      const matchesAmenities = this.selectedAmenities.every(
        (amenity) => apartment.amenities.includes(amenity)
      );

      return matchesLocation && matchesPrice && matchesAmenities;
    });

    if (this.sortBy === 'rentLow') {
      results = [...results].sort((a, b) => a.rent - b.rent);
    } else if (this.sortBy === 'rentHigh') {
      results = [...results].sort((a, b) => b.rent - a.rent);
    } else if (this.sortBy === 'title') {
      results = [...results].sort((a, b) =>
        a.title.localeCompare(b.title)
      );
    }

    this.filteredApartments = results;
    this.currentPage = 1;
    this.featuredIndex = 0;
  }

  onSortChange(value: string): void {
    this.sortBy = value;
    this.applyFiltersAndSorting();
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  nextFeatured(): void {
    if (this.filteredApartments.length > 0) {
      this.featuredIndex =
        (this.featuredIndex + 1) % this.filteredApartments.length;
    }
  }

  previousFeatured(): void {
    if (this.filteredApartments.length > 0) {
      this.featuredIndex =
        (this.featuredIndex - 1 + this.filteredApartments.length) %
        this.filteredApartments.length;
    }
  }

  // Favourites are saved per user, so logged-out users are sent to Login.
  toggleFavorite(id: number): void {
    if (!this.favoritesService.toggleFavorite(id)) {
      this.router.navigate(['/login']);
      return;
    }

    this.favoriteIds = new Set(this.favoritesService.getFavoriteIds());
  }

  isFavorite(id: number): boolean {
    return this.favoriteIds.has(id);
  }

  // Only the user who posted a listing may edit it.
  isOwner(apartment: RentHubApartment): boolean {
    const currentEmail = this.authService.currentUser()?.email;

    return !!currentEmail && apartment.ownerEmail === currentEmail;
  }

  viewDetails(id: number): void {
    this.router.navigate(['/apartment', id]);
  }

  editProperty(id: number): void {
    this.router.navigate(['/edit-post', id]);
  }
}
