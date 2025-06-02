import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Text, useTheme } from 'react-native-paper';
import { useAppDispatch, useAppSelector } from '../../store';
import { verifyEmail } from '../../store/slices/authSlice';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/AppNavigator';

type Props = NativeStackScreenProps<AuthStackParamList, 'EmailVerification'>;

const EmailVerificationScreen = ({ route, navigation }: Props) => {
  const [verificationCode, setVerificationCode] = useState('');
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.auth);
  const theme = useTheme();
  const email = route.params?.email;

  const handleVerification = async () => {
    if (!verificationCode) {
      return;
    }

    try {
      await dispatch(verifyEmail(verificationCode)).unwrap();
      // If verification is successful, navigate to login
      navigation.replace('Login');
    } catch (error) {
      // Error is handled by the auth slice
      console.error('Verification failed:', error);
    }
  };

  const handleResendCode = () => {
    // TODO: Implement resend verification code functionality
    console.log('Resend code requested for:', email);
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
          Please enter the verification code sent to {email}
        </Text>
        
        <TextInput
          label="Verification Code"
          value={verificationCode}
          onChangeText={setVerificationCode}
          keyboardType="number-pad"
          style={styles.input}
          disabled={loading}
          error={!!error}
        />

        {error && (
          <Text style={[styles.error, { color: theme.colors.error }]}>
            {error}
          </Text>
        )}

        <Button
          mode="contained"
          onPress={handleVerification}
          loading={loading}
          disabled={loading || !verificationCode}
          style={styles.button}
        >
          Verify Email
        </Button>

        <Button
          mode="text"
          onPress={handleResendCode}
          style={styles.link}
          disabled={loading}
        >
          Didn't receive the code? Resend
        </Button>

        <Button
          mode="text"
          onPress={() => navigation.navigate('Login')}
          style={styles.link}
          disabled={loading}
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
  },
  button: {
    marginTop: 8,
  },
  link: {
    marginTop: 16,
  },
  error: {
    textAlign: 'center',
    marginBottom: 16,
  },
});

export default EmailVerificationScreen; 