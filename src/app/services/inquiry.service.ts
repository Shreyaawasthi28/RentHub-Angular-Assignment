import { Injectable } from '@angular/core';

export interface Inquiry {
  id: number;
  apartmentId: number;
  apartmentTitle: string;
  // Landlord who receives the inquiry.
  ownerEmail: string;
  fromName: string;
  fromEmail: string;
  phone?: string;
  message: string;
  date: string;
}

const INQUIRIES_KEY = 'rentHubInquiries';

@Injectable({
  providedIn: 'root',
})
export class InquiryService {
  sendInquiry(inquiry: Omit<Inquiry, 'id' | 'date'>): boolean {
    const saved: Inquiry = {
      ...inquiry,
      id: Date.now(),
      date: new Date().toISOString(),
    };

    try {
      localStorage.setItem(
        INQUIRIES_KEY,
        JSON.stringify([saved, ...this.loadInquiries()])
      );
      return true;
    } catch {
      return false;
    }
  }

  getReceived(ownerEmail: string): Inquiry[] {
    return this.loadInquiries().filter((item) => item.ownerEmail === ownerEmail);
  }

  getSent(fromEmail: string): Inquiry[] {
    return this.loadInquiries().filter((item) => item.fromEmail === fromEmail);
  }

  private isInquiry(value: unknown): value is Inquiry {
    if (typeof value !== 'object' || value === null) {
      return false;
    }

    const item = value as Record<string, unknown>;

    return (
      typeof item['apartmentId'] === 'number' &&
      typeof item['ownerEmail'] === 'string' &&
      typeof item['fromEmail'] === 'string' &&
      typeof item['message'] === 'string' &&
      typeof item['date'] === 'string'
    );
  }

  private loadInquiries(): Inquiry[] {
    try {
      const parsed: unknown = JSON.parse(
        localStorage.getItem(INQUIRIES_KEY) || '[]'
      );

      return Array.isArray(parsed) ? parsed.filter(this.isInquiry) : [];
    } catch {
      return [];
    }
  }
}
