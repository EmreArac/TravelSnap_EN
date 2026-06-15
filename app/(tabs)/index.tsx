import { ScreenHeader } from '@/components/ScreenHeader';
import { TripCard } from '@/components/TripCard';
import { useTrips } from '@/context/TripContext';
import { useRouter } from 'expo-router';
import { useCallback, useMemo } from 'react';
import { ActivityIndicator, FlatList, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

const CARD_HEIGHT = 280;

export default function HomeScreen() {
  const { trips, loading } = useTrips();
  const router = useRouter();

  const sortedTrips = useMemo(() => {
    return [...trips].sort((a, b) => b.rating - a.rating);
  }, [trips]);

  const handleTripPress = useCallback((id: string) => {
    router.push(`/trip/${id}`);
  }, [router]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0A1628' }}>
        <ActivityIndicator size="large" color="#61DAFB" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScreenHeader title="My Trips" />

      <FlatList
        data={sortedTrips}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        getItemLayout={(_, index) => ({
          length: CARD_HEIGHT,
          offset: CARD_HEIGHT * index,
          index,
        })}
        initialNumToRender={10}
        maxToRenderPerBatch={8}
        windowSize={5}
        removeClippedSubviews={Platform.OS === 'android'}
        renderItem={({ item }) => (
          <TripCard trip={item} onPress={handleTripPress} />
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>No trips yet. Add your first trip!</Text>
        }
      />

      <Pressable style={styles.fab} onPress={() => router.push('/add-trip')}>
        <Text style={styles.fabText}>+</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A1628',
  },
  list: {
    padding: 16,
    gap: 12,
  },
  empty: {
    color: '#8B95A5',
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#61DAFB',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  fabText: {
    fontSize: 28,
    color: '#0A1628',
    fontWeight: 'bold',
    lineHeight: 32,
  },
});