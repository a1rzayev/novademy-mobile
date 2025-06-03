import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Text, useTheme } from 'react-native-paper';
import { useAppDispatch, useAppSelector } from '../../store';
import { verifyEmail } from '../../store/slices/authSlice';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/AppNavigator';
import Toast from 'react-native-toast-message';

type Props = NativeStackScreenProps<AuthStackParamList, 'EmailVerification'>;

const EmailVerificationScreen = ({ route, navigation }: Props) => {
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const { email, userId } = route.params;

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

  const validateCode = (code: string): boolean => {
    // Remove any non-digit characters
    const cleanCode = code.replace(/\D/g, '');
    // Check if code is exactly 4 digits
    return cleanCode.length === 4;
  };

  const handleVerification = async () => {
    try {
      if (!verificationCode) {
        showToast('warning', 'Please enter the verification code');
        return;
      }

      // Clean and validate the code
      const cleanCode = verificationCode.replace(/\D/g, '');
      if (!validateCode(cleanCode)) {
        showToast('warning', 'Please enter a valid 4-digit verification code');
        return;
      }

      setIsLoading(true);
      console.log('Verifying email with:', { userId, code: cleanCode });

      try {
        await dispatch(verifyEmail({ userId, code: cleanCode })).unwrap();
        showToast('success', 'Email verified successfully! You can now login.');
        
        // Navigate to login after a short delay
        setTimeout(() => {
          navigation.replace('Login');
        }, 1500);
      } catch (error: any) {
        console.error('Verification error:', error);
        
        // Handle specific error cases
        if (typeof error === 'string') {
          // This is our formatted error message from the thunk
          showToast('warning', error);
        } else if (error.response?.status === 400) {
          const errorData = error.response.data;
          if (errorData?.errors) {
            const errorMessages = Object.entries(errorData.errors)
              .map(([field, messages]) => {
                if (field === '$.userId') {
                  return 'Invalid user ID format';
                }
                if (field === 'request') {
                  return 'Invalid verification request';
                }
                return `${field}: ${(messages as string[]).join(', ')}`;
              })
              .join('\n');
            showToast('warning', errorMessages);
          } else {
            showToast('warning', errorData?.message || 'Invalid verification code');
          }
        } else if (error.response?.status === 404) {
          showToast('error', 'Verification code expired. Please request a new one.');
        } else if (!error.response) {
          showToast('error', 'Network error. Please check your connection and try again.');
        } else {
          showToast('error', 'Verification failed. Please try again.');
        }
      }
    } catch (error) {
      console.error('Unexpected error during verification:', error);
      showToast('error', 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    try {
      setIsLoading(true);
      // TODO: Implement resend verification code functionality
      showToast('success', 'A new verification code has been sent to your email.');
    } catch (error) {
      console.error('Resend code error:', error);
      showToast('error', 'Failed to resend verification code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.content}>
        <Text variant="headlineMedium" style={styles.title}>
          Verify Your Email
        </Text>

        <Text style={styles.description}>
          Please enter the 4-digit verification code sent to {email}
        </Text>
        
        <TextInput
          label="Verification Code"
          value={verificationCode}
          onChangeText={(text) => {
            // Only allow digits and limit to 4 characters
            const cleanText = text.replace(/\D/g, '').slice(0, 4);
            setVerificationCode(cleanText);
          }}
          keyboardType="number-pad"
          maxLength={4}
          style={styles.input}
          disabled={isLoading}
          error={!validateCode(verificationCode) && verificationCode.length > 0}
          placeholder="Enter 4-digit code"
        />

        <Button
          mode="contained"
          onPress={handleVerification}
          loading={isLoading}
          disabled={isLoading || !validateCode(verificationCode)}
          style={styles.button}
        >
          Verify Email
        </Button>

        <Button
          mode="text"
          onPress={handleResendCode}
          style={styles.link}
          disabled={isLoading}
        >
          Didn't receive the code? Resend
        </Button>

        <Button
          mode="text"
          onPress={() => navigation.navigate('Login')}
          style={styles.link}
          disabled={isLoading}
        >
          Back to Login
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    textAlign: 'center',
    marginBottom: 24,
    opacity: 0.7,
  },
  input: {
    marginBottom: 16,
    textAlign: 'center',
    letterSpacing: 8,
    fontSize: 24,
  },
  button: {
    marginTop: 8,
  },
  link: {
    marginTop: 16,
  },
});

export default EmailVerificationScreen; 