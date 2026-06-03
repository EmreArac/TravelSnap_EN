import { DestinationCard } from "@/components/DestinationCard";
import { FlatList, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const POPULAR = [
  "Tokyo",
  "Lisbon",
  "Reykjavik",
  "Bali",
  "Cape Town",
  "Kyoto",
  "Marrakech",
  "Patagonia",
];

export default function Explore() {
  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={POPULAR}
        keyExtractor={(city) => city}
        renderItem={({ item }) => <DestinationCard city={item} />}
        contentContainerStyle={styles.list}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  list: {
    padding: 16,
    gap: 16,
  },
});