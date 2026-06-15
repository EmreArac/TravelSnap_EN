import { UNSPLASH_ACCESS_KEY, UNSPLASH_BASE_URL } from "@/constants/api";
import { useFetch } from "@/hooks/useFetch";
import { UnsplashResponse } from "@/types/unsplash";
import { Image } from "expo-image";
import { StyleSheet, Text, View } from "react-native";

interface DestinationCardProps {
  city: string;
}

export function DestinationCard({ city }: DestinationCardProps) {
  const { data, loading } = useFetch<UnsplashResponse>(
    `${UNSPLASH_BASE_URL}/search/photos?query=${encodeURIComponent(city)}&per_page=1`,
    {
      headers: {
        Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
      },
    }
  );

  if (loading) {
    return <View style={styles.skeleton} />;
  }

  if (!data?.results?.[0]) return null;

  const photo = data.results[0];

  return (
    <View style={styles.card}>
      <Image
        source={{ uri: photo.urls.regular }}
        style={styles.image}
        contentFit="cover"
        cachePolicy="memory-disk"
        transition={200}
      />
      <View style={styles.overlay}>
        <Text style={styles.cityName}>{city}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    width: "100%",
    aspectRatio: 16 / 9,
    borderRadius: 12,
    backgroundColor: "#2a2a2a",
  },
  card: {
    width: "100%",
    aspectRatio: 16 / 9,
    borderRadius: 12,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  overlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 12,
  },
  cityName: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
});