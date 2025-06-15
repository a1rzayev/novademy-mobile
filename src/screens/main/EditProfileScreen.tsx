import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, Platform, TouchableOpacity, Image } from 'react-native';
import { Text, TextInput, Button, useTheme, HelperText } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../../store';
import authService, { SectorType } from '../../api/services/authService';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface EditProfileScreenProps {
  onSuccess?: () => void;
}

const EditProfileScreen: React.FC<EditProfileScreenProps> = ({ onSuccess }) => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || '',
    group: user?.group || 1,
    sector: user?.sector || SectorType.Azerbaijani,
    username: user?.username || '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user?.profilePictureUrl) {
      setProfilePicture(user.profilePictureUrl);
    }
  }, [user]);

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant permission to access your photos');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled) {
        setProfilePicture(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3 || formData.username.length > 20) {
      newErrors.username = 'Username must be between 3 and 20 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^0?\d{9}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Phone number must be 9 or 10 digits, optionally starting with 0';
    }

    if (formData.group < 1 || formData.group > 4) {
      newErrors.group = 'Group must be between 1 and 4';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('Username', formData.username.trim());
      formDataToSend.append('FirstName', formData.firstName.trim());
      formDataToSend.append('LastName', formData.lastName.trim());
      formDataToSend.append('Email', formData.email.trim().toLowerCase());
      formDataToSend.append('PhoneNumber', formData.phoneNumber.trim());
      formDataToSend.append('Group', formData.group.toString());
      formDataToSend.append('Sector', formData.sector.toString());

      if (profilePicture && profilePicture !== user?.profilePictureUrl) {
        const filename = profilePicture.split('/').pop() || 'profile.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';
        
        formDataToSend.append('ProfilePicture', {
          uri: profilePicture,
          type,
          name: filename,
        } as any);
      }

      const response = await authService.updateProfile(formDataToSend);
      
      if (response?.accessToken) {
        await AsyncStorage.setItem('authToken', response.accessToken);
        
        // Fetch fresh user data after successful update
        const updatedUserData = await authService.getCurrentUser();
        if (updatedUserData) {
          dispatch({ type: 'auth/setUser', payload: updatedUserData });
          // Call onSuccess before navigation to ensure data is updated
          onSuccess?.();
          // Navigate back to profile screen
          navigation.navigate('Profile' as never);
        }
      }
    } catch (error: any) {
      console.error('Profile update error:', error);
      if (error.response?.data?.errors) {
        const validationErrors = error.response.data.errors;
        setErrors(validationErrors);
      } else {
        Alert.alert(
          'Error',
          error.response?.data?.message || 'Failed to update profile. Please try again.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        <View style={styles.imageSection}>
          <TouchableOpacity onPress={pickImage} disabled={loading}>
            {profilePicture ? (
              <Image source={{ uri: profilePicture }} style={styles.profileImage} />
            ) : (
              <View style={[styles.placeholderImage, { backgroundColor: theme.colors.surfaceVariant }]}>
                <Ionicons name="person" size={40} color={theme.colors.onSurfaceVariant} />
              </View>
            )}
            <Text style={[styles.changePhotoText, { color: theme.colors.primary }]}>
              Change Photo
            </Text>
          </TouchableOpacity>
        </View>

        <TextInput
          label="First Name"
          value={formData.firstName}
          onChangeText={(text) => setFormData({ ...formData, firstName: text })}
          style={styles.input}
          disabled={loading}
          error={!!errors.firstName}
        />
        <HelperText type="error" visible={!!errors.firstName}>
          {errors.firstName}
        </HelperText>

        <TextInput
          label="Last Name"
          value={formData.lastName}
          onChangeText={(text) => setFormData({ ...formData, lastName: text })}
          style={styles.input}
          disabled={loading}
          error={!!errors.lastName}
        />
        <HelperText type="error" visible={!!errors.lastName}>
          {errors.lastName}
        </HelperText>

        <TextInput
          label="Email"
          value={formData.email}
          onChangeText={(text) => setFormData({ ...formData, email: text })}
          style={styles.input}
          disabled={loading}
          error={!!errors.email}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <HelperText type="error" visible={!!errors.email}>
          {errors.email}
        </HelperText>

        <TextInput
          label="Phone Number"
          value={formData.phoneNumber}
          onChangeText={(text) => setFormData({ ...formData, phoneNumber: text })}
          style={styles.input}
          disabled={loading}
          error={!!errors.phoneNumber}
          keyboardType="phone-pad"
        />
        <HelperText type="error" visible={!!errors.phoneNumber}>
          {errors.phoneNumber}
        </HelperText>

        <View style={styles.pickerContainer}>
          <Text style={[styles.pickerLabel, { color: theme.colors.onSurface }]}>Group</Text>
          <View style={[styles.picker, { backgroundColor: theme.colors.surfaceVariant }]}>
            <Picker
              selectedValue={formData.group}
              onValueChange={(value) => setFormData({ ...formData, group: value })}
              enabled={!loading}
              style={{ color: theme.colors.onSurface }}
            >
              <Picker.Item label="Group 1" value={1} />
              <Picker.Item label="Group 2" value={2} />
              <Picker.Item label="Group 3" value={3} />
              <Picker.Item label="Group 4" value={4} />
            </Picker>
          </View>
        </View>

        <View style={styles.pickerContainer}>
          <Text style={[styles.pickerLabel, { color: theme.colors.onSurface }]}>Sector</Text>
          <View style={[styles.picker, { backgroundColor: theme.colors.surfaceVariant }]}>
            <Picker
              selectedValue={formData.sector}
              onValueChange={(value) => setFormData({ ...formData, sector: value })}
              enabled={!loading}
              style={{ color: theme.colors.onSurface }}
            >
              <Picker.Item label="Azerbaijani" value={SectorType.Azerbaijani} />
              <Picker.Item label="Russian" value={SectorType.Russian} />
              <Picker.Item label="English" value={SectorType.English} />
            </Picker>
          </View>
        </View>

        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={loading}
          disabled={loading}
          style={styles.submitButton}
        >
          Save Changes
        </Button>

        <Button
          mode="outlined"
          onPress={() => navigation.goBack()}
          disabled={loading}
          style={styles.cancelButton}
        >
          Cancel
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  imageSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  placeholderImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  changePhotoText: {
    marginTop: 8,
    textAlign: 'center',
  },
  input: {
    marginBottom: 8,
  },
  pickerContainer: {
    marginBottom: 16,
  },
  pickerLabel: {
    fontSize: 16,
    marginBottom: 8,
  },
  picker: {
    borderRadius: 4,
    overflow: 'hidden',
  },
  submitButton: {
    marginTop: 20,
  },
  cancelButton: {
    marginTop: 10,
  },
});

export default EditProfileScreen; 