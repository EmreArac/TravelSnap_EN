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

export function TripProvider({ children }: { children: ReactNode }) {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTrips().then((saved) => {
      setTrips(saved);
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