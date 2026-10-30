import { Injectable, inject } from '@angular/core';
import { AuthService } from './auth.service';

// Favourites are saved per user under rentHubFavorites_<email>.
const FAVORITES_KEY_PREFIX = 'rentHubFavorites_';

@Injectable({
  providedIn: 'root',
})
export class FavoritesService {
  private readonly authService = inject(AuthService);

  getFavoriteIds(): number[] {
    const key = this.storageKey();

    if (!key) {
      return [];
    }

    try {
      const parsed: unknown = JSON.parse(localStorage.getItem(key) || '[]');

      return Array.isArray(parsed)
        ? parsed.map(Number).filter((id) => Number.isFinite(id))
        : [];
    } catch {
      return [];
    }
  }

  isFavorite(id: number): boolean {
    return this.getFavoriteIds().includes(id);
  }

  // Returns false when nobody is logged in, so the caller can ask the user to log in.
  toggleFavorite(id: number): boolean {
    const key = this.storageKey();

    if (!key) {
      return false;
    }

    const ids = this.getFavoriteIds();
    const updated = ids.includes(id)
      ? ids.filter((item) => item !== id)
      : [...ids, id];

    try {
      localStorage.setItem(key, JSON.stringify(updated));
    } catch (error) {
      console.error('Unable to save favourites:', error);
    }

    return true;
  }

  private storageKey(): string | null {
    const email = this.authService.currentUser()?.email;

    return email ? FAVORITES_KEY_PREFIX + email : null;
  }
}
