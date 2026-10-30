import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { FavoritesService } from './favorites.service';

describe('FavoritesService', () => {
  let auth: AuthService;
  let service: FavoritesService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    auth = TestBed.inject(AuthService);
    service = TestBed.inject(FavoritesService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should refuse to save favourites when logged out', () => {
    expect(service.toggleFavorite(1)).toBe(false);
    expect(service.getFavoriteIds()).toEqual([]);
  });

  it('should add and remove a favourite', () => {
    auth.login('renter@renthub.com', 'Renter@123');

    service.toggleFavorite(1);
    expect(service.isFavorite(1)).toBe(true);

    service.toggleFavorite(1);
    expect(service.isFavorite(1)).toBe(false);
  });

  it('should keep favourites separate for each user', () => {
    auth.login('renter@renthub.com', 'Renter@123');
    service.toggleFavorite(2);

    auth.login('landlord@renthub.com', 'Landlord@123');

    expect(service.getFavoriteIds()).toEqual([]);
  });
});
