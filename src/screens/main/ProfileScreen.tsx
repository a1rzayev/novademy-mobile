import React, { useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Alert, Image } from 'react-native';
import { Text, Card, Button, TextInput, useTheme, Divider } from 'react-native-paper';
import { useAppDispatch, useAppSelector } from '../../store';
import { logout } from '../../store/slices/authSlice';
import authService from '../../api/services/authService';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import EditProfileScreen from './EditProfileScreen';
import { getTranslation } from '../../translations';

type ProfileScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const ProfileScreen = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const currentLanguage = useAppSelector((state) => state.language.currentLanguage);
  const theme = useTheme();
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const userData = await authService.getCurrentUser();
      if (userData) {
        dispatch({ type: 'auth/setUser', payload: userData });
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      Alert.alert(
        getTranslation('common.error', currentLanguage),
        getTranslation('common.error', currentLanguage)
      );
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      console.log('Profile screen focused, fetching data...');
      fetchUserData();
    }, [])
  );

  const handleLogout = async () => {
    try {
      await dispatch(logout()).unwrap();
    } catch (error) {
      console.error('Logout failed:', error);
      Alert.alert(
        getTranslation('common.error', currentLanguage),
        getTranslation('common.error', currentLanguage)
      );
    }
  };

  const handleEditProfile = () => {
    setIsEditing(true);
  };

  const handleEditSuccess = async () => {
    console.log('Edit success, refreshing profile data...');
    await fetchUserData();
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <EditProfileScreen
        onSuccess={handleEditSuccess}
      />
    );
  }

  if (!user) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text>{getTranslation('common.loading', currentLanguage)}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        <View style={styles.imageSection}>
          {user.profilePictureUrl ? (
            <Image 
              source={{ uri: user.profilePictureUrl }} 
              style={styles.profileImage}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.placeholderImage, { backgroundColor: theme.colors.surfaceVariant }]}>
              <Text style={{ fontSize: 40, color: theme.colors.onSurfaceVariant }}>
                {user.firstName[0]}{user.lastName[0]}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.infoSection}>
          <Text style={[styles.label, { color: theme.colors.onSurface }]}>
            {getTranslation('profile.username', currentLanguage)}
          </Text>
          <Text style={[styles.value, { color: theme.colors.onSurface }]}>{user.username}</Text>

          <Text style={[styles.label, { color: theme.colors.onSurface }]}>
            {getTranslation('profile.firstName', currentLanguage)}
          </Text>
          <Text style={[styles.value, { color: theme.colors.onSurface }]}>{user.firstName}</Text>

          <Text style={[styles.label, { color: theme.colors.onSurface }]}>
            {getTranslation('profile.lastName', currentLanguage)}
          </Text>
          <Text style={[styles.value, { color: theme.colors.onSurface }]}>{user.lastName}</Text>

          <Text style={[styles.label, { color: theme.colors.onSurface }]}>
            {getTranslation('profile.email', currentLanguage)}
          </Text>
          <Text style={[styles.value, { color: theme.colors.onSurface }]}>{user.email}</Text>

          <Text style={[styles.label, { color: theme.colors.onSurface }]}>
            {getTranslation('profile.phoneNumber', currentLanguage)}
          </Text>
          <Text style={[styles.value, { color: theme.colors.onSurface }]}>{user.phoneNumber}</Text>

          <Text style={[styles.label, { color: theme.colors.onSurface }]}>
            {getTranslation('profile.group', currentLanguage)}
          </Text>
          <Text style={[styles.value, { color: theme.colors.onSurface }]}>
            {getTranslation('profile.group', currentLanguage)} {user.group}
          </Text>

          <Text style={[styles.label, { color: theme.colors.onSurface }]}>
            {getTranslation('profile.sector', currentLanguage)}
          </Text>
          <Text style={[styles.value, { color: theme.colors.onSurface }]}>{user.sector}</Text>
        </View>

        <Button
          mode="contained"
          onPress={handleEditProfile}
          style={styles.editButton}
          loading={loading}
        >
          {getTranslation('profile.editProfile', currentLanguage)}
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
  infoSection: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 4,
  },
  value: {
    fontSize: 18,
    marginBottom: 16,
  },
  editButton: {
    marginTop: 20,
  },
});

export default ProfileScreen; 