import { RESTCOUNTRIES_BASE_URL } from "@/constants/api";
import { useFetch } from "@/hooks/useFetch";
import { Country } from "@/types/country";
import { Image, StyleSheet, Text, View } from "react-native";

interface CountryCardProps {
  countryName: string;
}

export function CountryCard({ countryName }: CountryCardProps) {
  const { data, loading } = useFetch<Country[]>(
    `${RESTCOUNTRIES_BASE_URL}/name/${encodeURIComponent(countryName)}`
  );

  if (loading) {
    return <View style={styles.skeleton} />;
  }

  if (!data?.[0]) return null;

  const country = data[0];
  const currency = Object.values(country.currencies ?? {})[0];

  return (
    <View style={styles.card}>
      <Image
        source={{ uri: country.flags.png }}
        style={styles.flag}
      />
      <View style={styles.info}>
        <Text style={styles.name}>{country.name.common}</Text>
        <Text style={styles.detail}>Capital: {country.capital?.[0] ?? "—"}</Text>
        <Text style={styles.detail}>
          Currency: {currency?.name} ({currency?.symbol})
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    height: 80,
    borderRadius: 12,
    backgroundColor: "#2a2a2a",
    margin: 16,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1e1e1e",
    borderRadius: 12,
    padding: 16,
    margin: 16,
  },
  flag: {
    width: 60,
    height: 40,
    borderRadius: 4,
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  name: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  detail: {
    color: "#aaa",
    fontSize: 13,
  },
});