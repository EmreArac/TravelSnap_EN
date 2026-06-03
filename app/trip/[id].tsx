// app/trip/[id].tsx
import { CountryCard } from '@/components/CountryCard';
import { ErrorView } from '@/components/ErrorView';
import RatingStars from '@/components/RatingStars';
import { UNSPLASH_ACCESS_KEY, UNSPLASH_BASE_URL } from '@/constants/api';
import { useTrips } from '@/context/TripContext';
import { useFavorites } from '@/hooks/useFavorites';
import { useFetch } from '@/hooks/useFetch';
import { UnsplashResponse } from '@/types/unsplash';
import { extractCountry } from '@/utils/destination';
import { Ionicons } from '@expo/vector-icons';
import { Link, Stack, useLocalSearchParams, useRouter } from 'expo-router';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

export default function TripDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { trips, deleteTrip } = useTrips();
  const router = useRouter();
  const { isFavorite, toggleFavorite, isLoading } = useFavorites();

  const trip = trips.find((t) => t.id === id);
  const favorite = trip ? isFavorite(trip.id) : false;

  const unsplashUrl = trip
    ? `${UNSPLASH_BASE_URL}/search/photos?query=${encodeURIComponent(trip.destination)}&per_page=1`
    : '';

  const { data: photoData, loading: photoLoading } = useFetch<UnsplashResponse>(
    unsplashUrl,
    trip
      ? { headers: { Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}` } }
      : undefined
  );

  if (!trip) {
    return (
      <View style={styles.container}>
        <ErrorView
          message="Trip not found."
          onRetry={() => router.back()}
          retryLabel="Go back"
        />
      </View>
    );
  }

  const heroUri = photoData?.results?.[0]?.urls?.regular ?? trip.imageUri;
  const photoCredit = photoData?.results?.[0]?.user?.name;
  const galleryCount = trip.galleryUris?.length ?? 0;

  const handleDelete = async () => {
    await deleteTrip(id);
    router.back();
  };

  const confirmDelete = () => {
    Alert.alert(
      'Delete Trip',
      'This action cannot be undone. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: handleDelete },
      ]
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: trip.title,
          headerStyle: { backgroundColor: '#0A1628' },
          headerTintColor: '#61DAFB',
          animation: 'slide_from_bottom',
          headerRight: () =>
            !isLoading ? (
              <Pressable onPress={() => toggleFavorite(trip.id)}>
                <Ionicons
                  name={favorite ? 'heart' : 'heart-outline'}
                  size={24}
                  color={favorite ? '#FF4D6D' : '#8B95A5'}
                />
              </Pressable>
            ) : null,
        }}
      />

      <ScrollView style={styles.container}>
        {/* Hero Photo */}
        <View style={styles.heroContainer}>
          {heroUri ? (
            <Image
              source={{ uri: heroUri }}
              style={styles.heroImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.placeholder}>
              <Ionicons name="image-outline" size={64} color="#4A6FA5" />
              <Text style={styles.placeholderText}>No photo</Text>
            </View>
          )}
          {photoLoading && (
            <ActivityIndicator
              style={styles.spinner}
              size="large"
              color="#61DAFB"
            />
          )}
        </View>

        {/* Unsplash Attribution */}
        {photoCredit && (
          <Text style={styles.attribution}>
            Photo by {photoCredit} on Unsplash
          </Text>
        )}

        {/* Country Card */}
        <CountryCard countryName={extractCountry(trip.destination)} />

        <View style={styles.content}>
          <Text style={styles.title}>{trip.title}</Text>

          <View style={styles.row}>
            <Ionicons name="location-outline" size={16} color="#8B95A5" />
            <Text style={styles.destination}>{trip.destination}</Text>
          </View>

          <View style={styles.row}>
            <Ionicons name="calendar-outline" size={14} color="#8B95A5" />
            <Text style={styles.date}>{trip.date}</Text>
          </View>

          <View style={styles.ratingRow}>
            <RatingStars rating={trip.rating} />
          </View>

          {/* Gallery button */}
          <Link href={{ pathname: '/trip/gallery/[id]', params: { id: trip.id } }} asChild>
            <Pressable style={styles.galleryBtn}>
              <Ionicons name="images-outline" size={20} color="#61DAFB" />
              <Text style={styles.galleryBtnText}>Gallery ({galleryCount})</Text>
            </Pressable>
          </Link>

          {/* Edit button */}
          <Link href={{ pathname: '/trip/edit/[id]', params: { id: trip.id } }} asChild>
            <Pressable style={styles.editButton}>
              <Ionicons name="create-outline" size={20} color="#0A1628" />
              <Text style={styles.editButtonText}>Edit trip</Text>
            </Pressable>
          </Link>

          {/* Delete button */}
          <Pressable style={styles.deleteButton} onPress={confirmDelete}>
            <Ionicons name="trash-outline" size={20} color="#FFFFFF" />
            <Text style={styles.deleteButtonText}>Delete trip</Text>
          </Pressable>

          {/* Back button */}
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Back to list</Text>
          </Pressable>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A1628',
  },
  heroContainer: {
    width: '100%',
    height: 250,
  },
  heroImage: {
    width: '100%',
    height: 250,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  placeholder: {
    width: '100%',
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1A2744',
  },
  placeholderText: {
    color: '#4A6FA5',
    marginTop: 8,
    fontSize: 16,
  },
  spinner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  attribution: {
    color: '#4A6FA5',
    fontSize: 11,
    textAlign: 'right',
    paddingHorizontal: 16,
    paddingTop: 4,
  },
  content: {
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  destination: {
    fontSize: 16,
    color: '#8B95A5',
  },
  date: {
    fontSize: 14,
    color: '#8B95A5',
  },
  ratingRow: {
    marginTop: 8,
    marginBottom: 16,
  },
  galleryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#1A2744',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  galleryBtnText: {
    color: '#61DAFB',
    fontSize: 16,
    fontWeight: 'bold',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#61DAFB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  editButtonText: {
    color: '#0A1628',
    fontWeight: 'bold',
    fontSize: 16,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#E94560',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  backButton: {
    backgroundColor: '#1A2744',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#61DAFB',
    fontWeight: 'bold',
    fontSize: 16,
  },
});