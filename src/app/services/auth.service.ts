import { Injectable, signal } from '@angular/core';
import { DEMO_LANDLORD } from './rent-hub.service';

export interface RentHubUser {
  name: string;
  email: string;
}

interface RentHubAccount extends RentHubUser {
  password: string;
}

export type RegisterResult = 'success' | 'duplicate';
export type LoginResult = 'success' | 'invalid';

// Demo accounts created on first load so the app can be tried right away.
export const DEMO_ACCOUNTS: RentHubAccount[] = [
  { ...DEMO_LANDLORD, password: 'Landlord@123' },
  { name: 'Demo Renter', email: 'renter@renthub.com', password: 'Renter@123' },
];

// All registered accounts.
const USERS_KEY = 'rentHubUsers';
// The logged-in user (name and email only, no password).
const CURRENT_USER_KEY = 'rentHubUser';
const LOGGED_IN_KEY = 'rentHubLoggedIn';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly user = signal<RentHubUser | null>(null);

  // The logged-in user, or null when logged out.
  readonly currentUser = this.user.asReadonly();

  constructor() {
    this.migrateLegacyAccount();
    this.seedDemoAccounts();
    this.user.set(this.readCurrentUser());
  }

  register(name: string, email: string, password: string): RegisterResult {
    const accounts = this.loadAccounts();
    const cleanEmail = this.normalizeEmail(email);

    if (accounts.some((account) => account.email === cleanEmail)) {
      return 'duplicate';
    }

    accounts.push({ name: name.trim(), email: cleanEmail, password });
    this.saveAccounts(accounts);

    return 'success';
  }

  login(email: string, password: string): LoginResult {
    const cleanEmail = this.normalizeEmail(email);
    const account = this.loadAccounts().find(
      (item) => item.email === cleanEmail && item.password === password,
    );

    if (!account) {
      return 'invalid';
    }

    const user: RentHubUser = { name: account.name, email: account.email };
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    localStorage.setItem(LOGGED_IN_KEY, 'true');
    this.user.set(user);

    return 'success';
  }

  logout(): void {
    localStorage.removeItem(CURRENT_USER_KEY);
    localStorage.removeItem(LOGGED_IN_KEY);
    this.user.set(null);
  }

  isLoggedIn(): boolean {
    return localStorage.getItem(LOGGED_IN_KEY) === 'true';
  }

  getCurrentUser(): RentHubUser | null {
    return this.readCurrentUser();
  }

  private readCurrentUser(): RentHubUser | null {
    if (!this.isLoggedIn()) {
      return null;
    }

    try {
      const parsed: unknown = JSON.parse(localStorage.getItem(CURRENT_USER_KEY) || 'null');

      if (
        typeof parsed === 'object' &&
        parsed !== null &&
        'name' in parsed &&
        typeof parsed.name === 'string' &&
        'email' in parsed &&
        typeof parsed.email === 'string'
      ) {
        return { name: parsed.name, email: parsed.email };
      }
    } catch {
      // Invalid user data is treated as logged out.
    }

    return null;
  }

  private normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  private isAccount(value: unknown): value is RentHubAccount {
    return (
      typeof value === 'object' &&
      value !== null &&
      'name' in value &&
      typeof value.name === 'string' &&
      'email' in value &&
      typeof value.email === 'string' &&
      'password' in value &&
      typeof value.password === 'string'
    );
  }

  private loadAccounts(): RentHubAccount[] {
    try {
      const parsed: unknown = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');

      return Array.isArray(parsed) ? parsed.filter(this.isAccount) : [];
    } catch {
      return [];
    }
  }

  private saveAccounts(accounts: RentHubAccount[]): void {
    localStorage.setItem(USERS_KEY, JSON.stringify(accounts));
  }

  private seedDemoAccounts(): void {
    const accounts = this.loadAccounts();
    const missing = DEMO_ACCOUNTS.filter(
      (demo) => !accounts.some((account) => account.email === demo.email),
    );

    if (missing.length) {
      this.saveAccounts([...accounts, ...missing]);
    }
  }

  // Older versions stored a single account (with password) in rentHubUser.
  // Move it into the accounts list so existing users can still log in.
  private migrateLegacyAccount(): void {
    try {
      const parsed: unknown = JSON.parse(localStorage.getItem(CURRENT_USER_KEY) || 'null');

      if (!this.isAccount(parsed)) {
        return;
      }

      const accounts = this.loadAccounts();
      const email = this.normalizeEmail(parsed.email);

      if (!accounts.some((account) => account.email === email)) {
        accounts.push({ name: parsed.name, email, password: parsed.password });
        this.saveAccounts(accounts);
      }

      if (this.isLoggedIn()) {
        const user: RentHubUser = { name: parsed.name, email };
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(CURRENT_USER_KEY);
      }
    } catch {
      localStorage.removeItem(CURRENT_USER_KEY);
    }
  }
}
