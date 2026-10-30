
import { Injectable } from '@angular/core';

export interface RentHubApartment {
  id: number;
  title: string;
  location: string;
  type: string;
  rent: number;
  bedrooms: number;
  area: number;
  description: string;
  image: string;
  amenities: string[];
  photos?: string[];
  buildingName?: string;
  sharedProperty?: string;
  leaseType?: string;
  negotiable?: boolean;
  priceMode?: string;
  furnished?: string;
  vegetarianPreference?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  // Email of the user who posted the listing.
  ownerEmail?: string;
}

// Amenities offered on the Create Post form and the Home filter.
export const AMENITIES = [
  'Gym/Fitness Center',
  'Swimming Pool',
  'Car Park',
  'Visitors Parking',
  'Power Backup',
  'Garbage Disposal',
  'Private Lawn',
  'Water Heater',
  'Security System',
  'Laundry Service',
  'Elevator',
  'Club House',
  'Wi-Fi',
  'Air Conditioning',
];

export const PROPERTY_TYPES = [
  'Apartment',
  'Independent House',
  'Villa',
  'Studio',
  'Building',
  'PG / Shared Room',
];

export const POSTS_KEY = 'rentHubPosts';
// IDs of sample listings their owner has deleted.
const DELETED_KEY = 'rentHubDeletedListings';

export const DEFAULT_IMAGE =
  'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1000&q=80';

// Owner of the sample listings (seeded by AuthService).
export const DEMO_LANDLORD = {
  name: 'Demo Landlord',
  email: 'landlord@renthub.com',
};

function optionalText(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function stringList(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string')
    : [];
}

const sampleContact = {
  contactName: DEMO_LANDLORD.name,
  contactEmail: DEMO_LANDLORD.email,
  ownerEmail: DEMO_LANDLORD.email,
  vegetarianPreference: 'No Preference',
  leaseType: 'Long term (6+ months)',
  priceMode: 'Per Month',
  sharedProperty: 'No',
};

@Injectable({
  providedIn: 'root',
})
export class RentHubService {
  private apartments: RentHubApartment[] = [
    {
      id: 1,
      title: 'Modern Green Residence',
      location: 'Kanpur, Uttar Pradesh',
      type: 'Apartment',
      rent: 12000,
      bedrooms: 2,
      area: 950,
      description: 'A spacious home with a modern interior and natural light.',
      image: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=800&q=80',
      amenities: ['Car Park', 'Wi-Fi', 'Security System', 'Elevator'],
      furnished: 'Semi-Furnished',
      ...sampleContact,
    },
    {
      id: 2,
      title: 'Luxury City Apartment',
      location: 'Lucknow, Uttar Pradesh',
      type: 'Apartment',
      rent: 22000,
      bedrooms: 3,
      area: 1400,
      description: 'Enjoy comfortable living in a stylish city apartment.',
      image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80',
      amenities: ['Wi-Fi', 'Air Conditioning', 'Gym/Fitness Center', 'Swimming Pool', 'Elevator'],
      furnished: 'Furnished',
      ...sampleContact,
      negotiable: true,
    },
    {
      id: 3,
      title: 'Cozy Family Home',
      location: 'Noida, Uttar Pradesh',
      type: 'Independent House',
      rent: 18000,
      bedrooms: 2,
      area: 1100,
      description: 'A comfortable family home with essential amenities.',
      image: 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=800&q=80',
      amenities: ['Car Park', 'Power Backup', 'Security System', 'Private Lawn'],
      furnished: 'Unfurnished',
      ...sampleContact,
      vegetarianPreference: 'Vegetarian Preferred',
    },
    {
      id: 4,
      title: 'Peaceful Studio Apartment',
      location: 'Kanpur, Uttar Pradesh',
      type: 'Studio',
      rent: 8000,
      bedrooms: 1,
      area: 500,
      description: 'A practical and affordable space for independent living.',
      image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80',
      amenities: ['Wi-Fi', 'Car Park', 'Water Heater'],
      furnished: 'Furnished',
      ...sampleContact,
      leaseType: 'Both',
    },
    {
      id: 5,
      title: 'Elegant Urban Living',
      location: 'Delhi, India',
      type: 'Villa',
      rent: 28000,
      bedrooms: 3,
      area: 1550,
      description: 'A stylish urban home with premium facilities.',
      image: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=800&q=80',
      amenities: ['Air Conditioning', 'Gym/Fitness Center', 'Swimming Pool', 'Security System', 'Club House'],
      furnished: 'Furnished',
      ...sampleContact,
    },
    {
      id: 6,
      title: 'Compact City Home',
      location: 'Lucknow, Uttar Pradesh',
      type: 'Apartment',
      rent: 10000,
      bedrooms: 1,
      area: 650,
      description: 'A compact, affordable home for comfortable city living.',
      image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80',
      amenities: ['Car Park', 'Power Backup', 'Elevator'],
      furnished: 'Semi-Furnished',
      ...sampleContact,
      sharedProperty: 'Yes',
    },
  ];

  // Posted listings first, then the sample listings they have not replaced.
  getApartments(): RentHubApartment[] {
    const posted = this.loadPostedApartments();
    const deleted = this.loadDeletedIds();
    const samples = this.apartments
      .filter((apartment) => !posted.some((post) => post.id === apartment.id))
      .map((apartment) => this.copy(apartment));

    return [...posted, ...samples].filter((item) => !deleted.includes(item.id));
  }

  // Removes a listing. Sample listings are remembered as deleted so they stay hidden.
  deleteApartment(id: number): void {
    try {
      const parsed: unknown = JSON.parse(localStorage.getItem(POSTS_KEY) || '[]');

      if (Array.isArray(parsed)) {
        localStorage.setItem(
          POSTS_KEY,
          JSON.stringify(
            parsed.filter(
              (post: unknown) =>
                !(typeof post === 'object' && post !== null && 'id' in post && Number(post.id) === id)
            )
          )
        );
      }
    } catch {
      // Ignore unreadable data; the listing is still hidden below.
    }

    if (this.apartments.some((apartment) => apartment.id === id)) {
      localStorage.setItem(
        DELETED_KEY,
        JSON.stringify([...new Set([...this.loadDeletedIds(), id])])
      );
    }
  }

  getApartmentById(id: number): RentHubApartment | undefined {
    return this.getApartments().find((item) => item.id === id);
  }

  getApartmentsByIds(ids: number[]): RentHubApartment[] {
    return this.getApartments().filter((item) => ids.includes(item.id));
  }

  getApartmentsByOwner(email: string): RentHubApartment[] {
    return this.getApartments().filter((item) => item.ownerEmail === email);
  }

  getApartmentsByLocation(location: string): RentHubApartment[] {
    const searchLocation = location.trim().toLowerCase();

    return this.getApartments().filter((apartment) =>
      apartment.location.toLowerCase().includes(searchLocation)
    );
  }

  private copy(apartment: RentHubApartment): RentHubApartment {
    return {
      ...apartment,
      amenities: [...apartment.amenities],
      photos: apartment.photos ? [...apartment.photos] : undefined,
    };
  }

  private loadDeletedIds(): number[] {
    try {
      const parsed: unknown = JSON.parse(localStorage.getItem(DELETED_KEY) || '[]');

      return Array.isArray(parsed) ? parsed.map(Number) : [];
    } catch {
      return [];
    }
  }

  // Read listings posted through the Create Post form, skipping invalid entries.
  private loadPostedApartments(): RentHubApartment[] {
    let parsed: unknown;

    try {
      parsed = JSON.parse(localStorage.getItem(POSTS_KEY) || '[]');
    } catch {
      return [];
    }

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.flatMap((post: unknown): RentHubApartment[] => {
      if (typeof post !== 'object' || post === null) {
        return [];
      }

      const item = post as Record<string, unknown>;
      const id = Number(item['id']);
      const rent = Number(item['rent']);
      const title = optionalText(item['title']);
      const location = optionalText(item['location']);

      if (!Number.isFinite(id) || !title || !location || !(rent > 0)) {
        return [];
      }

      const photos = stringList(item['photos']);
      const image =
        photos[0] ||
        optionalText(item['image']) ||
        optionalText(item['imageUrl']) ||
        DEFAULT_IMAGE;

      return [
        {
          id,
          title,
          location,
          type: optionalText(item['type']) || 'Apartment',
          rent,
          bedrooms: Number(item['bedrooms']) || 1,
          area: Number(item['area']) || 0,
          description:
            optionalText(item['description']) || 'No description provided.',
          image,
          photos: photos.length ? photos : [image],
          amenities: stringList(item['amenities']),
          buildingName: optionalText(item['buildingName']),
          sharedProperty: optionalText(item['sharedProperty']),
          leaseType: optionalText(item['leaseType']),
          negotiable: item['negotiable'] === true,
          priceMode: optionalText(item['priceMode']),
          furnished: optionalText(item['furnished']),
          vegetarianPreference: optionalText(item['vegetarianPreference']),
          contactName: optionalText(item['contactName']),
          contactEmail: optionalText(item['contactEmail']),
          contactPhone: optionalText(item['contactPhone']),
          ownerEmail: optionalText(item['ownerEmail']),
        },
      ];
    });
  }
}
