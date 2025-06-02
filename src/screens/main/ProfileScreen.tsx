import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Card, Button, TextInput, useTheme, Divider } from 'react-native-paper';
import { useAppDispatch, useAppSelector } from '../../store';
import { logout } from '../../store/slices/authSlice';
import authService from '../../api/services/authService';

const ProfileScreen = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const theme = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    try {
      await dispatch(logout()).unwrap();
    } catch (error) {
      console.error('Logout failed:', error);
      Alert.alert('Error', 'Failed to logout. Please try again.');
    }
  };

  const handleUpdateProfile = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Name cannot be empty');
      return;
    }

    setLoading(true);
    try {
      // TODO: Implement profile update API call
      console.log('Updating profile with name:', name);
      setIsEditing(false);
    } catch (error) {
      console.error('Profile update failed:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.title}>
          Profile
        </Text>
      </View>

      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.section}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Personal Information
            </Text>
            <Divider style={styles.divider} />
            
            {isEditing ? (
              <TextInput
                label="Name"
                value={name}
                onChangeText={setName}
                style={styles.input}
                disabled={loading}
              />
            ) : (
              <View style={styles.infoRow}>
                <Text variant="bodyLarge">Name</Text>
                <Text variant="bodyLarge" style={styles.infoValue}>
                  {user?.name || 'Not set'}
                </Text>
              </View>
            )}

            <View style={styles.infoRow}>
              <Text variant="bodyLarge">Email</Text>
              <Text variant="bodyLarge" style={styles.infoValue}>
                {user?.email || 'Not set'}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text variant="bodyLarge">Email Verification</Text>
              <Text
                variant="bodyLarge"
                style={[
                  styles.infoValue,
                  { color: user?.isVerified ? theme.colors.primary : theme.colors.error },
                ]}
              >
                {user?.isVerified ? 'Verified' : 'Not Verified'}
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Account Settings
            </Text>
            <Divider style={styles.divider} />
            
            <Button
              mode="outlined"
              onPress={() => setIsEditing(!isEditing)}
              style={styles.button}
              disabled={loading}
            >
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </Button>

            {isEditing && (
              <Button
                mode="contained"
                onPress={handleUpdateProfile}
                loading={loading}
                disabled={loading}
                style={styles.button}
              >
                Save Changes
              </Button>
            )}

            <Button
              mode="outlined"
              onPress={() => {/* TODO: Implement change password */}}
              style={styles.button}
              disabled={loading}
            >
              Change Password
            </Button>

            <Button
              mode="outlined"
              onPress={handleLogout}
              style={[styles.button, styles.logoutButton]}
              textColor={theme.colors.error}
            >
              Logout
            </Button>
          </View>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    textAlign: 'center',
  },
  card: {
    margin: 16,
    elevation: 2,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 8,
  },
  divider: {
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoValue: {
    opacity: 0.8,
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
  },
  logoutButton: {
    borderColor: '#ff4444',
    marginTop: 16,
  },
});

export default ProfileScreen; 