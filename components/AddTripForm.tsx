// components/AddTripForm.tsx
import { useTrips } from '@/context/TripContext';
import { TripFormData, tripSchema } from '@/types/tripSchema';
import { saveImageToTrip } from '@/utils/imageStorage';
import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

export default function AddTripForm() {
  const { addTrip } = useTrips();

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
    reset,
  } = useForm<TripFormData>({
    resolver: zodResolver(tripSchema),
    mode: 'onBlur',
    defaultValues: {
      title: '',
      destination: '',
      date: '',
      rating: 3,
      galleryUris: [],
    },
  });

  const pickImage = async (onChange: (uri: string) => void) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });
    if (!result.canceled) {
      const tempId = Date.now().toString();
      const saved = await saveImageToTrip(result.assets[0].uri, tempId);
      onChange(saved);
    }
  };

  const takePhoto = async (onChange: (uri: string) => void) => {
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
      const tempId = Date.now().toString();
      const saved = await saveImageToTrip(result.assets[0].uri, tempId);
      onChange(saved);
    }
  };

  const handleAddPhoto = (onChange: (uri: string) => void) => {
    Alert.alert('Add photo', 'Choose source', [
      { text: 'Gallery', onPress: () => pickImage(onChange) },
      { text: 'Camera', onPress: () => takePhoto(onChange) },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const onSubmit = async (data: TripFormData) => {
    try {
      let coordinates: { latitude: number; longitude: number } | undefined;

      try {
        const results = await Location.geocodeAsync(data.destination);
        if (results.length > 0) {
          coordinates = {
            latitude: results[0].latitude,
            longitude: results[0].longitude,
          };
        }
      } catch {
        // Geocoding failed (no internet etc.) — trip still saves
      }

      await addTrip({ ...data, coordinates });
      reset();
      router.back();
    } catch (err) {
      Alert.alert('Could not save', String(err));
    }
  };

  return (
    <View style={styles.form}>
      <Text style={styles.formTitle}>Add new trip</Text>

      {/* Image Picker */}
      <Controller
        control={control}
        name="imageUri"
        render={({ field }) => (
          <View>
            {field.value ? (
              <View>
                <Image source={{ uri: field.value }} style={styles.preview} />
                <Pressable onPress={() => handleAddPhoto(field.onChange)}>
                  <Text style={styles.changeBtn}>Change photo</Text>
                </Pressable>
              </View>
            ) : (
              <Pressable
                style={styles.imagePicker}
                onPress={() => handleAddPhoto(field.onChange)}
              >
                <Ionicons name="camera-outline" size={32} color="#61DAFB" />
                <Text style={styles.pickerText}>Add a photo</Text>
              </Pressable>
            )}
          </View>
        )}
      />

      {/* Title */}
      <Controller
        control={control}
        name="title"
        render={({ field, fieldState }) => (
          <View>
            <TextInput
              style={[styles.input, fieldState.error && styles.inputError]}
              placeholder="Title"
              placeholderTextColor="#8B95A5"
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              autoFocus={true}
            />
            {fieldState.error && (
              <Text style={styles.errorText}>{fieldState.error.message}</Text>
            )}
          </View>
        )}
      />

      {/* Destination */}
      <Controller
        control={control}
        name="destination"
        render={({ field, fieldState }) => (
          <View>
            <TextInput
              style={[styles.input, fieldState.error && styles.inputError]}
              placeholder="Destination"
              placeholderTextColor="#8B95A5"
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
            />
            {fieldState.error && (
              <Text style={styles.errorText}>{fieldState.error.message}</Text>
            )}
          </View>
        )}
      />

      {/* Date */}
      <Controller
        control={control}
        name="date"
        render={({ field, fieldState }) => (
          <View>
            <TextInput
              style={[styles.input, fieldState.error && styles.inputError]}
              placeholder="Date (YYYY-MM-DD)"
              placeholderTextColor="#8B95A5"
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
            />
            {fieldState.error && (
              <Text style={styles.errorText}>{fieldState.error.message}</Text>
            )}
          </View>
        )}
      />

      {/* Rating */}
      <Controller
        control={control}
        name="rating"
        render={({ field, fieldState }) => (
          <View>
            <TextInput
              style={[styles.input, fieldState.error && styles.inputError]}
              placeholder="Rating (1-5)"
              placeholderTextColor="#8B95A5"
              value={field.value === 3 && !field.value ? '' : String(field.value)}
              onChangeText={(text) => field.onChange(Number(text))}
              onBlur={field.onBlur}
              keyboardType="numeric"
            />
            {fieldState.error && (
              <Text style={styles.errorText}>{fieldState.error.message}</Text>
            )}
          </View>
        )}
      />

      {/* Submit */}
      <Pressable
        style={[styles.addButton, isSubmitting && styles.addButtonDisabled]}
        onPress={handleSubmit(onSubmit)}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <ActivityIndicator color="#0A1628" />
        ) : (
          <Text style={styles.addButtonText}>Add Trip</Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    backgroundColor: '#1A2744',
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#FFFFFF',
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
    marginBottom: 12,
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
    marginBottom: 4,
    fontSize: 16,
    color: '#FFFFFF',
    backgroundColor: '#0A1628',
  },
  inputError: {
    borderColor: '#E94560',
    borderWidth: 1.5,
  },
  errorText: {
    color: '#E94560',
    fontSize: 12,
    marginTop: 4,
    marginBottom: 8,
  },
  addButton: {
    backgroundColor: '#61DAFB',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  addButtonDisabled: {
    opacity: 0.5,
  },
  addButtonText: {
    color: '#0A1628',
    fontWeight: 'bold',
    fontSize: 16,
  },
});