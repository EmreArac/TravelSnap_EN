// app/(tabs)/map.tsx
import { useTrips } from '@/context/TripContext';
import { useLocation } from '@/hooks/useLocation';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useRef } from 'react';
import { ActivityIndicator, Linking, Pressable, StyleSheet, Text, View } from 'react-native';

const DEFAULT_REGION = {
  latitude: 52.2297,
  longitude: 21.0122,
  latitudeDelta: 0.1,
  longitudeDelta: 0.1,
};

let MapView: any = null;
let Marker: any = null;
let Callout: any = null;
let PROVIDER_DEFAULT: any = null;

try {
  const maps = require('react-native-maps');
  MapView = maps.default;
  Marker = maps.Marker;
  Callout = maps.Callout;
  PROVIDER_DEFAULT = maps.PROVIDER_DEFAULT;
} catch (e) {
  // react-native-maps not available
}

export default function MapScreen() {
  const { location, error, loading } = useLocation();
  const { trips } = useTrips();
  const router = useRouter();
  const mapRef = useRef<any>(null);

  const tripsWithCoords = useMemo(
    () => trips.filter(t => t.coordinates),
    [trips]
  );

  useEffect(() => {
    if (!mapRef.current) return;
    const coords = tripsWithCoords.map(t => t.coordinates!);
    if (coords.length === 0) return;

    if (coords.length === 1) {
      mapRef.current.animateToRegion({
        ...coords[0],
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }, 1000);
      return;
    }

    mapRef.current.fitToCoordinates(coords, {
      edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
      animated: true,
    });
  }, [tripsWithCoords]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#61DAFB" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
        <Pressable style={styles.button} onPress={() => Linking.openSettings()}>
          <Text style={styles.buttonText}>Open Settings</Text>
        </Pressable>
      </View>
    );
  }

  if (!MapView) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Map is not available on this platform.</Text>
      </View>
    );
  }

  const initialRegion = location
    ? {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      }
    : DEFAULT_REGION;

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_DEFAULT}
        initialRegion={initialRegion}
      >
        {tripsWithCoords.map(trip => (
          <Marker
            key={trip.id}
            coordinate={trip.coordinates!}
            tracksViewChanges={false}
          >
            <View style={styles.customMarker}>
              <Image
                source={{ uri: trip.imageUri }}
                style={styles.markerImage}
                cachePolicy="memory-disk"
              />
            </View>
            <Callout onPress={() => router.push(`/trip/${trip.id}`)}>
              <View style={styles.calloutContainer}>
                <Image
                  source={{ uri: trip.imageUri }}
                  style={styles.calloutImage}
                  cachePolicy="memory-disk"
                />
                <View style={styles.calloutText}>
                  <Text style={styles.calloutTitle}>{trip.title}</Text>
                  <Text style={styles.calloutDestination}>{trip.destination}</Text>
                </View>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0A1628',
    gap: 16,
  },
  errorText: {
    color: '#8B95A5',
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  button: {
    backgroundColor: '#61DAFB',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#0A1628',
    fontWeight: 'bold',
    fontSize: 14,
  },
  customMarker: {
    borderWidth: 2,
    borderColor: '#61DAFB',
    borderRadius: 20,
    overflow: 'hidden',
  },
  markerImage: {
    width: 40,
    height: 40,
  },
  calloutContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    maxWidth: 200,
  },
  calloutImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  calloutText: {
    flex: 1,
  },
  calloutTitle: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#000',
  },
  calloutDestination: {
    fontSize: 12,
    color: '#555',
  },
});