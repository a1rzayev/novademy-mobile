import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import * as ImagePicker from 'expo-image-picker';
import authService, { SectorType } from '../../api/services/authService';
import Toast from 'react-native-toast-message';

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

const sectorMap: { [key: string]: SectorType } = {
  'AZ': SectorType.Azerbaijani,
  'RU': SectorType.Russian,
  'EN': SectorType.English,
};

const sectorMapReverse: { [key in SectorType]: string } = {
  [SectorType.Azerbaijani]: 'AZ',
  [SectorType.Russian]: 'RU',
  [SectorType.English]: 'EN',
};

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const RegisterScreen = ({ navigation }: Props) => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    roleId: 3, // Student role
    group: 1,
    sector: SectorType.Azerbaijani,
  });
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const showToast = (type: 'success' | 'error' | 'warning', message: string) => {
    Toast.show({
      type,
      text1: type === 'success' ? 'Success' : type === 'warning' ? 'Warning' : 'Error',
      text2: message,
      position: 'top',
      visibilityTime: 4000,
      autoHide: true,
      topOffset: Platform.OS === 'ios' ? 50 : 30,
    });
  };

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

  const validatePassword = (password: string): boolean => {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasDigit = /\d/.test(password);
    return hasUpperCase && hasLowerCase && hasDigit;
  };

  const validateForm = () => {
    const errors: string[] = [];

    try {
      if (!formData.username.trim()) {
        errors.push('Username is required');
      } else if (formData.username.length < 3) {
        errors.push('Username must be at least 3 characters long');
      }

      if (!formData.password) {
        errors.push('Password is required');
      } else if (formData.password.length < 6) {
        errors.push('Password must be at least 6 characters long');
      } else if (!validatePassword(formData.password)) {
        errors.push('Password must contain at least one uppercase letter, one lowercase letter, and one digit');
      }

      if (!formData.firstName.trim()) {
        errors.push('First name is required');
      }

      if (!formData.lastName.trim()) {
        errors.push('Last name is required');
      }

      if (!formData.email.trim()) {
        errors.push('Email is required');
      } else if (!validateEmail(formData.email)) {
        errors.push('Please enter a valid email address');
      }

      if (!formData.phoneNumber.trim()) {
        errors.push('Phone number is required');
      } else if (!/^0?\d{9}$/.test(formData.phoneNumber.replace(/\s+/g, ''))) {
        errors.push('Phone number must be exactly 9 digits, optionally starting with 0');
      }

      return errors;
    } catch (error) {
      console.error('Form validation error:', error);
      return ['An error occurred while validating the form'];
    }
  };

  const handleRegister = async () => {
    try {
      // Validate form
      const validationErrors = validateForm();
      if (validationErrors.length > 0) {
        showToast('warning', validationErrors.join('\n'));
        return;
      }

      // Start registration process
      setIsLoading(true);
      console.log('Starting registration with data:', {
        ...formData,
        hasProfilePicture: !!profilePicture
      });
      
      try {
        const response = await authService.register({
          ...formData,
          profilePicture: profilePicture || undefined,
        });

        console.log('Registration successful, navigating to email verification');
        
        if (!response?.id) {
          throw new Error('Invalid user ID received from server');
        }

        showToast('success', 'Registration successful! Please check your email for verification code.');
        
        // Navigate after a short delay to allow the success toast to be seen
        setTimeout(() => {
          navigation.navigate('EmailVerification', { 
            email: formData.email.toLowerCase(),
            userId: response.id.toLowerCase()
          });
        }, 1500);

      } catch (error: any) {
        console.error('Registration service error:', error);

        // Handle specific error cases
        if (error.response?.status === 400) {
          const errorMessage = error.response.data;
          if (typeof errorMessage === 'string' && errorMessage.includes('Validation failed')) {
            // Extract validation message without the "Validation failed:" prefix
            const cleanMessage = errorMessage.replace('Validation failed:', '').trim();
            showToast('warning', cleanMessage);
          } else {
            const errors = error.response.data.errors || {};
            const errorMessages = Object.entries(errors)
              .map(([field, messages]) => `${field}: ${(messages as string[]).join(', ')}`)
              .join('\n');
            showToast('warning', errorMessages || 'Please check your input and try again');
          }
        } else if (error.response?.status === 409) {
          const errorMessage = error.response.data;
          if (typeof errorMessage === 'string') {
            if (errorMessage.includes('Email')) {
              showToast('warning', 'This email is already registered. Please use a different email or try logging in.');
              setTimeout(() => {
                setFormData(prev => ({ ...prev, email: '' }));
              }, 2000);
            } else if (errorMessage.includes('Username')) {
              showToast('warning', 'This username is already taken. Please choose a different one.');
              setTimeout(() => {
                setFormData(prev => ({ ...prev, username: '' }));
              }, 2000);
            } else {
              showToast('warning', errorMessage);
            }
          } else {
            showToast('warning', 'Username, email, or phone number already exists');
          }
        } else if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
          showToast('error', 'Request timed out. Please check your connection and try again.');
        } else if (!error.response) {
          showToast('error', 'Network error. Please check your internet connection and try again.');
        } else if (error.response?.status === 500 || error.response?.status === 503) {
          showToast('error', 'Server is currently unavailable. Please try again in a few moments.');
        } else {
          showToast('error', error.response?.data?.message || 'Registration failed. Please try again.');
        }
      }
    } catch (error) {
      console.error('Unexpected error during registration:', error);
      showToast('error', 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.formContainer}>
          <Text style={styles.title}>Create Account</Text>

          <TouchableOpacity 
            style={styles.imagePicker} 
            onPress={pickImage}
            disabled={isLoading}
          >
            {profilePicture ? (
              <Image source={{ uri: profilePicture }} style={styles.profileImage} />
            ) : (
              <View style={styles.placeholderImage}>
                <Text style={styles.placeholderText}>Add Photo</Text>
              </View>
            )}
          </TouchableOpacity>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Username *</Text>
            <TextInput
              style={styles.input}
              value={formData.username}
              onChangeText={(text) => setFormData({ ...formData, username: text })}
              autoCapitalize="none"
              editable={!isLoading}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password *</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.input, styles.passwordInput]}
                value={formData.password}
                onChangeText={(text) => setFormData({ ...formData, password: text })}
                secureTextEntry={!showPassword}
                editable={!isLoading}
              />
              <TouchableOpacity
                style={styles.passwordToggle}
                onPress={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={24}
                  color="#666"
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>First Name *</Text>
            <TextInput
              style={styles.input}
              value={formData.firstName}
              onChangeText={(text) => setFormData({ ...formData, firstName: text })}
              editable={!isLoading}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Last Name *</Text>
            <TextInput
              style={styles.input}
              value={formData.lastName}
              onChangeText={(text) => setFormData({ ...formData, lastName: text })}
              editable={!isLoading}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email *</Text>
            <TextInput
              style={styles.input}
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!isLoading}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone Number *</Text>
            <TextInput
              style={styles.input}
              value={formData.phoneNumber}
              onChangeText={(text) => {
                // Only allow digits and optionally a leading 0
                const cleaned = text.replace(/[^\d]/g, '');
                if (cleaned.length <= 10 && (cleaned.length === 0 || cleaned[0] === '0' || cleaned.length <= 9)) {
                  setFormData({ ...formData, phoneNumber: cleaned });
                }
              }}
              keyboardType="phone-pad"
              maxLength={10}
              placeholder="Enter 9 digits (e.g., 0123456789)"
              editable={!isLoading}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Group *</Text>
            <Picker
              selectedValue={formData.group}
              onValueChange={(value) => setFormData({ ...formData, group: value })}
              enabled={!isLoading}
              style={styles.picker}
            >
              <Picker.Item label="1" value={1} />
              <Picker.Item label="2" value={2} />
              <Picker.Item label="3" value={3} />
              <Picker.Item label="4" value={4} />
            </Picker>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Sector *</Text>
            <Picker
              selectedValue={sectorMapReverse[formData.sector]}
              onValueChange={(value) => setFormData({ ...formData, sector: sectorMap[value] })}
              enabled={!isLoading}
              style={styles.picker}
            >
              <Picker.Item label="AZ" value="AZ" />
              <Picker.Item label="RU" value="RU" />
              <Picker.Item label="EN" value="EN" />
            </Picker>
          </View>

          <TouchableOpacity 
            style={[styles.button, isLoading && styles.buttonDisabled]} 
            onPress={handleRegister}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Register</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => navigation.navigate('Login')}
            disabled={isLoading}
          >
            <Text style={styles.linkText}>
              Already have an account? Login here
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
  },
  formContainer: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 15,
    borderRadius: 10,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  imagePicker: {
    alignSelf: 'center',
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
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#666',
    fontSize: 14,
  },
  picker: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  linkButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  linkText: {
    color: '#007AFF',
    fontSize: 14,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    backgroundColor: '#fff',
  },
  passwordInput: {
    flex: 1,
    borderWidth: 0,
    marginBottom: 0,
  },
  passwordToggle: {
    padding: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default RegisterScreen; 