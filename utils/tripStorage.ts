import AsyncStorage from '@react-native-async-storage/async-storage';
import { Trip } from '../types/trip';

const STORAGE_KEY = 'travelsnap_trips';

export async function saveTrips(trips: Trip[]): Promise<void> {
  try {
    const json = JSON.stringify(trips);
    await AsyncStorage.setItem(STORAGE_KEY, json);
  } catch (e) {
    console.error('Save failed:', e);
  }
}

export async function loadTrips(): Promise<Trip[]> {
  try {
    const json = await AsyncStorage.getItem(STORAGE_KEY);
    if (json !== null) {
      return JSON.parse(json) as Trip[];
    }
    return [];
  } catch (e) {
    console.error('Load failed:', e);
    return [];
  }
}