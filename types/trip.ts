// types/trip.ts
export interface TripData {
  title: string;
  destination: string;
  date: string;
  rating: number;
  imageUri?: string;
  galleryUris?: string[];
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface Trip extends TripData {
  id: string;
}