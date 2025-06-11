import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, TextInput } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { authApi } from '../../services/api';

const EmailVerificationScreen = () => {
  const [code, setCode] = useState<string[]>(['', '', '', '']);
  const [userId, setUserId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation();
  const route = useRoute();

  useEffect(() => {
    if (route.params?.userId) {
      setUserId(route.params.userId);
    } else {
      Alert.alert(
        'Error',
        'User ID not provided. Please register again.',
        [{ text: 'OK', onPress: () => navigation.navigate('Register' as never) }]
      );
    }
  }, [route.params]);

  const handleInputChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // Only allow digits
    
    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);
  };

  const handleSubmit = async () => {
    const verificationCode = code.join('');
    
    if (verificationCode.length !== 4) {
      Alert.alert('Error', 'Please enter the full 4-digit code.');
      return;
    }

    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId)) {
      Alert.alert('Error', 'Invalid user ID format. Please register again.');
      setTimeout(() => navigation.navigate('Register' as never), 3000);
      return;
    }

    const cleanCode = verificationCode.replace(/\D/g, '');
    if (!/^\d{4}$/.test(cleanCode)) {
      Alert.alert('Error', 'Invalid verification code format. Expected exactly 4 digits.');
      return;
    }

    setIsLoading(true);

    try {
      await authApi.verifyEmail({
        userId: userId.toLowerCase(),
        code: cleanCode
      });

      Alert.alert(
        'Success',
        'Email verified successfully! Redirecting to login...',
        [{ text: 'OK', onPress: () => navigation.navigate('Login' as never) }]
      );
    } catch (error: any) {
      let errorMessage = 'Verification failed. Please try again.';
      
      if (error.response?.data) {
        const errorData = error.response.data;
        if (typeof errorData === 'string') {
          errorMessage = errorData;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }

        if (errorMessage.includes('already verified')) {
          Alert.alert(
            'Info',
            'This email is already verified. You can now login.',
            [{ text: 'OK', onPress: () => navigation.navigate('Login' as never) }]
          );
          return;
        }
      }

      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Email Verification</Text>
      <Text style={styles.subtitle}>Please enter the 4-digit code sent to your email</Text>
      
      <View style={styles.codeContainer}>
        {[0, 1, 2, 3].map((index) => (
          <TextInput
            key={index}
            style={styles.codeInput}
            maxLength={1}
            keyboardType="number-pad"
            value={code[index]}
            onChangeText={(value) => handleInputChange(index, value)}
            editable={!isLoading}
          />
        ))}
      </View>

      <TouchableOpacity
        style={[styles.button, isLoading && styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Verify Email</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 30,
  },
  codeInput: {
    width: 60,
    height: 60,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginHorizontal: 5,
    fontSize: 24,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default EmailVerificationScreen; 