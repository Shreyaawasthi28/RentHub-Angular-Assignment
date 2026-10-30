
import { TestBed } from '@angular/core/testing';
import { DEMO_LANDLORD, RentHubService } from './rent-hub.service';

describe('RentHubService', () => {
  let service: RentHubService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(RentHubService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return all apartments', () => {
    const apartments = service.getApartments();

    expect(apartments.length).toBe(6);
  });

  it('should find an apartment by ID', () => {
    const apartment = service.getApartmentById(1);

    expect(apartment?.title).toBe('Modern Green Residence');
  });

  it('should return undefined for an unknown ID', () => {
    expect(service.getApartmentById(999)).toBeUndefined();
  });

  it('should filter apartments by location', () => {
    const apartments = service.getApartmentsByLocation('Kanpur');

    expect(apartments.length).toBe(2);
    expect(
      apartments.every((apartment) =>
        apartment.location.includes('Kanpur')
      )
    ).toBe(true);
  });

  it('should return all apartments for an empty location', () => {
    expect(service.getApartmentsByLocation('').length).toBe(6);
  });

  it('should list posted listings first and let them replace a sample', () => {
    localStorage.setItem(
      'rentHubPosts',
      JSON.stringify([
        { id: 1, title: 'Edited Residence', location: 'Kanpur', rent: 13000 },
        { id: 99, title: 'New Listing', location: 'Agra', rent: 9000 },
        { id: 100, title: '', location: 'Invalid', rent: 0 },
      ])
    );

    const apartments = service.getApartments();

    expect(apartments.length).toBe(7);
    expect(apartments[0].title).toBe('Edited Residence');
    expect(apartments[1].title).toBe('New Listing');
  });

  it('should delete posted and sample listings', () => {
    localStorage.setItem(
      'rentHubPosts',
      JSON.stringify([{ id: 99, title: 'New Listing', location: 'Agra', rent: 9000 }])
    );

    service.deleteApartment(99);
    service.deleteApartment(2);

    expect(service.getApartmentById(99)).toBeUndefined();
    expect(service.getApartmentById(2)).toBeUndefined();
    expect(service.getApartments().length).toBe(5);
  });

  it('should find listings by owner', () => {
    expect(service.getApartmentsByOwner(DEMO_LANDLORD.email).length).toBe(6);
    expect(service.getApartmentsByOwner('nobody@example.com').length).toBe(0);
  });
});
