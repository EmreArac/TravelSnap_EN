// app/trip/edit/[id].tsx
import { useTrips } from '@/context/TripContext';
import { TripFormData, tripSchema } from '@/types/tripSchema';
import { saveImageToTrip } from '@/utils/imageStorage';
import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigation, usePreventRemove } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

export default function EditTripScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { trips, updateTrip } = useTrips();
  const navigation = useNavigation();

  const trip = useMemo(
    () => trips.find((t) => t.id === id),
    [trips, id]
  );

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting, isDirty },
  } = useForm<TripFormData>({
    resolver: zodResolver(tripSchema),
    mode: 'onBlur',
  });

  useEffect(() => {
    if (!trip) return;
    reset({
      title: trip.title,
      destination: trip.destination,
      date: trip.date,
      rating: trip.rating,
      imageUri: trip.imageUri,
      galleryUris: trip.galleryUris,
    });
  }, [trip, reset]);

  usePreventRemove(isDirty, ({ data }) => {
    Alert.alert(
      'Discard changes?',
      'You have unsaved changes. Are you sure you want to leave?',
      [
        { text: 'Stay', style: 'cancel' },
        {
          text: 'Discard',
          style: 'destructive',
          onPress: () => navigation.dispatch(data.action),
        },
      ]
    );
  });

  const pickImage = async (onChange: (uri: string) => void) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });
    if (!result.canceled) {
      const saved = await saveImageToTrip(result.assets[0].uri, id ?? 'edit');
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
      const saved = await saveImageToTrip(result.assets[0].uri, id ?? 'edit');
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
    if (!trip) return;
    try {
      await updateTrip(trip.id, data);
      router.back();
    } catch (err) {
      Alert.alert('Could not update', String(err));
    }
  };

  if (!trip) {
    return (
      <View style={styles.center}>
        <Text style={styles.notFound}>Trip not found</Text>
      </View>
    );
  }

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
        <Text style={styles.formTitle}>Edit trip</Text>

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
                value={String(field.value ?? '')}
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
          style={[styles.updateButton, isSubmitting && styles.updateButtonDisabled]}
          onPress={handleSubmit(onSubmit)}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#0A1628" />
          ) : (
            <Text style={styles.updateButtonText}>Update Trip</Text>
          )}
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
    padding: 16,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0A1628',
  },
  notFound: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  formTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
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
    backgroundColor: '#1A2744',
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
  updateButton: {
    backgroundColor: '#61DAFB',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  updateButtonDisabled: {
    opacity: 0.5,
  },
  updateButtonText: {
    color: '#0A1628',
    fontWeight: 'bold',
    fontSize: 16,
  },
});