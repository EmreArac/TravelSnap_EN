import { Trip, TripData } from '@/types/trip';
import { loadTrips, saveTrips } from '@/utils/tripStorage';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface TripContextType {
  trips: Trip[];
  loading: boolean;
  addTrip: (data: TripData) => Promise<void>;
  deleteTrip: (id: string) => Promise<void>;
  updateTrip: (id: string, data: Partial<TripData>) => Promise<void>;
}

const TripContext = createContext<TripContextType | null>(null);

const SEED_TRIPS: Trip[] = [
  {
    id: 'seed-1',
    title: 'Paris Trip',
    destination: 'Paris, France',
    date: '2024-06-01',
    rating: 5,
    imageUri: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400',
    coordinates: { latitude: 48.8566, longitude: 2.3522 },
  },
  {
    id: 'seed-2',
    title: 'Tokyo Adventure',
    destination: 'Tokyo, Japan',
    date: '2024-08-15',
    rating: 4,
    imageUri: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400',
    coordinates: { latitude: 35.6762, longitude: 139.6503 },
  },
  {
    id: 'seed-3',
    title: 'Rome Holiday',
    destination: 'Rome, Italy',
    date: '2024-09-20',
    rating: 5,
    imageUri: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=400',
    coordinates: { latitude: 41.9028, longitude: 12.4964 },
  },
];

export function TripProvider({ children }: { children: ReactNode }) {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTrips().then((saved) => {
      if (saved.length === 0) {
        setTrips(SEED_TRIPS);
        saveTrips(SEED_TRIPS);
      } else {
        setTrips(saved);
      }
      setLoading(false);
    });
  }, []);

  const addTrip = async (data: TripData) => {
    const newTrip: Trip = { ...data, id: Date.now().toString() };
    const updated = [...trips, newTrip];
    setTrips(updated);
    await saveTrips(updated);
  };

  const deleteTrip = async (id: string) => {
    const updated = trips.filter((t) => t.id !== id);
    setTrips(updated);
    await saveTrips(updated);
  };

  const updateTrip = async (id: string, data: Partial<TripData>) => {
    const updated = trips.map((t) => (t.id === id ? { ...t, ...data } : t));
    setTrips(updated);
    await saveTrips(updated);
  };

  return (
    <TripContext.Provider value={{ trips, loading, addTrip, deleteTrip, updateTrip }}>
      {children}
    </TripContext.Provider>
  );
}

export const useTrips = () => {
  const ctx = useContext(TripContext);
  if (!ctx) throw new Error('useTrips must be used inside TripProvider');
  return ctx;
};