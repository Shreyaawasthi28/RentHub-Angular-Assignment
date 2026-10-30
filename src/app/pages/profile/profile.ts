import { Component, OnInit, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FavoritesService } from '../../services/favorites.service';
import { Inquiry, InquiryService } from '../../services/inquiry.service';
import {
  RentHubApartment,
  RentHubService,
} from '../../services/rent-hub.service';

export type ProfileTab = 'listings' | 'favourites' | 'received' | 'sent';

@Component({
  selector: 'app-profile',
  imports: [DatePipe, RouterLink],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly favoritesService = inject(FavoritesService);
  private readonly inquiryService = inject(InquiryService);
  private readonly rentHubService = inject(RentHubService);

  readonly currentUser = this.authService.currentUser;

  readonly tabs: { id: ProfileTab; label: string }[] = [
    { id: 'listings', label: 'My Listings' },
    { id: 'favourites', label: 'Favourites' },
    { id: 'received', label: 'Inquiries Received' },
    { id: 'sent', label: 'Inquiries Sent' },
  ];

  activeTab: ProfileTab = 'listings';
  myListings: RentHubApartment[] = [];
  favourites: RentHubApartment[] = [];
  receivedInquiries: Inquiry[] = [];
  sentInquiries: Inquiry[] = [];

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    const email = this.currentUser()?.email;

    if (!email) {
      return;
    }

    this.myListings = this.rentHubService.getApartmentsByOwner(email);
    this.favourites = this.rentHubService.getApartmentsByIds(
      this.favoritesService.getFavoriteIds()
    );
    this.receivedInquiries = this.inquiryService.getReceived(email);
    this.sentInquiries = this.inquiryService.getSent(email);
  }

  selectTab(tab: ProfileTab): void {
    this.activeTab = tab;
  }

  countFor(tab: ProfileTab): number {
    switch (tab) {
      case 'listings':
        return this.myListings.length;
      case 'favourites':
        return this.favourites.length;
      case 'received':
        return this.receivedInquiries.length;
      case 'sent':
        return this.sentInquiries.length;
    }
  }

  removeFavourite(id: number): void {
    this.favoritesService.toggleFavorite(id);
    this.loadData();
  }

  deleteListing(apartment: RentHubApartment): void {
    if (!confirm(`Delete "${apartment.title}"? This cannot be undone.`)) {
      return;
    }

    this.rentHubService.deleteApartment(apartment.id);
    this.loadData();
  }

  editListing(id: number): void {
    this.router.navigate(['/edit-post', id]);
  }
}
