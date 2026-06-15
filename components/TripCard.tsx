// components/TripCard.tsx
import RatingStars from '@/components/RatingStars';
import { Colors } from '@/constants/Colors';
import type { Trip } from '@/types/trip';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export interface TripCardProps {
  trip: Trip;
  onPress: (id: string) => void;
}

export const TripCard = React.memo(function TripCard({ trip, onPress }: TripCardProps) {
  const { title, destination, date, rating, imageUri, galleryUris, id } = trip;

  return (
    <Pressable style={styles.card} onPress={() => onPress(id)}>
      {/* Fotoğraf */}
      {imageUri && (
        <Image
          source={{ uri: imageUri }}
          style={styles.cardImage}
          contentFit="cover"
          cachePolicy="memory-disk"
          transition={200}
        />
      )}

      {/* Gallery badge */}
      {galleryUris && galleryUris.length > 0 && (
        <View style={styles.badge}>
          <Ionicons name="images-outline" size={12} color="#FFFFFF" />
          <Text style={styles.badgeText}>{galleryUris.length}</Text>
        </View>
      )}

      <View style={styles.cardContent}>
        <View style={styles.header}>
          <Ionicons name="location" size={20} color={Colors.accent} />
          <View style={styles.headerText}>
            <Text style={styles.title} numberOfLines={1}>{title}</Text>
            <Text style={styles.destination}>{destination}</Text>
          </View>
        </View>

        <View style={styles.dateRow}>
          <Ionicons name="calendar" size={14} color={Colors.primary} />
          <Text style={styles.dateText}>{date}</Text>
        </View>

        <RatingStars rating={rating} />
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: 180,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  cardContent: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerText: {
    marginLeft: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  destination: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  dateText: {
    fontSize: 12,
    color: Colors.primary,
    marginLeft: 6,
  },
});