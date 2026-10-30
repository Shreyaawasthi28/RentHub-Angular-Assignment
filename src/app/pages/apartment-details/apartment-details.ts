
import { Component, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  ActivatedRoute,
  Router,
  RouterLink,
} from '@angular/router';
import { Subscription } from 'rxjs';

import {
  RentHubService,
  RentHubApartment,
} from '../../services/rent-hub.service';
import { AuthService } from '../../services/auth.service';
import { FavoritesService } from '../../services/favorites.service';
import { InquiryService } from '../../services/inquiry.service';

interface ApartmentComment {
  name: string;
  message: string;
  date: string;
  replies?: ApartmentComment[];
}

@Component({
  selector: 'app-apartment-details',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './apartment-details.html',
  styleUrl: './apartment-details.css',
})
export class ApartmentDetails implements OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly rentHubService = inject(RentHubService);
  private readonly authService = inject(AuthService);
  private readonly favoritesService = inject(FavoritesService);
  private readonly inquiryService = inject(InquiryService);

  apartmentId = 0;
  apartment: RentHubApartment | undefined;
  selectedPhoto = '';
  isFavorite = false;

  newComment = '';
  validationMessage = '';

  replyingTo: number | null = null;
  replyMessage = '';

  comments: ApartmentComment[] = [];

  inquiryMessage = '';
  inquiryPhone = '';
  inquiryStatus = '';
  inquirySent = false;

  private routeSubscription?: Subscription;

  constructor() {
    this.routeSubscription = this.route.paramMap.subscribe((params) => {
      this.apartmentId = Number(params.get('id'));
      this.loadApartment();
      this.loadComments();
    });
  }

  get isLoggedIn(): boolean {
    return this.authService.currentUser() !== null;
  }

  get photos(): string[] {
    if (!this.apartment) {
      return [];
    }

    return this.apartment.photos?.length
      ? this.apartment.photos
      : [this.apartment.image];
  }

  // Inquiries go to the listing owner, so owners cannot message themselves.
  get canSendInquiry(): boolean {
    const email = this.authService.currentUser()?.email;

    return (
      !!email &&
      !!this.apartment?.ownerEmail &&
      this.apartment.ownerEmail !== email
    );
  }

  ngOnDestroy(): void {
    this.routeSubscription?.unsubscribe();
  }

  private loadApartment(): void {
    this.apartment = this.rentHubService.getApartmentById(this.apartmentId);
    this.selectedPhoto = this.photos[0] ?? '';
    this.isFavorite = this.favoritesService.isFavorite(this.apartmentId);
    this.inquiryMessage = '';
    this.inquiryStatus = '';
    this.inquirySent = false;
  }

  toggleFavorite(): void {
    if (!this.favoritesService.toggleFavorite(this.apartmentId)) {
      this.goToLogin();
      return;
    }

    this.isFavorite = this.favoritesService.isFavorite(this.apartmentId);
  }

  sendInquiry(): void {
    const user = this.authService.currentUser();
    const message = this.inquiryMessage.trim();
    const phone = this.inquiryPhone.trim();

    if (!user || !this.apartment?.ownerEmail || !this.canSendInquiry) {
      this.inquiryStatus = 'Please log in to contact the landlord.';
      return;
    }

    if (message.length < 10 || message.length > 500) {
      this.inquiryStatus = 'Inquiry must contain 10 to 500 characters.';
      return;
    }

    if (phone && phone.replace(/\D/g, '').length !== 10) {
      this.inquiryStatus = 'Please enter a valid 10-digit phone number.';
      return;
    }

    const sent = this.inquiryService.sendInquiry({
      apartmentId: this.apartment.id,
      apartmentTitle: this.apartment.title,
      ownerEmail: this.apartment.ownerEmail,
      fromName: user.name,
      fromEmail: user.email,
      phone: phone || undefined,
      message,
    });

    if (sent) {
      this.inquirySent = true;
      this.inquiryMessage = '';
      this.inquiryPhone = '';
      this.inquiryStatus =
        'Inquiry sent. The landlord can see it on their Profile page.';
    } else {
      this.inquiryStatus = 'Unable to send the inquiry. Please try again.';
    }
  }

  loadComments(): void {
    const key = `rentHubComments_${this.apartmentId}`;

    try {
      const saved = localStorage.getItem(key);
      const parsed: unknown = saved ? JSON.parse(saved) : [];

      if (
        Array.isArray(parsed) &&
        parsed.every(
          (item: unknown) =>
            typeof item === 'object' &&
            item !== null &&
            'name' in item &&
            typeof item.name === 'string' &&
            'message' in item &&
            typeof item.message === 'string' &&
            'date' in item &&
            typeof item.date === 'string'
        )
      ) {
        this.comments = parsed as ApartmentComment[];
      } else {
        this.comments = [];
      }
    } catch {
      this.comments = [];
    }
  }

  private getLoggedInUserName(): string {
    return this.authService.currentUser()?.name || 'RentHub User';
  }

  addComment(): void {
    if (!this.isLoggedIn) {
      this.validationMessage = 'Please log in to add a comment.';
      return;
    }

    const message = this.newComment.trim();

    if (message.length < 2 || message.length > 500) {
      this.validationMessage =
        'Comment must contain 2 to 500 characters.';
      return;
    }

    const newItem: ApartmentComment = {
      name: this.getLoggedInUserName(),
      message,
      date: new Date().toISOString(),
      replies: [],
    };

    const updatedComments = [newItem, ...this.comments];
    const key = `rentHubComments_${this.apartmentId}`;

    try {
      localStorage.setItem(key, JSON.stringify(updatedComments));
      this.comments = updatedComments;
      this.newComment = '';
      this.validationMessage = 'Comment added successfully.';
    } catch {
      this.validationMessage =
        'Unable to save the comment. Please try again.';
    }
  }

  startReply(index: number): void {
    if (!this.isLoggedIn) {
      this.validationMessage = 'Please log in to reply.';
      return;
    }

    this.replyingTo = index;
    this.replyMessage = '';
    this.validationMessage = '';
  }

  cancelReply(): void {
    this.replyingTo = null;
    this.replyMessage = '';
    this.validationMessage = '';
  }

  addReply(index: number): void {
    if (!this.isLoggedIn) {
      this.validationMessage = 'Please log in to reply.';
      return;
    }

    const message = this.replyMessage.trim();

    if (message.length < 2 || message.length > 500) {
      this.validationMessage =
        'Reply must contain 2 to 500 characters.';
      return;
    }

    const reply: ApartmentComment = {
      name: this.getLoggedInUserName(),
      message,
      date: new Date().toISOString(),
    };

    const updatedComments = this.comments.map((comment, i) =>
      i === index
        ? {
            ...comment,
            replies: [...(comment.replies || []), reply],
          }
        : comment
    );

    try {
      localStorage.setItem(
        `rentHubComments_${this.apartmentId}`,
        JSON.stringify(updatedComments)
      );

      this.comments = updatedComments;
      this.cancelReply();
      this.validationMessage = 'Reply added successfully.';
    } catch {
      this.validationMessage =
        'Unable to save reply. Please try again.';
    }
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
