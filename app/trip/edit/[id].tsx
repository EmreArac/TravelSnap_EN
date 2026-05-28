// app/trip/edit/[id].tsx
import { useTrips } from '@/context/TripContext';
import { saveImageToTrip } from '@/utils/imageStorage';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export default function EditTripScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { trips, updateTrip } = useTrips();
  const router = useRouter();

  const trip = trips.find((t) => t.id === id);

  if (!trip) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Trip not found.</Text>
      </View>
    );
  }

  const [title, setTitle] = useState(trip.title);
  const [destination, setDestination] = useState(trip.destination);
  const [date, setDate] = useState(trip.date);
  const [rating, setRating] = useState(trip.rating.toString());
  const [imageUri, setImageUri] = useState<string | undefined>(trip.imageUri);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });
    if (!result.canceled) {
      const saved = await saveImageToTrip(result.assets[0].uri, id);
      setImageUri(saved);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'We need camera access to take photos');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled) {
      const saved = await saveImageToTrip(result.assets[0].uri, id);
      setImageUri(saved);
    }
  };

  const handleAddPhoto = () => {
    Alert.alert('Add photo', 'Choose source', [
      { text: 'Gallery', onPress: pickImage },
      { text: 'Camera', onPress: takePhoto },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleSave = async () => {
    if (!title.trim() || !destination.trim() || !date.trim() || !rating.trim()) {
      Alert.alert('Error', 'All fields are required!');
      return;
    }
    if (!DATE_REGEX.test(date)) {
      Alert.alert('Error', 'Date must be in YYYY-MM-DD format!');
      return;
    }
    const ratingNum = Number(rating);
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      Alert.alert('Error', 'Rating must be a number between 1 and 5!');
      return;
    }

    await updateTrip(id, {
      title: title.trim(),
      destination: destination.trim(),
      date: date.trim(),
      rating: ratingNum,
      imageUri,
    });

    router.back();
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Edit Trip',
          headerStyle: { backgroundColor: '#0A1628' },
          headerTintColor: '#61DAFB',
        }}
      />

      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {imageUri ? (
          <View>
            <Image source={{ uri: imageUri }} style={styles.preview} />
            <Pressable onPress={handleAddPhoto}>
              <Text style={styles.changeBtn}>Change photo</Text>
            </Pressable>
          </View>
        ) : (
          <Pressable style={styles.imagePicker} onPress={handleAddPhoto}>
            <Ionicons name="camera-outline" size={32} color="#61DAFB" />
            <Text style={styles.pickerText}>Add a photo</Text>
          </Pressable>
        )}

        <TextInput
          style={styles.input}
          placeholder="Title"
          placeholderTextColor="#8B95A5"
          value={title}
          onChangeText={setTitle}
        />
        <TextInput
          style={styles.input}
          placeholder="Destination"
          placeholderTextColor="#8B95A5"
          value={destination}
          onChangeText={setDestination}
        />
        <TextInput
          style={styles.input}
          placeholder="Date (YYYY-MM-DD)"
          placeholderTextColor="#8B95A5"
          value={date}
          onChangeText={setDate}
        />
        <TextInput
          style={styles.input}
          placeholder="Rating (1-5)"
          placeholderTextColor="#8B95A5"
          value={rating}
          onChangeText={setRating}
          keyboardType="numeric"
        />

        <Pressable style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save Changes</Text>
        </Pressable>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A1628',
  },
  content: {
    padding: 24,
  },
  preview: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
  },
  changeBtn: {
    color: '#61DAFB',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 12,
    fontSize: 14,
  },
  imagePicker: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#243352',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  pickerText: {
    color: '#8B95A5',
    marginTop: 8,
    fontSize: 14,
  },
  input: {
    borderWidth: 1,
    borderColor: '#243352',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
    color: '#FFFFFF',
    backgroundColor: '#1A2744',
  },
  saveButton: {
    backgroundColor: '#61DAFB',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonText: {
    color: '#0A1628',
    fontWeight: 'bold',
    fontSize: 16,
  },
  errorText: {
    color: '#8B95A5',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 40,
  },
});